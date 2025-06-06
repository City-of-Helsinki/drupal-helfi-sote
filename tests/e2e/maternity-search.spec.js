import { test, expect } from '@playwright/test';
import {
  PerformanceHelper,
  AccessibilityHelper,
  DataQualityHelper,
  GeographicHelper,
  ResponsiveHelper,
  TestUtils,
  TEST_DATA
} from './helpers/search-helpers.js';

/**
 * Maternity and Child Health Clinic Search Tests
 * 
 * Comprehensive test suite for healthcare service search functionality
 * Tests performance, accessibility, data quality, and user experience
 */

const BASE_URL = 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat';

test.describe('Maternity and Child Health Clinic Search', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the maternity clinic search page
    await page.goto(BASE_URL);
    
    // Handle cookie consent and potential survey modal
    await TestUtils.handleCookieConsent(page);
    await TestUtils.handleSurveyModal(page);
    
    // Wait for the search interface to be ready
    await page.waitForSelector('#hae-neuvolaa', { timeout: 10000 });
  });

  test.describe('Performance Requirements', () => {
    test('page loads within 3 seconds', async ({ page }) => {
      // Reload page to measure fresh load time
      const performance = await PerformanceHelper.measurePageLoad(page);
      
      expect(performance.isWithinStandard).toBe(true);
      expect(performance.loadTime).toBeLessThanOrEqual(TEST_DATA.PERFORMANCE_STANDARDS.PAGE_LOAD);
      
      console.log(`Page load time: ${performance.loadTime}ms (standard: ≤${performance.standard}ms)`);
    });

    test('search responds within 2 seconds', async ({ page }) => {
      const searchAction = async () => {
        const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
        await searchBox.fill('Mannerheimintie 1');
        
        const searchButton = page.getByRole('button', { name: 'Etsi' });
        await searchButton.click();
      };

      const performance = await PerformanceHelper.measureSearchResponse(page, searchAction);
      
      expect(performance.isWithinStandard).toBe(true);
      expect(performance.responseTime).toBeLessThanOrEqual(TEST_DATA.PERFORMANCE_STANDARDS.SEARCH_RESPONSE);
      
      console.log(`Search response time: ${performance.responseTime}ms (standard: ≤${performance.standard}ms)`);
    });

    test('view switching completes within 1 second', async ({ page }) => {
      // First ensure we have search results
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(2000);

      const switchAction = async () => {
        // Switch to map view
        const mapViewButton = page.getByRole('tab', { name: 'Näytä kartalla' });
        await mapViewButton.click();
      };

      const performance = await PerformanceHelper.measureViewSwitch(page, switchAction);
      
      expect(performance.isWithinStandard).toBe(true);
      expect(performance.switchTime).toBeLessThanOrEqual(TEST_DATA.PERFORMANCE_STANDARDS.VIEW_SWITCH);
      
      console.log(`View switch time: ${performance.switchTime}ms (standard: ≤${performance.standard}ms)`);
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('has proper heading hierarchy', async ({ page }) => {
      const headingValidation = await AccessibilityHelper.validateHeadingHierarchy(page);
      
      expect(headingValidation.isValid).toBe(true);
      
      if (headingValidation.issues.length > 0) {
        console.log('Heading hierarchy issues:', headingValidation.issues);
      }
      
      // Ensure we have at least one h1 heading
      const h1Count = headingValidation.headings.filter(h => h.level === 1).length;
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test('supports keyboard navigation within 15 tab stops', async ({ page }) => {
      const keyboardTest = await AccessibilityHelper.testKeyboardNavigation(page);
      
      expect(keyboardTest.isWithinStandard).toBe(true);
      expect(keyboardTest.tabCount).toBeLessThanOrEqual(TEST_DATA.DATA_QUALITY_STANDARDS.MIN_SWEDISH_SERVICES * 5); // Reasonable limit
      
      console.log(`Keyboard navigation: ${keyboardTest.tabCount} tab stops (standard: ≤${keyboardTest.standard})`);
      
      // Verify we can reach the search button
      const lastTabStop = keyboardTest.tabStops[keyboardTest.tabStops.length - 1];
      expect(lastTabStop.text?.includes('Etsi') || lastTabStop.ariaLabel?.includes('search')).toBe(true);
    });

    test('has proper ARIA labels and landmarks', async ({ page }) => {
      const ariaValidation = await AccessibilityHelper.validateAriaCompliance(page);
      
      expect(ariaValidation.isCompliant).toBe(true);
      expect(ariaValidation.landmarkCount).toBeGreaterThan(0);
      
      if (ariaValidation.issues.length > 0) {
        console.log('ARIA compliance issues:', ariaValidation.issues);
      }
    });
  });

  test.describe('Data Quality Standards', () => {
    test('displays 15-30 clinics with ≥90% information completeness', async ({ page }) => {
      // Perform a search to get results
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      // Validate clinic count
      const countValidation = await DataQualityHelper.validateClinicCount(page);
      expect(countValidation.isWithinRange).toBe(true);
      expect(countValidation.totalCount).toBeGreaterThanOrEqual(TEST_DATA.DATA_QUALITY_STANDARDS.MIN_CLINICS);
      expect(countValidation.totalCount).toBeLessThanOrEqual(TEST_DATA.DATA_QUALITY_STANDARDS.MAX_CLINICS);

      // Validate data completeness
      const dataValidation = await DataQualityHelper.validateClinicData(page);
      expect(dataValidation.isWithinStandard).toBe(true);
      expect(dataValidation.completenessRate).toBeGreaterThanOrEqual(TEST_DATA.DATA_QUALITY_STANDARDS.COMPLETENESS_RATE);

      console.log(`Found ${countValidation.totalCount} clinics with ${dataValidation.completenessRate.toFixed(1)}% completeness`);
    });

    test('provides at least 3 Swedish language services', async ({ page }) => {
      // Perform a search to get results
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      const dataValidation = await DataQualityHelper.validateClinicData(page);
      expect(dataValidation.hasMinimumSwedishServices).toBe(true);
      expect(dataValidation.swedishServiceCount).toBeGreaterThanOrEqual(TEST_DATA.DATA_QUALITY_STANDARDS.MIN_SWEDISH_SERVICES);

      console.log(`Found ${dataValidation.swedishServiceCount} clinics with Swedish services`);
    });
  });

  test.describe('Geographic Search Functionality', () => {
    test('handles Helsinki address searches accurately', async ({ page }) => {
      for (const address of TEST_DATA.HELSINKI_ADDRESSES) {
        await TestUtils.clearSearch(page);
        
        const result = await GeographicHelper.testAddressSearch(page, address);
        
        expect(result.hasResults).toBe(true);
        expect(result.isReasonableCount).toBe(true);
        
        console.log(`Address "${address}": ${result.resultCount} results`);
      }
    });

    test('handles postal code searches accurately', async ({ page }) => {
      for (const postalCode of TEST_DATA.HELSINKI_POSTAL_CODES) {
        await TestUtils.clearSearch(page);
        
        const result = await GeographicHelper.testPostalCodeSearch(page, postalCode);
        
        expect(result.hasResults).toBe(true);
        expect(result.isReasonableCount).toBe(true);
        
        console.log(`Postal code "${postalCode}": ${result.resultCount} results`);
      }
    });

    test('handles invalid searches gracefully', async ({ page }) => {
      for (const invalidSearch of TEST_DATA.INVALID_SEARCHES) {
        await TestUtils.clearSearch(page);
        
        const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
        await searchBox.fill(invalidSearch);
        const searchButton = page.getByRole('button', { name: 'Etsi' });
        await searchButton.click();
        await page.waitForTimeout(2000);
        
        // Page should not crash and should handle gracefully
        const isPageResponsive = await page.isVisible('main');
        expect(isPageResponsive).toBe(true);
        
        console.log(`Invalid search "${invalidSearch}": handled gracefully`);
      }
    });
  });

  test.describe('Swedish Language Filter', () => {
    test('filters results to show only Swedish services', async ({ page }) => {
      // First get baseline results
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      const baselineCount = await TestUtils.getCurrentClinicCount(page);

      // Now apply Swedish filter
      const swedishCheckbox = page.getByRole('checkbox', { name: 'Näytä lähin toimipiste, josta saa palvelua ruotsiksi.' });
      await swedishCheckbox.check();
      await searchButton.click();
      await page.waitForTimeout(3000);

      const filteredCount = await TestUtils.getCurrentClinicCount(page);

      // Filtered results should be fewer than baseline
      expect(filteredCount).toBeLessThanOrEqual(baselineCount);
      expect(filteredCount).toBeGreaterThan(0);

      // Verify all results show Swedish services
      const dataValidation = await DataQualityHelper.validateClinicData(page);
      const swedishResults = dataValidation.clinics.filter(clinic => clinic.hasSwedishService);
      expect(swedishResults.length).toBe(filteredCount);

      console.log(`Swedish filter: ${filteredCount} results (from ${baselineCount} total)`);
    });
  });

  test.describe('View Switching', () => {
    test('switches between list and map views', async ({ page }) => {
      // Ensure we have search results
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      // Test switching to map view
      const mapViewButton = page.getByRole('tab', { name: 'Näytä kartalla' });
      await mapViewButton.click();
      await page.waitForTimeout(2000);

      // Verify map view is active
      const mapTabPanel = page.getByRole('tabpanel', { name: 'Näytä kartalla' });
      await expect(mapTabPanel).toBeVisible();

      // Test switching back to list view
      const listViewButton = page.getByRole('tab', { name: 'Näytä listana' });
      await listViewButton.click();
      await page.waitForTimeout(2000);

      // Verify list view is active
      const listTabPanel = page.getByRole('tabpanel', { name: 'Näytä listana' });
      await expect(listTabPanel).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('functions properly on mobile devices (375px+)', async ({ page }) => {
      const mobileTest = await ResponsiveHelper.testMobileResponsiveness(page);
      
      expect(mobileTest.isFunctional).toBe(true);
      expect(mobileTest.isSearchVisible).toBe(true);
      expect(mobileTest.isContentVisible).toBe(true);

      // Test search functionality on mobile
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      const resultCount = await TestUtils.getCurrentClinicCount(page);
      expect(resultCount).toBeGreaterThan(0);

      console.log(`Mobile (${mobileTest.viewport.width}x${mobileTest.viewport.height}): ${resultCount} results`);
    });

    test('functions properly on tablet devices', async ({ page }) => {
      const tabletTest = await ResponsiveHelper.testTabletResponsiveness(page);
      
      expect(tabletTest.isFunctional).toBe(true);
      expect(tabletTest.isSearchVisible).toBe(true);
      expect(tabletTest.isContentVisible).toBe(true);

      // Test search functionality on tablet
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      const resultCount = await TestUtils.getCurrentClinicCount(page);
      expect(resultCount).toBeGreaterThan(0);

      console.log(`Tablet (${tabletTest.viewport.width}x${tabletTest.viewport.height}): ${resultCount} results`);
    });
  });

  test.describe('User Workflow Integration', () => {
    test('completes full search workflow', async ({ page }) => {
      // Step 1: Enter address
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Mannerheimintie 1, Helsinki');

      // Step 2: Enable Swedish services filter
      const swedishCheckbox = page.getByRole('checkbox', { name: 'Näytä lähin toimipiste, josta saa palvelua ruotsiksi.' });
      await swedishCheckbox.check();

      // Step 3: Perform search
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      // Step 4: Verify results
      const resultCount = await TestUtils.getCurrentClinicCount(page);
      expect(resultCount).toBeGreaterThan(0);

      // Step 5: Switch to map view
      const mapViewButton = page.getByRole('tab', { name: 'Näytä kartalla' });
      await mapViewButton.click();
      await page.waitForTimeout(2000);

      // Step 6: Verify map view is functional
      const mapTabPanel = page.getByRole('tabpanel', { name: 'Näytä kartalla' });
      await expect(mapTabPanel).toBeVisible();

      // Step 7: Return to list view
      const listViewButton = page.getByRole('tab', { name: 'Näytä listana' });
      await listViewButton.click();
      await page.waitForTimeout(2000);

      // Step 8: Verify we can access clinic details
      const firstClinicLink = page.locator('h4 a').first();
      await expect(firstClinicLink).toBeVisible();
      
      console.log(`Full workflow completed: ${resultCount} results found`);
    });

    test('handles search refinement workflow', async ({ page }) => {
      // Initial broad search
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('Helsinki');
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      await page.waitForTimeout(3000);

      const initialCount = await TestUtils.getCurrentClinicCount(page);

      // Refine with specific address
      await searchBox.fill('Mannerheimintie 1, Helsinki');
      await searchButton.click();
      await page.waitForTimeout(3000);

      const refinedCount = await TestUtils.getCurrentClinicCount(page);

      // Refined search should typically return fewer, more relevant results
      expect(refinedCount).toBeGreaterThan(0);
      expect(refinedCount).toBeLessThanOrEqual(initialCount);

      console.log(`Search refinement: ${initialCount} → ${refinedCount} results`);
    });
  });
});

/**
 * Additional test utilities and custom matchers
 */
test.describe('🧪 Test Infrastructure Validation', () => {
  
  test('should validate test helper functions work correctly', async ({ page }) => {
    // Test that our helper functions are working
    const clinicCount = await TestUtils.getCurrentClinicCount(page);
    expect(clinicCount, 'Helper function should return valid clinic count').toBeGreaterThan(0);
    
    const dataQuality = await DataQualityHelper.validateClinicData(page);
    expect(dataQuality.totalClinics, 'Data quality helper should return clinic data').toBeGreaterThan(0);
    
    console.log(`✅ Test helpers validated: ${clinicCount} clinics, ${dataQuality.totalClinics} data entries`);
  });

  test('should have all required page elements for testing', async ({ page }) => {
    // Verify that all the elements we need for testing are present
    const requiredElements = [
      'input[type="search"]#address',                      // Search input
      'button:has-text("Etsi")',                       // Search button
      'main',                                          // Main content area
      'search'                                         // Search form
    ];
    
    for (const selector of requiredElements) {
      const element = await page.waitForSelector(selector, { timeout: 10000 });
      expect(element, `Required element not found: ${selector}`).toBeTruthy();
    }
    
    console.log(`✅ All ${requiredElements.length} required page elements found`);
  });
}); 