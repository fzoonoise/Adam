import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const ORDER_BINDING_COOKIE = 'mm_papermag_order'
const ORDER_BINDING_MAX_AGE = 60 * 60 * 2

/**
 * 以 NewebPay 規範（HashKey=<key>&<TradeInfo>&HashIV=<iv> 做 SHA256）重算 TradeSha，
 * 和藍新回傳的 TradeSha 比對，任何不符都視為無效。
 *
 * @param {unknown} tradeInfo
 * @param {unknown} tradeSha
 * @param {string} key
 * @param {string} iv
 * @returns {boolean}
 */
export function verifyTradeSha(tradeInfo, tradeSha, key, iv) {
  if (
    typeof tradeInfo !== 'string' ||
    typeof tradeSha !== 'string' ||
    !tradeInfo ||
    !tradeSha
  ) {
    return false
  }
  const expected = createHash('sha256')
    .update(`HashKey=${key}&${tradeInfo}&HashIV=${iv}`, 'ascii')
    .digest('hex')
    .toUpperCase()
  const actual = tradeSha.toUpperCase()
  if (expected.length !== actual.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
}

/**
 * 只接受藍新回傳的 JSON 結構（{ Status, Message, Result: { MerchantOrderNo, ... } }），
 * 其他格式（例如用 getEncryptedFormPostData 自己加密出來的 querystring）一律視為無效。
 *
 * @param {unknown} decryptedTradeInfo
 * @returns {{ status: string, merchantOrderNo: string, result: Record<string, unknown> } | null}
 */
export function parseNewebpayCallback(decryptedTradeInfo) {
  if (!decryptedTradeInfo || typeof decryptedTradeInfo !== 'object') {
    return null
  }
  const { Status, Result } = /** @type {Record<string, unknown>} */ (
    decryptedTradeInfo
  )
  if (typeof Status !== 'string' || !Result || typeof Result !== 'object') {
    return null
  }
  const merchantOrderNo = /** @type {Record<string, unknown>} */ (Result)
    .MerchantOrderNo
  if (
    (typeof merchantOrderNo !== 'string' &&
      typeof merchantOrderNo !== 'number') ||
    merchantOrderNo === ''
  ) {
    return null
  }
  return {
    status: Status,
    merchantOrderNo: String(merchantOrderNo),
    result: /** @type {Record<string, unknown>} */ (Result),
  }
}

/**
 * @param {string} key
 * @param {string} iv
 * @returns {string}
 */
export function getOrderBindingSecret(key, iv) {
  return `${key}:${iv}`
}

/**
 * @param {string} orderNumber
 * @param {string} secret
 * @returns {string}
 */
function signOrderNumber(orderNumber, secret) {
  return createHmac('sha256', secret).update(String(orderNumber)).digest('hex')
}

/**
 * 下單當下發給瀏覽器的綁定 cookie；結果頁只對持有同一張 cookie 的瀏覽器顯示訂購人資料。
 * 藍新是跨站 POST 回來，所以要 SameSite=None + Secure 才帶得到。
 *
 * @param {string} orderNumber
 * @param {string} secret
 * @returns {string}
 */
export function buildOrderBindingCookie(orderNumber, secret) {
  const value = `${orderNumber}.${signOrderNumber(orderNumber, secret)}`
  return [
    `${ORDER_BINDING_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/papermag/return',
    `Max-Age=${ORDER_BINDING_MAX_AGE}`,
    'HttpOnly',
    'Secure',
    'SameSite=None',
  ].join('; ')
}

/**
 * @param {unknown} cookieHeader
 * @param {string} name
 * @returns {string | undefined}
 */
export function readCookie(cookieHeader, name) {
  if (typeof cookieHeader !== 'string' || !cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    if (part.slice(0, index).trim() !== name) continue
    try {
      return decodeURIComponent(part.slice(index + 1).trim())
    } catch {
      return undefined
    }
  }
  return undefined
}

/**
 * @param {unknown} cookieHeader
 * @param {string} orderNumber
 * @param {string} secret
 * @returns {boolean}
 */
export function isOrderBoundToRequest(cookieHeader, orderNumber, secret) {
  const value = readCookie(cookieHeader, ORDER_BINDING_COOKIE)
  if (!value || !orderNumber) return false
  const index = value.lastIndexOf('.')
  if (index === -1) return false
  const cookieOrderNumber = value.slice(0, index)
  const signature = value.slice(index + 1)
  if (cookieOrderNumber !== String(orderNumber)) return false
  const expected = signOrderNumber(orderNumber, secret)
  if (expected.length !== signature.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
