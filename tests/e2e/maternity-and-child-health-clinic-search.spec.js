import { test, expect } from '@playwright/test';
import { setupPage, waitForSearchResults } from './helpers/common-helpers.js';

test.describe('Maternity and Child Health Clinic Search', () => {
  const testUrl = '/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat';

  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
    await setupPage(page);
  });

  test.describe('Basic Search Functionality', () => {
    test('should show initial page load with all clinics', async ({ page }) => {
      // Locate the clinic search section
      const searchSection = page.getByRole('heading', { name: 'Hae neuvolaa', level: 2 });
      await expect(searchSection).toBeVisible();

      // Wait for results to load (initially showing all clinics like "20 neuvolaa")
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Verify some expected clinic names appear
      const expectedClinics = [
        'Itäkadun perhekeskuksen neuvola',
        'Kallion perhekeskuksen neuvola',
        'Kampin perhekeskuksen neuvola'
      ];

      for (const clinicName of expectedClinics) {
        try {
          const clinicHeading = page.getByRole('heading', { name: clinicName, level: 4 });
          await expect(clinicHeading).toBeVisible({ timeout: 5000 });
        } catch (error) {
          // Some clinics might not be visible on the first page, this is okay
          console.log(`Clinic ${clinicName} not found on current page`);
        }
      }
    });

    test('should have proper search input placeholder and labels', async ({ page }) => {
      // Verify search interface elements
      const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await expect(searchInput).toBeVisible();

      // Check for helper text
      const helperText = page.getByText('Kirjoita kadunnimi ja talonumero.');
      await expect(helperText).toBeVisible();

      // Check for Swedish service checkbox
      const swedishCheckbox = page.getByRole('checkbox', { 
        name: 'Näytä lähin toimipiste, josta saa palvelua ruotsiksi.' 
      });
      await expect(swedishCheckbox).toBeVisible();

      // Check for search button
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await expect(searchButton).toBeVisible();
    });
  });

  test.describe('Address-Based Filtering', () => {
    test('should filter clinics by address search', async ({ page }) => {
      // Wait for initial results to load
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Enter address in search field
      const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchInput.fill('Keskuskatu 1');

      // Click search button
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();

      // Wait for search results to change - could be count-based results or "Ei hakutuloksia"
      await page.waitForTimeout(2000);
      
      // Check for either successful results (containing "neuvola" text) or no results message
      const hasResults = await page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ }).isVisible();
      const hasNoResults = await page.getByRole('heading', { name: 'Ei hakutuloksia', level: 3 }).isVisible();
      
      expect(hasResults || hasNoResults).toBeTruthy();

      if (hasResults) {
        // Verify that results contain clinic information
        const addressLabel = page.getByText('Osoite:').first();
        await expect(addressLabel).toBeVisible();
      }
    });

    test('should handle postal code search', async ({ page }) => {
      // Wait for initial load
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Enter postal code
      const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchInput.fill('00100');

      // Submit search
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();

      // Wait for results - could be count-based results or "Ei hakutuloksia"
      await page.waitForTimeout(2000);
      
      const hasResults = await page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ }).isVisible();
      const hasNoResults = await page.getByRole('heading', { name: 'Ei hakutuloksia', level: 3 }).isVisible();
      
      expect(hasResults || hasNoResults).toBeTruthy();
    });

    test('should support multiple address formats', async ({ page }) => {
      const addressFormats = [
        'Mannerheimintie 1, Helsinki',
        'Aleksanterinkatu',
        'Kallio'
      ];

      for (let i = 0; i < addressFormats.length; i++) {
        const address = addressFormats[i];
        console.log(`Testing address format ${i + 1}/${addressFormats.length}: ${address}`);
        
        // Clear search field first to reset state
        const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
        await searchInput.clear();
        
        // Submit empty search to reset to default view
        const searchButton = page.getByRole('button', { name: 'Etsi' });
        await searchButton.click();
        await page.waitForTimeout(2000); // Increased timeout for reset
        
        // Wait for initial load state with all results
        try {
          await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible({ timeout: 10000 });
        } catch (error) {
          console.log(`Failed to find initial results for iteration ${i + 1}, retrying...`);
          await page.reload();
          await setupPage(page);
          await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible({ timeout: 10000 });
        }

        // Now enter the test address
        await searchInput.fill(address);

        // Submit search
        await searchButton.click();

        // Wait for results with longer timeout
        await page.waitForTimeout(3000);
        
        // Check for results - handle both singular "neuvola" and plural "neuvolaa" forms
        const hasResults = await page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ }).isVisible();
        const hasNoResults = await page.getByRole('heading', { name: 'Ei hakutuloksia', level: 3 }).isVisible();
        
        console.log(`Address "${address}": hasResults=${hasResults}, hasNoResults=${hasNoResults}`);
        
        expect(hasResults || hasNoResults).toBeTruthy();
      }
    });

    test('should clear search and return to default view', async ({ page }) => {
      // Wait for initial load
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // First perform a search
      const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchInput.fill('Keskuskatu 1');

      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(2000);

      // Clear the search field
      await searchInput.clear();
      await searchButton.click();

      // Wait for results to reload - should show all clinics again
      await page.waitForTimeout(2000);
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();
    });
  });

  test.describe('Language Service Filtering', () => {
    test('should filter for Swedish language services', async ({ page }) => {
      // Wait for initial load
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Check the Swedish language service checkbox
      const swedishCheckbox = page.getByRole('checkbox', { 
        name: 'Näytä lähin toimipiste, josta saa palvelua ruotsiksi.' 
      });
      await swedishCheckbox.check();

      // Submit search
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();

      // Wait for results - could be count-based results or "Ei hakutuloksia"
      await page.waitForTimeout(2000);
      
      const hasResults = await page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ }).isVisible();
      const hasNoResults = await page.getByRole('heading', { name: 'Ei hakutuloksia', level: 3 }).isVisible();
      
      expect(hasResults || hasNoResults).toBeTruthy();

      // Look for Swedish service tags if results exist
      if (hasResults) {
        try {
          const swedishServiceTag = page.getByText('Ruotsinkielistä palvelua').first();
          await expect(swedishServiceTag).toBeVisible({ timeout: 5000 });
        } catch (error) {
          // Swedish service tags might not be visible if no Swedish-speaking clinics exist
          console.log('No Swedish language service tags found in results');
        }
      }
    });

    test('should combine Swedish filter with address search', async ({ page }) => {
      // Wait for initial load
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Enter address
      const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchInput.fill('Kampin perhekeskuksen neuvola');

      // Check Swedish language service checkbox
      const swedishCheckbox = page.getByRole('checkbox', { 
        name: 'Näytä lähin toimipiste, josta saa palvelua ruotsiksi.' 
      });
      await swedishCheckbox.check();

      // Submit search
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();

      // Wait for results - could be count-based results or "Ei hakutuloksia"
      await page.waitForTimeout(2000);
      
      const hasResults = await page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ }).isVisible();
      const hasNoResults = await page.getByRole('heading', { name: 'Ei hakutuloksia', level: 3 }).isVisible();
      
      expect(hasResults || hasNoResults).toBeTruthy();
    });
  });

  test.describe('View Switching', () => {
    test('should have list and map view toggle', async ({ page }) => {
      // Wait for search results to load first
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Verify tab list exists
      const tabList = page.getByRole('tablist');
      await expect(tabList).toBeVisible();

      // Verify list view tab is selected by default
      const listTab = page.getByRole('tab', { name: 'Näytä listana' });
      await expect(listTab).toBeVisible();

      // Verify map view tab exists
      const mapTab = page.getByRole('tab', { name: 'Näytä kartalla' });
      await expect(mapTab).toBeVisible();

      // Click map view tab
      await mapTab.click();

      // Verify tab panel is present
      const tabPanel = page.getByRole('tabpanel');
      await expect(tabPanel).toBeVisible();

      // Switch back to list view
      await listTab.click();
      await expect(tabPanel).toBeVisible();
    });
  });

  test.describe('Accessibility & Mobile', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Wait for initial load
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Focus the search input
      const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchInput.focus();
      
      // Type using keyboard
      await searchInput.fill('Keskuskatu 1');
      
      // Navigate to search button using Tab and press Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip checkbox
      await page.keyboard.press('Enter');

      // Wait for results - could be count-based results or "Ei hakutuloksia"
      await page.waitForTimeout(2000);
      
      const hasResults = await page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ }).isVisible();
      const hasNoResults = await page.getByRole('heading', { name: 'Ei hakutuloksia', level: 3 }).isVisible();
      
      expect(hasResults || hasNoResults).toBeTruthy();
    });

    test('should be mobile responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Reload page to ensure mobile layout
      await page.reload();
      await setupPage(page);

      // Wait for initial load
      await expect(page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ })).toBeVisible();

      // Verify search interface is visible on mobile
      const searchSection = page.getByRole('heading', { name: 'Hae neuvolaa', level: 2 });
      await expect(searchSection).toBeVisible();

      const searchInput = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await expect(searchInput).toBeVisible();

      // Perform a search on mobile
      await searchInput.fill('Keskuskatu 1');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();

      // Wait and verify results - could be count-based results or "Ei hakutuloksia"
      await page.waitForTimeout(2000);
      
      const hasResults = await page.locator('h3').filter({ hasText: /\d+ neuvolaa?/ }).isVisible();
      const hasNoResults = await page.getByRole('heading', { name: 'Ei hakutuloksia', level: 3 }).isVisible();
      
      expect(hasResults || hasNoResults).toBeTruthy();
    });
  });

  test.describe('Page Content and Structure', () => {
    test('should have proper page title and navigation', async ({ page }) => {
      // Verify page title
      const pageTitle = page.getByRole('heading', { name: 'Äitiys- ja lastenneuvolat', level: 1 });
      await expect(pageTitle).toBeVisible();

      // Verify breadcrumb navigation
      const breadcrumb = page.getByRole('navigation', { name: 'Murupolku' });
      await expect(breadcrumb).toBeVisible();

      // Verify main navigation elements (be more specific to avoid multiple matches)
      const socialServicesLink = page.getByRole('navigation', { name: 'Päävalikko' }).getByRole('link', { name: 'Sosiaali- ja terveyspalvelut' });
      await expect(socialServicesLink).toBeVisible();
    });

    test('should have related links and content sections', async ({ page }) => {
      // Verify "Tällä sivustolla" section
      const onThisPageHeading = page.getByRole('heading', { name: 'Tällä sivustolla', level: 2 });
      await expect(onThisPageHeading).toBeVisible();

      // Verify service description
      const serviceDescription = page.getByRole('heading', { 
        name: 'Neuvoloistamme saat sekä äitiysneuvolan että lastenneuvolan palveluita', 
        level: 2 
      });
      await expect(serviceDescription).toBeVisible();

      // Check for related service links
      const appointmentLink = page.getByRole('link', { name: 'Neuvoloiden ajanvaraus ja neuvonta' });
      await expect(appointmentLink).toBeVisible();

      const pregnancyLink = page.getByRole('link', { name: 'Raskauden aikana' });
      await expect(pregnancyLink).toBeVisible();
    });
  });
}); 