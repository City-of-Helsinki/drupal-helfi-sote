import { test, expect } from '@playwright/test';
import { handleModals } from './helpers/modals';

// Locators
const locators = {
  // Language selector
  language: {
    fi: (page) => page.getByRole('link', { name: 'Suomi' }),
    sv: (page) => page.getByRole('link', { name: 'Svenska' }),
    en: (page) => page.getByRole('link', { name: 'English' })
  },
  
  // Search form elements
  searchForm: {
    heading: (page) => page.getByRole('heading', { 
      name: /(Etsi oma terveysasemasi|Sök din egen hälsostation|Find your health station)/i,
      level: 1 
    }),
    addressInput: (page) => page.getByRole('combobox', { 
      name: /(Kotiosoite|Hemadress|Home address)/ 
    }),
    searchButton: (page) => page.getByRole('button', { 
      name: /(Etsi|Sök|Search)/ 
    }),
    swedishServiceCheckbox: (page) => page.getByRole('checkbox', { 
      name: /(Näytä lähin toimipiste, josta saa palvelua ruotsiksi|Visa det närmaste verksamhetsställe där man får betjäning på svenska|Show the nearest service location where service is available in Swedish)/ 
    }),
    helperText: (page) => page.getByText(/(Kirjoita kadunnimi ja talonumero|Ange gatunamnet och husnumret|Enter the street name and house number)/),
    districtSearchNote: (page) => page.getByText(/(Huom! Et voi etsiä terveysasemaa kaupunginosan nimellä|Obs! Du kan inte söka efter en hälsostation med stadsdelsnamn|Note! You cannot search for a health station using the name of a district)/)
  },
  
  // Search results section
  searchResults: {
    container: (page) => page.getByRole('region', { 
      name: /(Hakutulokset|Sökresultat|Search results)/i 
    }),
    heading: (page) => page.getByRole('heading', { 
      name: /(Hakutulokset|Sökresultat|Search results)/i,
      level: 2 
    }),
    items: (page) => page.getByRole('article'),
    noResults: (page) => page.getByText(/(Ei hakutuloksia|Inga sökresultat|No search results)/i),
    loadingIndicator: (page) => page.getByText(/(Hakutuloksia ladataan|Sökresultat laddas|Search results are loading)/),
    
    // First result item selectors
    firstItem: {
      container: (page) => page.getByRole('article').first(),
      name: (page) => page.getByRole('article').first().getByRole('heading', { level: 3 }),
      address: (page) => page.getByRole('article').first().getByText(/(Osoite|Adress|Address)/).locator('+ div'),
      phone: (page) => page.getByRole('article').first().getByText(/(Puhelin|Telefon|Phone)/).locator('+ div'),
      email: (page) => page.getByRole('article').first().getByText(/(Sähköposti|E-post|Email)/).locator('+ a')
    }
  },
  
  // Navigation
  navigation: {
    healthStationsLink: (page) => page.getByRole('link', { 
      name: /(Siirry sivulle Terveysasemat|Gå till sidan Hälsostationer|Go to the Health Stations page)/ 
    }),
    breadcrumbs: {
      home: (page) => page.getByRole('link', { name: /(Etusivu|Huvudsida|Front page)/ }),
      healthServices: (page) => page.getByRole('link', { name: /(Sosiaali- ja terveyspalvelut|Social- och hälsovårdstjänster|Health and social services)/ }),
      healthCare: (page) => page.getByRole('link', { name: /(Terveydenhoito|Hälsovård|Health care)/ }),
      healthStations: (page) => page.getByRole('link', { name: /(Terveysasemat|Hälsostationer|Health stations)/ })
    }
  }
};

// Test data
const testData = {
  fi: {
    searchTerm: 'Mannerheimintie 1',
    noResultsText: 'Ei hakutuloksia',
    swedishServiceText: 'Ruotsinkielinen palvelu',
    basePath: '/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/terveysasemat/etsi-oma-terveysasemasi',
    expectedStationName: /(Kampin terveysasema|Kallion terveysasema)/i,
    expectedAddress: /Mannerheimintie/i
  },
  sv: {
    searchTerm: 'Mannerheimvägen 1',
    noResultsText: 'Inga sökresultat',
    swedishServiceText: 'Tjänster på svenska',
    basePath: '/sv/social-och-halsovardstjanster/halsovard/halsostationer/sok-din-egen-halsostation',
    expectedStationName: /(Kampens hälsostation|Berghälls hälsostation)/i,
    expectedAddress: /Mannerheimvägen/i
  },
  en: {
    searchTerm: 'Mannerheimintie 1',
    noResultsText: 'No search results',
    swedishServiceText: 'Service in Swedish',
    basePath: '/en/health-and-social-services/health-care/health-stations/find-your-health-station',
    expectedStationName: /(Kamppi Health Station|Kallio Health Station)/i,
    expectedAddress: /Mannerheimintie/i
  }
};

// Helper function to test in all supported languages
const testInAllLanguages = (testFn) => {
  Object.entries(testData).forEach(([lang, data]) => {
    test(`[${lang.toUpperCase()}] ${testFn.name}`, async ({ page, baseURL }) => {
      // Navigate to the correct language version
      if (lang !== 'fi') {
        await locators.language[lang](page).click();
        await expect(page).toHaveURL(new RegExp(`/${lang}/`));
      }
      
      // Run the test function with language-specific data
      await testFn(page, baseURL, data, lang);
    });
  });
};

