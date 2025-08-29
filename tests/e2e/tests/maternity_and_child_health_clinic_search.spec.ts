import { test, expect } from '@playwright/test';
import { handleModals } from './helpers/modals';

// Locators
const locators = {
  // Language selector
  language: {
    fi: (page) => page.getByRole('link', { name: /suomi/i }),
    sv: (page) => page.getByRole('link', { name: /svenska/i }),
    en: (page) => page.getByRole('link', { name: /english/i })
  },
  
  // Search component
  search: {
    input: (page) => page.getByRole('searchbox', { 
      name: /(etsi neuvoloita|sök mottagningar|find clinics)/i 
    }),
    button: (page) => page.getByRole('button', { 
      name: /(etsi|sök|search)/i 
    })
  },
  
  // Service filters
  filters: {
    container: (page) => page.getByRole('region', { 
      name: /(palvelut|tjänster|services)/i 
    }),
    maternity: (page) => page.getByRole('checkbox', { 
      name: /(äitiysneuvola|mödravårdscentral|maternity clinic)/i 
    }),
    childHealth: (page) => page.getByRole('checkbox', { 
      name: /(lastenneuvola|barnavårdscentral|child health clinic)/i 
    })
  },
  
  // Search results
  results: {
    container: (page) => page.getByRole('region', {
      name: /(hakutulokset|sökresultat|search results)/i
    }),
    items: (page) => page.getByRole('article'),
    noResults: (page) => page.getByText(/(ei hakutuloksia|inga sökresultat|no results found)/i),
    loading: (page) => page.getByText(/(ladataan|laddar|loading)/i)
  },
  
  // Map view
  map: {
    container: (page) => page.locator('.map-container'),
    markers: (page) => page.locator('.map-marker')
  }
};

// Test data
const testData = {
  fi: {
    searchTerm: 'Kamppi',
    noResultsText: 'ei hakutuloksia',
    basePath: '/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat',
    expectedServiceName: /(äitiysneuvola|lastenneuvola)/i
  },
  sv: {
    searchTerm: 'Kampen',
    noResultsText: 'inga sökresultat',
    basePath: '/sv/social-och-halsovardstjanster/tjanster-for-barn-och-familjer/modra-och-barnradgivningarna',
    expectedServiceName: /(mödravårdscentral|barnavårdscentral)/i
  },
  en: {
    searchTerm: 'Kamppi',
    noResultsText: 'no results found',
    basePath: '/en/health-and-social-services/child-and-family-services/maternity-and-child-health-clinics',
    expectedServiceName: /(maternity clinic|child health clinic)/i
  }
};

// Helper function to test in all supported languages
const testInAllLanguages = (testFn) => {
  Object.entries(testData).forEach(([lang, data]) => {
    test(`[${lang.toUpperCase()}] ${testFn.name}`, async ({ page, baseURL }) => {
      if (lang !== 'fi') {
        await locators.language[lang](page).click();
        await expect(page).toHaveURL(new RegExp(`/${lang}/`));
      }
      await testFn(page, baseURL, data, lang);
    });
  });
};

// Test setup
test.describe('Maternity and Child Health Clinic Search', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL + testData.fi.basePath);
    await handleModals(page);
  });

  // Test: Verify page loads with correct structure
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/(äitiys- ja lastenneuvola|mödra- och barnrådgivning|maternity and child health clinic)/i);
    
    // Check search components
    await expect(locators.search.input(page)).toBeVisible();
    await expect(locators.search.button(page)).toBeVisible();
    
    // Check filter section
    await expect(locators.filters.container(page)).toBeVisible();
    await expect(locators.filters.maternity(page)).toBeVisible();
    await expect(locators.filters.childHealth(page)).toBeVisible();
  });

  // Test: Basic search functionality
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Perform search
    await locators.search.input(page).fill(data.searchTerm);
    await locators.search.button(page).click();
    
    // Wait for results
    await expect(locators.results.loading(page)).toBeVisible({ timeout: 10000 });
    await expect(locators.results.container(page)).toBeVisible({ timeout: 15000 });
    
    // Verify results
    const results = await locators.results.items(page).all();
    await expect(results.length).toBeGreaterThan(0);
    
    // Verify first result contains expected service name
    const firstResult = results[0];
    await expect(firstResult).toContainText(data.expectedServiceName);
  });

  // Test: Filter by service type
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Filter by maternity clinics
    await locators.filters.maternity(page).check();
    await locators.search.button(page).click();
    
    // Wait for filtered results
    await expect(locators.results.loading(page)).toBeVisible({ timeout: 10000 });
    
    // Verify all results are maternity clinics
    const results = await locators.results.items(page).all();
    for (const result of results) {
      const text = await result.textContent();
      expect(text).toMatch(/(äitiysneuvola|mödravårdscentral|maternity clinic)/i);
    }
  });

  // Test: No results state
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Search for non-existent location
    await locators.search.input(page).fill('NonexistentLocation123');
    await locators.search.button(page).click();
    
    // Verify no results message
    await expect(locators.results.noResults(page)).toBeVisible({ timeout: 10000 });
    await expect(locators.results.noResults(page)).toContainText(data.noResultsText);
  });

  // Test: Map view interaction
  test('should display clinics on map', async ({ page }) => {
    // Perform search
    await locators.search.input(page).fill(testData.fi.searchTerm);
    await locators.search.button(page).click();
    
    // Wait for map to load
    await expect(locators.map.container(page)).toBeVisible({ timeout: 10000 });
    
    // Verify map markers are present
    await expect(locators.map.markers(page).first()).toBeVisible({ timeout: 5000 });
  });

  // Test: Mobile responsiveness
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Verify search components are visible and properly stacked
    await expect(locators.search.input(page)).toBeVisible();
    await expect(locators.search.button(page)).toBeVisible();
    
    // Test search functionality
    await locators.search.input(page).fill(testData.fi.searchTerm);
    await locators.search.button(page).click();
    
    // Verify results are shown
    await expect(locators.results.container(page)).toBeVisible({ timeout: 15000 });
  });
});
