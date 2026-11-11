import assert from 'node:assert/strict'
import { createCipheriv, createHash } from 'node:crypto'
import { describe, test } from 'node:test'

import NewebPay from '@mirrormedia/newebpay-node'

import {
  buildOrderBindingCookie,
  isOrderBoundToRequest,
  ORDER_BINDING_COOKIE,
  parseNewebpayCallback,
  readCookie,
  verifyTradeSha,
} from './newebpay.mjs'

const KEY = 'k'.repeat(32)
const IV = 'v'.repeat(16)
const OTHER_KEY = 'x'.repeat(32)
const newebpay = new NewebPay(KEY, IV)

// 模擬藍新回傳：JSON 字串用同一組 key/iv 加密
function encryptJson(obj) {
  const text = JSON.stringify(obj)
  const pad = 32 - (text.length % 32)
  const padded = text + String.fromCharCode(pad).repeat(pad)
  return createCipheriv('aes-256-cbc', KEY, IV).update(padded, 'binary', 'hex')
}

function shaOf(tradeInfo, key = KEY, iv = IV) {
  return createHash('sha256')
    .update(`HashKey=${key}&${tradeInfo}&HashIV=${iv}`, 'ascii')
    .digest('hex')
    .toUpperCase()
}

describe('verifyTradeSha', () => {
  const tradeInfo = encryptJson({ Status: 'SUCCESS', Result: {} })

  test('accepts the TradeSha computed with the same key/iv', () => {
    assert.equal(verifyTradeSha(tradeInfo, shaOf(tradeInfo), KEY, IV), true)
    assert.equal(
      verifyTradeSha(tradeInfo, shaOf(tradeInfo).toLowerCase(), KEY, IV),
      true
    )
  })

  test('rejects another key, tampered TradeInfo, or junk input', () => {
    assert.equal(
      verifyTradeSha(tradeInfo, shaOf(tradeInfo, OTHER_KEY), KEY, IV),
      false
    )
    assert.equal(
      verifyTradeSha(tradeInfo + '00', shaOf(tradeInfo), KEY, IV),
      false
    )
    assert.equal(verifyTradeSha(tradeInfo, 'ABC', KEY, IV), false)
    assert.equal(verifyTradeSha(tradeInfo, undefined, KEY, IV), false)
    assert.equal(verifyTradeSha(undefined, shaOf(tradeInfo), KEY, IV), false)
    assert.equal(verifyTradeSha(['a'], shaOf(tradeInfo), KEY, IV), false)
  })

  test('matches what newebpay-node produces when encrypting', () => {
    const form = newebpay.getEncryptedFormPostData({
      MerchantID: 'M1',
      Amt: 2880,
      Email: 'a@b.c',
    })
    assert.equal(verifyTradeSha(form.TradeInfo, form.TradeSha, KEY, IV), true)
  })
})

describe('parseNewebpayCallback', () => {
  test('accepts the JSON structure NewebPay posts back', () => {
    const decrypted = newebpay.getDecryptedTradeInfo(
      encryptJson({
        Status: 'SUCCESS',
        Message: 'ok',
        Result: { MerchantOrderNo: 'P2026111100001', Amt: 2880 },
      })
    )
    assert.deepEqual(parseNewebpayCallback(decrypted), {
      status: 'SUCCESS',
      merchantOrderNo: 'P2026111100001',
      result: { MerchantOrderNo: 'P2026111100001', Amt: 2880 },
    })
  })

  test('rejects a TradeInfo minted through getEncryptedFormPostData', () => {
    const forged = newebpay.getEncryptedFormPostData({
      MerchantID: 'M1',
      Amt: 2880,
      '{"Status":"SUCCESS","Result":{"MerchantOrderNo":"VICTIM"}}': '',
    })
    const decrypted = newebpay.getDecryptedTradeInfo(forged.TradeInfo)
    assert.equal(parseNewebpayCallback(decrypted), null)
  })

  test('rejects payloads without Status or MerchantOrderNo', () => {
    assert.equal(parseNewebpayCallback(null), null)
    assert.equal(parseNewebpayCallback('SUCCESS'), null)
    assert.equal(parseNewebpayCallback({ Status: 'SUCCESS' }), null)
    assert.equal(parseNewebpayCallback({ Status: 'SUCCESS', Result: {} }), null)
    assert.equal(
      parseNewebpayCallback({
        Status: 'SUCCESS',
        Result: { MerchantOrderNo: '' },
      }),
      null
    )
    assert.equal(
      parseNewebpayCallback({ Result: { MerchantOrderNo: 'P1' } }),
      null
    )
  })
})

describe('order binding cookie', () => {
  const secret = 'secret'

  test('cookie attributes allow the cross-site POST from NewebPay', () => {
    const cookie = buildOrderBindingCookie('P1', secret)
    assert.match(
      cookie,
      new RegExp(`^${ORDER_BINDING_COOKIE}=P1\\.[0-9a-f]{64}; `)
    )
    assert.ok(cookie.includes('Path=/papermag/return'))
    assert.ok(cookie.includes('HttpOnly'))
    assert.ok(cookie.includes('Secure'))
    assert.ok(cookie.includes('SameSite=None'))
  })

  test('readCookie picks the named cookie out of the header', () => {
    assert.equal(
      readCookie('a=1; mm_papermag_order=P1.abc; b=2', ORDER_BINDING_COOKIE),
      'P1.abc'
    )
    assert.equal(readCookie('a=1', ORDER_BINDING_COOKIE), undefined)
    assert.equal(readCookie(undefined, ORDER_BINDING_COOKIE), undefined)
  })

  test('binding only matches the same order number signed with the same secret', () => {
    const header = buildOrderBindingCookie('P1', secret).split(';')[0]
    assert.equal(isOrderBoundToRequest(header, 'P1', secret), true)
    assert.equal(isOrderBoundToRequest(header, 'P2', secret), false)
    assert.equal(isOrderBoundToRequest(header, 'P1', 'other'), false)
    assert.equal(
      isOrderBoundToRequest(
        `${ORDER_BINDING_COOKIE}=P1.deadbeef`,
        'P1',
        secret
      ),
      false
    )
    assert.equal(
      isOrderBoundToRequest(`${ORDER_BINDING_COOKIE}=P1`, 'P1', secret),
      false
    )
    assert.equal(isOrderBoundToRequest('', 'P1', secret), false)
    assert.equal(isOrderBoundToRequest(header, '', secret), false)
  })
})
