import type { Page } from 'playwright'

/**
 * Goes to the area named `label` from the top nav, as a reader does, without
 * reloading the page, and waits until its page at `path` is open.
 */
export async function goToArea(page: Page, label: string, path: string) {
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: label, exact: true })
    .click()
  await page.waitForURL(path)
  await page.getByRole('heading', { level: 1 }).waitFor()
}

/**
 * Logs out from the top bar of a wide screen, as a reader does: opens the
 * Account menu and picks Log out.
 */
export async function logOut(page: Page) {
  await page.getByRole('button', { name: 'Account menu', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Log out', exact: true }).click()
}
