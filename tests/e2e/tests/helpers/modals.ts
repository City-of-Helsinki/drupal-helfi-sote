import { Page } from '@playwright/test';

export async function handleModals(page: Page) {
  // Handle cookie consent modal if it appears
  const cookieButton = page.getByRole('button', { name: /hyväksy kaikki evästeet|accept all cookies/i });
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
  }

  // Handle survey modal if it appears
  const surveyButton = page.getByRole('button', { name: /en osallistu kyselyyn|I don't want to participate in the survey/i });
  if (await surveyButton.isVisible()) {
    await surveyButton.click();
  }
}
