import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, ({ faker }) => ({
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'Corr3ct-Horse-Battery-Staple!',
    unverifiedEmail: faker.internet.email(),
  }))
  .state('verified', (user) => {
    user.unverifiedEmail = null
  })
  .build()
