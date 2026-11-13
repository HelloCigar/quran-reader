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

router.on('/').renderInertia('marketing/home', {}).as('home')

router.get('/quran', [controllers.Surahs, 'index'])
router.get('/quran/:number', [controllers.Surahs, 'show']).where('number', {
  match: /^(?:[1-9]|[1-9]\d|10\d|11[0-4])$/,
  cast: (value) => Number(value),
})

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.on('/dashboard').renderInertia('app/dashboard', {}).as('dashboard')
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())

router
  .resource('bookmarks', controllers.Bookmarks)
  .only(['index', 'store', 'update', 'destroy'])
  .where('id', router.matchers.number())
  .use('*', middleware.auth())
