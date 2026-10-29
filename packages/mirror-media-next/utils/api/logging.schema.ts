import { z } from 'zod'

import { monitorZodSafeParse } from '../zod-monitor'

const loggingRequestBodySchema = z
  .object({
    clientInfo: z.record(z.unknown()),
  })
  .passthrough()

const browserOrDeviceSchema = z
  .object({
    name: z.string().optional(),
    version: z.string().optional(),
  })
  .strip()

/**
 * Shape written to the user-behavior BigQuery sink.
 * `is_in_app_browser` is BOOLEAN and `screen_size` width/height are FLOAT;
 * a string in either column makes the sink drop the row. Unknown keys are
 * stripped so they are not stored on the log entry.
 */
const userBehaviorLogSchema = z
  .object({
    triggerEvent: z
      .object({
        'event-type': z.enum(['pageview', 'exit', 'click']),
        datetime: z.string(),
      })
      .strip(),
    clientInfo: z
      .object({
        ip: z.string(),
        userInfo: z
          .object({
            'member-type': z.string(),
            email: z.string(),
            'firebase-id': z.string(),
          })
          .strip(),
        browser: browserOrDeviceSchema,
        device: browserOrDeviceSchema,
        'is-in-app-browser': z.boolean(),
        'screen-size': z
          .object({
            width: z.number().finite(),
            height: z.number().finite(),
          })
          .strip(),
      })
      .strip(),
    pageInfo: z
      .object({
        referral: z.string(),
        'page-url': z.string(),
        'page-type': z.string(),
        'story-slug': z.string().optional(),
        'story-author': z.string().optional(),
      })
      .strip(),
  })
  .strip()

type UserBehaviorLog = z.infer<typeof userBehaviorLogSchema>

export function parseUserBehaviorLog(
  body: unknown
): UserBehaviorLog | undefined {
  const parsed = userBehaviorLogSchema.safeParse(body)
  return parsed.success ? parsed.data : undefined
}

type LoggingEndpoint = 'tracking' | 'error-report'

export function monitorLoggingRequestBody(
  endpoint: LoggingEndpoint,
  body: unknown
): void {
  monitorZodSafeParse(loggingRequestBodySchema, body, {
    boundary: `api:${endpoint}`,
    schemaName: 'loggingRequestBodySchema',
  })
}
