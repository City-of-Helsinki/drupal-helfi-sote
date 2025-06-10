/**
 * Common helper functions for E2E tests
 */

/**
 * Handle the cookie banner that appears on the site
 * @param {import('@playwright/test').Page} page
 */
export async function handleCookieBanner(page) {
  try {
    // Wait for cookie banner to appear and accept all cookies
    const cookieBanner = page.getByRole('heading', { name: 'Evästeet hel.fi-sivustolla' });
    await cookieBanner.waitFor({ timeout: 3000 });
    
    const acceptButton = page.getByRole('button', { name: 'Hyväksy kaikki evästeet' });
    await acceptButton.click();
    
    // Wait for banner to disappear
    await cookieBanner.waitFor({ state: 'hidden', timeout: 3000 });
  } catch (error) {
    // Cookie banner might not appear or might have already been accepted
    console.log('Cookie banner not found or already handled');
  }
}

/**
 * Handle the survey modal that may pop up
 * @param {import('@playwright/test').Page} page
 */
export async function handleSurveyModal(page) {
  try {
    // Wait for survey modal to appear
    const surveyModal = page.getByText('Auta meitä parantamaan verkkosivujamme!');
    await surveyModal.waitFor({ timeout: 3000 });
    
    const declineButton = page.getByRole('button', { name: 'En osallistu kyselyyn' });
    await declineButton.click();
    
    // Wait for modal to disappear
    await surveyModal.waitFor({ state: 'hidden', timeout: 3000 });
  } catch (error) {
    // Survey modal might not appear
    console.log('Survey modal not found or already handled');
  }
}

/**
 * Setup page by handling common modals and banners
 * @param {import('@playwright/test').Page} page
 */
export async function setupPage(page) {
  await handleCookieBanner(page);
  await handleSurveyModal(page);
  
  // Give the page a moment to settle after handling modals
  await page.waitForTimeout(1000);
}

/**
 * Wait for search results to load (generic fallback)
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForSearchResults(page, timeout = 10000) {
  // Wait for either results or no results message
  try {
    await page.waitForSelector('[data-drupal-selector*="search-results"], .view-empty, h3:has-text("neuvolaa"), h3:has-text("terveysasemaa")', { timeout });
  } catch (error) {
    console.log('Search results taking longer than expected to load');
  }
} 