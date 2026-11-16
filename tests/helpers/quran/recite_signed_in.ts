import type { TestContext } from '@japa/runner/core'
import User from '#models/user'

/**
 * Signs a reader in and plays Al-Baqarah (2) from its first Ayah, as a reader
 * does from its page. Returns that page, with the Recitation on 2:1.
 */
export async function reciteAlBaqarahSignedIn({ visit, route, browserContext }: TestContext) {
  const reader = await User.create({
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'secret-password',
  })
  await browserContext.loginAs(reader)
  const page = await visit(route('surahs.show', { number: 2 }))
  await page.getByRole('button', { name: 'Play from 2:1', exact: true }).click()
  await page.assertText(page.getByTestId('recited-ayah'), '2:1')
  return page
}
