import type { NextApiRequest, NextApiResponse } from 'next'
import { Logging } from '@google-cloud/logging'
import requestIp from 'request-ip'

import {
  ENV,
  GCP_PROJECT_ID,
  GCP_STACKDRIVER_LOG_NAME,
} from '../../config/index.mjs'
import { parseUserBehaviorLog } from '../../utils/api/logging.schema'

const loggingClient =
  ENV === 'local'
    ? null
    : new Logging({
        projectId: GCP_PROJECT_ID,
      })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    res.send({ msg: 'Received.' })

    const query = parseUserBehaviorLog(req.body)

    if (!loggingClient || !query) {
      return
    }

    const log = loggingClient.log(GCP_STACKDRIVER_LOG_NAME)
    const metadata = { resource: { type: 'global' } }
    const clientIp = requestIp.getClientIp(req)

    query.clientInfo.ip = clientIp ?? ''

    const entry = log.entry(metadata, query)
    await log.write(entry)
  } catch (error) {
    console.error(
      JSON.stringify({
        severity: 'ERROR',
        message: 'encouter errored while writing user behavior log',
        debugPayload: {
          error,
          log: req.body,
        },
      })
    )
  }
}