// Test setup
test.describe('Health Station Search', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Navigate to the health station search page
    await page.goto(baseURL + testData.fi.basePath);
    // Handle any modals (cookies, surveys, etc.)
    await handleModals(page);
  });

  // Test: Verify page loads with correct structure and accessibility
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Check page title and heading structure
    await expect(page).toHaveTitle(/(Terveysasemat|Hälsostationer|Health Stations)/);
    await expect(locators.searchForm.heading(page)).toBeVisible();
    
    // Check search form elements
    await expect(locators.searchForm.addressInput(page)).toBeVisible();
    await expect(locators.searchForm.addressInput(page)).toBeEditable();
    await expect(locators.searchForm.searchButton(page)).toBeVisible();
    await expect(locators.searchForm.searchButton(page)).toBeEnabled();
    await expect(locators.searchForm.helperText(page)).toBeVisible();
    await expect(locators.searchForm.districtSearchNote(page)).toBeVisible();
    
    // Check breadcrumb navigation
    await expect(locators.navigation.breadcrumbs.home(page)).toBeVisible();
    await expect(locators.navigation.breadcrumbs.healthServices(page)).toBeVisible();
    await expect(locators.navigation.breadcrumbs.healthCare(page)).toBeVisible();
    await expect(locators.navigation.breadcrumbs.healthStations(page)).toBeVisible();
  });

  // Test: Search by address and verify results
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Enter search term and submit
    await locators.searchForm.addressInput(page).fill(data.searchTerm);
    await locators.searchForm.searchButton(page).click();
    
    // Wait for results to load
    await expect(locators.searchResults.loadingIndicator(page)).toBeVisible({ timeout: 10000 });
    await expect(locators.searchResults.container(page)).toBeVisible({ timeout: 15000 });
    
    // Verify results container has proper ARIA attributes
    await expect(locators.searchResults.container(page)).toHaveAttribute('aria-live', 'polite');
    
    // Verify at least one result is shown
    const results = await locators.searchResults.items(page).all();
    await expect(results.length).toBeGreaterThan(0);
    
    // Verify first result has required information
    const firstResult = results[0];
    await expect(firstResult).toBeVisible();
    await expect(locators.searchResults.firstItem.name(page)).toBeVisible();
    await expect(locators.searchResults.firstItem.address(page)).toBeVisible();
    await expect(locators.searchResults.firstItem.phone(page)).toBeVisible();
    
    // Verify the result matches the search location
    const address = await locators.searchResults.firstItem.address(page).textContent();
    expect(address).toMatch(data.expectedAddress);
  });

  // Test: Filter by Swedish language service
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Check Swedish service checkbox
    await locators.searchForm.swedishServiceCheckbox(page).check();
    
    // Enter search term and submit
    await locators.searchForm.addressInput(page).fill(data.searchTerm);
    await locators.searchForm.searchButton(page).click();
    
    // Wait for results
    await expect(locators.searchResults.loadingIndicator(page)).toBeVisible({ timeout: 10000 });
    await expect(locators.searchResults.container(page)).toBeVisible({ timeout: 15000 });
    
    // Verify results indicate Swedish service
    const results = await locators.searchResults.items(page).all();
    expect(results.length).toBeGreaterThan(0);
    
    // Check each result indicates Swedish service
    for (const result of results) {
      await expect(result).toContainText(data.swedishServiceText);
    }
  });

  // Test: No results state
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Search with a non-existent address
    await locators.searchForm.addressInput(page).fill('InvalidAddress12345');
    await locators.searchForm.searchButton(page).click();
    
    // Verify no results message is shown
    await expect(locators.searchResults.noResults(page)).toBeVisible({ timeout: 10000 });
    await expect(locators.searchResults.noResults(page)).toContainText(data.noResultsText);
  });
  
  // Test: Keyboard navigation
  test('should support keyboard navigation', async ({ page }) => {
    // Focus the search input
    await locators.searchForm.addressInput(page).focus();
    
    // Type search term
    await page.keyboard.type(testData.fi.searchTerm);
    
    // Tab to search button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify results are shown
    await expect(locators.searchResults.container(page)).toBeVisible({ timeout: 15000 });
    
    // Tab through results
    await page.keyboard.press('Tab'); // First interactive element in results
    await page.keyboard.press('Enter'); // Should activate the first result link
    
    // Verify navigation occurred
    await expect(page).toHaveURL(/terveysasema|halsostation|health-station/i);
  });
  
  // Test: Mobile responsiveness
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Verify elements are properly stacked and visible
    await expect(locators.searchForm.heading(page)).toBeVisible();
    await expect(locators.searchForm.addressInput(page)).toBeVisible();
    await expect(locators.searchForm.searchButton(page)).toBeVisible();
    
    // Test search functionality
    await locators.searchForm.addressInput(page).fill(testData.fi.searchTerm);
    await locators.searchForm.searchButton(page).click();
    
    // Verify results are shown
    await expect(locators.searchResults.container(page)).toBeVisible({ timeout: 15000 });
  });
  
  // Test: Language switching
  testInAllLanguages(async (page, baseURL, data, lang) => {
    // Skip Finnish as it's the default
    if (lang === 'fi') return;
    
    // Click language link
    await locators.language[lang](page).click();
    
    // Verify URL and content updated
    await expect(page).toHaveURL(new RegExp(data.basePath));
    
    // Test search in the selected language
    await locators.searchForm.addressInput(page).fill(data.searchTerm);
    await locators.searchForm.searchButton(page).click();
    
    // Verify results are shown
    await expect(locators.searchResults.container(page)).toBeVisible({ timeout: 15000 });
  });
});
