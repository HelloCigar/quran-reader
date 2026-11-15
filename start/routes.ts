/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import { formsThrottle } from '#start/limiter'

router.on('/').renderInertia('marketing/home', {}).as('home').use(middleware.guest())

router.get('/quran', [controllers.Surahs, 'index'])
router.get('/quran/ayah', [controllers.Ayahs, 'show'])
router.get('/quran/:number', [controllers.Surahs, 'show']).where('number', {
  match: /^(?:[1-9]|[1-9]\d|10\d|11[0-4])$/,
  cast: (value) => Number(value),
})

router.get('email-verifications/:token', [controllers.EmailVerifications, 'show'])
router.put('email-verifications/:token', [controllers.EmailVerifications, 'update'])

router.get('password-resets/:token', [controllers.PasswordResets, 'show'])
router.put('password-resets/:token', [controllers.PasswordResets, 'update'])

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store']).use(formsThrottle)

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
    router.post('login/passkey/challenge', [controllers.PasskeyLoginChallenges, 'store'])
    router.post('login/passkey', [controllers.PasskeySession, 'store'])

    router.get('forgot-password', [controllers.PasswordResets, 'create'])
    router.post('password-resets', [controllers.PasswordResets, 'store']).use(formsThrottle)
  })
  .use(middleware.guest())

router
  .group(() => {
    router
      .get('dashboard', [controllers.Dashboard, 'show'])
      .as('dashboard')
      .use(middleware.verifiedAccount())
    router.post('email-verifications', [controllers.EmailVerifications, 'store'])
    router.get('account/activate', [controllers.EmailVerifications, 'create'])
    router.post('logout', [controllers.Session, 'destroy'])
    router.put('reading-position', [controllers.ReadingPosition, 'update'])

    router.on('settings').redirect('profile.show').as('settings')
    router.get('settings/profile', [controllers.Profile, 'show'])
    router.put('settings/profile', [controllers.Profile, 'update'])
    // flow-allow flow-cruddy-controllers: the Security settings page combines the change-password form and the passkeys list; PasskeysController keeps the passkey writes.
    router.get('settings/security', [controllers.Security, 'show'])
    router.put('settings/password', [controllers.AccountPassword, 'update'])
    router.post('settings/passkeys/challenge', [controllers.PasskeyRegistrationChallenges, 'store'])
    router.post('settings/passkeys', [controllers.Passkeys, 'store'])
    router.put('settings/passkeys/:id', [controllers.Passkeys, 'update'])
    router.delete('settings/passkeys/:id', [controllers.Passkeys, 'destroy'])
  })
  .use(middleware.auth())

router
  .resource('bookmarks', controllers.Bookmarks)
  .only(['index', 'store', 'update', 'destroy'])
  .where('id', router.matchers.number())
  .use('*', middleware.auth())
