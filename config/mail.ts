import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: env.get('MAIL_MAILER'),

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  from: {
    address: env.get('MAIL_FROM_ADDRESS'),
    name: env.get('MAIL_FROM_NAME'),
  },

  /**
   * The globals are shared with all the templates rendered using the
   * configured template engine.
   *
   * This could be a nice place to define the logo URL, links base URL
   * the brand name to be used within the emails
   */
  globals: {
    brandName: env.get('MAIL_BRAND_NAME', 'Quran Reader'),
  },

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
      /**
       * Sign in when credentials are set (production); the local
       * catcher on port 1025 needs none.
       */
      auth: env.get('SMTP_USERNAME')
        ? {
            type: 'login',
            user: env.get('SMTP_USERNAME', ''),
            pass: env.get('SMTP_PASSWORD')?.release() ?? '',
          }
        : undefined,
    }),

    /**
     * Production sends through Resend's HTTPS API: Railway blocks
     * outbound SMTP below the Pro plan.
     */
    resend: transports.resend({
      key: env.get('RESEND_API_KEY')?.release() ?? '',
      baseUrl: 'https://api.resend.com',
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
