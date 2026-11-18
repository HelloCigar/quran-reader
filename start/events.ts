import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'

/**
 * `mail.sendLater` sends from an in-memory queue, and a failed send only
 * emits this event. Log it, or the failure leaves no trace.
 */
emitter.on('queued:mail:error', ({ error, mailerName }) => {
  logger.error({ err: error, mailer: mailerName }, 'queued mail failed to send')
})
