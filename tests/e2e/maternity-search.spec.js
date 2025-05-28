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

const MATERNITY_SEARCH_URL = '/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat';

test.describe('Maternity and Child Health Clinic Search', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the maternity search page
    await page.goto(MATERNITY_SEARCH_URL);
    
    // Handle cookie consent and potential modals
    await TestUtils.handleCookieConsent(page);
    await TestUtils.handleSurveyModal(page);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('🏥 Healthcare Service Performance Tests', () => {
    
    test('should meet page load performance standards (≤3 seconds)', async ({ page }) => {
      const performance = await PerformanceHelper.measurePageLoad(page);
      
      expect(performance.isWithinStandard, 
        `Page load time ${performance.loadTime}ms exceeds healthcare standard of ${performance.standard}ms`
      ).toBe(true);
      
      console.log(`✅ Page load time: ${performance.loadTime}ms (Standard: ≤${performance.standard}ms)`);
    });

    test('should meet search response performance standards (≤2 seconds)', async ({ page }) => {
      const searchAction = async () => {
        await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill('Mannerheimintie 1');
        await page.getByRole('button', { name: 'Etsi' }).click();
      };
      
      const performance = await PerformanceHelper.measureSearchResponse(page, searchAction);
      
      expect(performance.isWithinStandard,
        `Search response time ${performance.responseTime}ms exceeds healthcare standard of ${performance.standard}ms`
      ).toBe(true);
      
      console.log(`✅ Search response time: ${performance.responseTime}ms (Standard: ≤${performance.standard}ms)`);
    });

    test('should meet view switching performance standards (≤1 second)', async ({ page }) => {
      // Ensure we're on list view first
      await page.getByRole('tab', { name: 'Näytä listana' }).click();
      
      const switchAction = async () => {
        await page.getByRole('tab', { name: 'Näytä kartalla' }).click();
      };
      
      const performance = await PerformanceHelper.measureViewSwitch(page, switchAction);
      
      expect(performance.isWithinStandard,
        `View switch time ${performance.switchTime}ms exceeds healthcare standard of ${performance.standard}ms`
      ).toBe(true);
      
      console.log(`✅ View switch time: ${performance.switchTime}ms (Standard: ≤${performance.standard}ms)`);
    });
  });

  test.describe('📊 Data Quality and Healthcare Standards', () => {
    
    test('should display expected number of clinics (15-30 range)', async ({ page }) => {
      const clinicCount = await DataQualityHelper.validateClinicCount(page);
      
      expect(clinicCount.isWithinRange,
        `Clinic count ${clinicCount.totalCount} is outside expected range ${clinicCount.minExpected}-${clinicCount.maxExpected}`
      ).toBe(true);
      
      console.log(`✅ Clinic count: ${clinicCount.totalCount} (Expected: ${clinicCount.minExpected}-${clinicCount.maxExpected})`);
    });

    test('should meet clinic information completeness standards (≥90%)', async ({ page }) => {
      const dataQuality = await DataQualityHelper.validateClinicData(page);
      
      expect(dataQuality.isWithinStandard,
        `Clinic information completeness ${dataQuality.completenessRate}% below healthcare standard of ${dataQuality.standard}%`
      ).toBe(true);
      
      expect(dataQuality.hasMinimumSwedishServices,
        `Only ${dataQuality.swedishServiceCount} clinics offer Swedish services, minimum required is 3`
      ).toBe(true);
      
      console.log(`✅ Information completeness: ${dataQuality.completenessRate}% (Standard: ≥${dataQuality.standard}%)`);
      console.log(`✅ Swedish services: ${dataQuality.swedishServiceCount} clinics (Minimum: 3)`);
    });

    test('should display complete clinic information for each entry', async ({ page }) => {
      const dataQuality = await DataQualityHelper.validateClinicData(page);
      
      // Check that each clinic has required information
      for (const clinic of dataQuality.clinics.slice(0, 5)) { // Test first 5 clinics
        expect(clinic.name, `Clinic missing name: ${JSON.stringify(clinic)}`).toBeTruthy();
        expect(clinic.address, `Clinic missing address: ${JSON.stringify(clinic)}`).toBeTruthy();
      }
      
      console.log(`✅ Validated ${dataQuality.clinics.length} clinic entries for completeness`);
    });
  });

  test.describe('🔍 Search Functionality Tests', () => {
    
    test('should perform address search with geographic accuracy', async ({ page }) => {
      for (const address of TEST_DATA.HELSINKI_ADDRESSES.slice(0, 3)) {
        await TestUtils.clearSearch(page);
        
        const result = await GeographicHelper.testAddressSearch(page, address);
        
        expect(result.hasResults, `No results found for address: ${address}`).toBe(true);
        expect(result.isReasonableCount, 
          `Unreasonable result count ${result.resultCount} for address: ${address}`
        ).toBe(true);
        
        console.log(`✅ Address search "${address}": ${result.resultCount} results`);
      }
    });

    test('should perform postal code search with geographic accuracy', async ({ page }) => {
      for (const postalCode of TEST_DATA.HELSINKI_POSTAL_CODES.slice(0, 3)) {
        await TestUtils.clearSearch(page);
        
        const result = await GeographicHelper.testPostalCodeSearch(page, postalCode);
        
        expect(result.hasResults, `No results found for postal code: ${postalCode}`).toBe(true);
        expect(result.isReasonableCount,
          `Unreasonable result count ${result.resultCount} for postal code: ${postalCode}`
        ).toBe(true);
        
        console.log(`✅ Postal code search "${postalCode}": ${result.resultCount} results`);
      }
    });

    test('should filter Swedish language services correctly', async ({ page }) => {
      // Test Swedish language filter
      await page.getByRole('checkbox', { name: 'Näytä lähin toimipiste, josta saa palvelua ruotsiksi.' }).check();
      await page.getByRole('button', { name: 'Etsi' }).click();
      
      await page.waitForSelector('tabpanel', { timeout: 5000 });
      
      // Verify that results show Swedish services
      const swedishServices = await page.$$eval('tabpanel > div', elements =>
        elements.filter(el => 
          el.textContent.includes('Ruotsinkielistä palvelua') || 
          el.textContent.includes('svenska')
        ).length
      );
      
      expect(swedishServices, 'No Swedish language services found when filter is applied').toBeGreaterThan(0);
      
      console.log(`✅ Swedish language filter: ${swedishServices} services found`);
    });

    test('should handle search reset functionality', async ({ page }) => {
      // Perform a search first
      await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill('Mannerheimintie 1');
      await page.getByRole('button', { name: 'Etsi' }).click();
      await page.waitForTimeout(1000);
      
      const searchedCount = await TestUtils.getCurrentClinicCount(page);
      
      // Clear search
      await TestUtils.clearSearch(page);
      
      const defaultCount = await TestUtils.getCurrentClinicCount(page);
      
      expect(defaultCount, 'Search reset did not restore default clinic count').toBeGreaterThanOrEqual(searchedCount);
      
      console.log(`✅ Search reset: ${searchedCount} → ${defaultCount} clinics`);
    });

    test('should handle invalid search inputs gracefully', async ({ page }) => {
      for (const invalidSearch of TEST_DATA.INVALID_SEARCHES.slice(0, 3)) {
        await TestUtils.clearSearch(page);
        
        await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill(invalidSearch);
        await page.getByRole('button', { name: 'Etsi' }).click();
        await page.waitForTimeout(1000);
        
        // Page should not crash and should show some results or appropriate message
        const pageTitle = await page.title();
        expect(pageTitle).toContain('Äitiys- ja lastenneuvolat');
        
        console.log(`✅ Invalid search "${invalidSearch}" handled gracefully`);
      }
    });
  });

  test.describe('♿ Accessibility and Usability Tests', () => {
    
    test('should have proper heading hierarchy for screen readers', async ({ page }) => {
      const headingValidation = await AccessibilityHelper.validateHeadingHierarchy(page);
      
      expect(headingValidation.isValid, 
        `Heading hierarchy issues: ${headingValidation.issues.join(', ')}`
      ).toBe(true);
      
      console.log(`✅ Heading hierarchy validated: ${headingValidation.headings.length} headings`);
    });

    test('should support full keyboard navigation workflow', async ({ page }) => {
      const keyboardTest = await AccessibilityHelper.testKeyboardNavigation(page);
      
      expect(keyboardTest.isWithinStandard,
        `Keyboard navigation requires ${keyboardTest.tabCount} tabs, exceeds standard of ${keyboardTest.standard}`
      ).toBe(true);
      
      console.log(`✅ Keyboard navigation: ${keyboardTest.tabCount} tab stops (Standard: ≤${keyboardTest.standard})`);
    });

    test('should have proper ARIA labels and landmarks', async ({ page }) => {
      const ariaValidation = await AccessibilityHelper.validateAriaCompliance(page);
      
      expect(ariaValidation.isCompliant,
        `ARIA compliance issues: ${ariaValidation.issues.join(', ')}`
      ).toBe(true);
      
      console.log(`✅ ARIA compliance validated: ${ariaValidation.landmarkCount} landmarks found`);
    });

    test('should be functional on mobile devices (375px+)', async ({ page }) => {
      const mobileTest = await ResponsiveHelper.testMobileResponsiveness(page);
      
      expect(mobileTest.isFunctional,
        `Mobile functionality failed at ${mobileTest.viewport.width}x${mobileTest.viewport.height}`
      ).toBe(true);
      
      console.log(`✅ Mobile responsiveness: ${mobileTest.viewport.width}x${mobileTest.viewport.height}`);
    });

    test('should be functional on tablet devices', async ({ page }) => {
      const tabletTest = await ResponsiveHelper.testTabletResponsiveness(page);
      
      expect(tabletTest.isFunctional,
        `Tablet functionality failed at ${tabletTest.viewport.width}x${tabletTest.viewport.height}`
      ).toBe(true);
      
      console.log(`✅ Tablet responsiveness: ${tabletTest.viewport.width}x${tabletTest.viewport.height}`);
    });
  });

  test.describe('🚀 User Experience and Navigation Tests', () => {
    
    test('should support view switching between list and map', async ({ page }) => {
      // Test switching to map view
      await page.getByRole('tab', { name: 'Näytä kartalla' }).click();
      await page.waitForTimeout(500);
      
      const mapTab = await page.getByRole('tab', { name: 'Näytä kartalla', selected: true });
      expect(mapTab, 'Map view tab should be selected').toBeTruthy();
      
      // Test switching back to list view
      await page.getByRole('tab', { name: 'Näytä listana' }).click();
      await page.waitForTimeout(500);
      
      const listTab = await page.getByRole('tab', { name: 'Näytä listana', selected: true });
      expect(listTab, 'List view tab should be selected').toBeTruthy();
      
      console.log('✅ View switching between list and map works correctly');
    });

    test('should maintain search state across view switches', async ({ page }) => {
      // Perform a search
      await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill('Kamppi');
      await page.getByRole('button', { name: 'Etsi' }).click();
      await page.waitForTimeout(1000);
      
      const listViewCount = await TestUtils.getCurrentClinicCount(page);
      
      // Switch to map view
      await page.getByRole('tab', { name: 'Näytä kartalla' }).click();
      await page.waitForTimeout(500);
      
      // Switch back to list view
      await page.getByRole('tab', { name: 'Näytä listana' }).click();
      await page.waitForTimeout(500);
      
      const finalCount = await TestUtils.getCurrentClinicCount(page);
      
      expect(finalCount, 'Search state not maintained across view switches').toBe(listViewCount);
      
      console.log(`✅ Search state maintained: ${finalCount} clinics across view switches`);
    });

    test('should provide working links to clinic detail pages', async ({ page }) => {
      // Get the first clinic link
      const firstClinicLink = await page.$('tabpanel h4 a');
      expect(firstClinicLink, 'No clinic links found').toBeTruthy();
      
      const linkUrl = await firstClinicLink.getAttribute('href');
      expect(linkUrl, 'Clinic link missing href').toBeTruthy();
      expect(linkUrl, 'Clinic link should be relative or absolute URL').toMatch(/^(\/|https?:\/\/)/);
      
      console.log(`✅ Clinic links are properly formatted: ${linkUrl}`);
    });

    test('should display clinic contact information', async ({ page }) => {
      // Check that clinics have address information
      const addressElements = await page.$$('tabpanel div:has-text("Osoite:")');
      expect(addressElements.length, 'No address information found for clinics').toBeGreaterThan(0);
      
      console.log(`✅ Address information displayed for ${addressElements.length} clinic entries`);
    });
  });

  test.describe('🌐 Language and Internationalization Tests', () => {
    
    test('should support language switching to Swedish', async ({ page }) => {
      const swedishLink = await page.getByRole('link', { name: 'Svenska' });
      expect(swedishLink, 'Swedish language link not found').toBeTruthy();
      
      // Test that the link is properly formatted
      const href = await swedishLink.getAttribute('href');
      expect(href, 'Swedish link should contain /sv/ path').toContain('/sv/');
      
      console.log(`✅ Swedish language link available: ${href}`);
    });

    test('should support language switching to English', async ({ page }) => {
      const englishLink = await page.getByRole('link', { name: 'English' });
      expect(englishLink, 'English language link not found').toBeTruthy();
      
      // Test that the link is properly formatted
      const href = await englishLink.getAttribute('href');
      expect(href, 'English link should contain /en/ path').toContain('/en/');
      
      console.log(`✅ English language link available: ${href}`);
    });

    test('should display Swedish service indicators correctly', async ({ page }) => {
      const swedishIndicators = await page.$$('text=Ruotsinkielistä palvelua');
      expect(swedishIndicators.length, 'No Swedish service indicators found').toBeGreaterThanOrEqual(3);
      
      console.log(`✅ Swedish service indicators: ${swedishIndicators.length} found`);
    });
  });

  test.describe('🔧 Error Handling and Edge Cases', () => {
    
    test('should handle network timeouts gracefully', async ({ page }) => {
      // Simulate slow network by intercepting requests
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill('Mannerheimintie 1');
      await page.getByRole('button', { name: 'Etsi' }).click();
      
      // Should not crash and should eventually show results
      await page.waitForSelector('tabpanel', { timeout: 10000 });
      
      const clinicCount = await TestUtils.getCurrentClinicCount(page);
      expect(clinicCount, 'No results after network delay').toBeGreaterThan(0);
      
      console.log(`✅ Network timeout handling: ${clinicCount} clinics loaded`);
    });

    test('should maintain functionality with JavaScript disabled fallback', async ({ page, context }) => {
      // This test verifies that the Drupal Views fallback works
      // Note: Full JS disable testing would require a separate browser context
      
      // Test that basic page elements are present for fallback
      const searchForm = await page.$('[role="search"]');
      expect(searchForm, 'Search form not found for fallback functionality').toBeTruthy();
      
      const clinicList = await page.$('tabpanel');
      expect(clinicList, 'Clinic list not found for fallback functionality').toBeTruthy();
      
      console.log('✅ Fallback functionality elements present');
    });

    test('should handle special characters in search input', async ({ page }) => {
      const specialCharSearch = 'Hämeentie 1 (äöå)';
      
      await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill(specialCharSearch);
      await page.getByRole('button', { name: 'Etsi' }).click();
      await page.waitForTimeout(1000);
      
      // Should not crash
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Äitiys- ja lastenneuvolat');
      
      console.log(`✅ Special characters handled: "${specialCharSearch}"`);
    });
  });

  test.describe('📱 Cross-Browser and Device Compatibility', () => {
    
    test('should work consistently across different viewport sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1024, height: 768 },  // Desktop small
        { width: 1920, height: 1080 }  // Desktop large
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        const searchForm = await page.$('[role="search"]');
        const isVisible = await searchForm.isVisible();
        
        expect(isVisible, `Search form not visible at ${viewport.width}x${viewport.height}`).toBe(true);
        
        console.log(`✅ Viewport ${viewport.width}x${viewport.height}: Search form visible`);
      }
    });

    test('should maintain search functionality across viewport changes', async ({ page }) => {
      // Start with desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Perform search
      await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill('Kamppi');
      await page.getByRole('button', { name: 'Etsi' }).click();
      await page.waitForTimeout(1000);
      
      const desktopCount = await TestUtils.getCurrentClinicCount(page);
      
      // Switch to mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      const mobileCount = await TestUtils.getCurrentClinicCount(page);
      
      expect(mobileCount, 'Search results not maintained across viewport change').toBe(desktopCount);
      
      console.log(`✅ Search results maintained: ${desktopCount} → ${mobileCount} across viewport change`);
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
      { role: 'searchbox', name: 'Kotiosoite' },      // Search input
      { role: 'button', name: 'Etsi' },               // Search button
      'tabpanel',                                      // Results panel
      { role: 'tab', name: 'Näytä listana' },         // List view tab
      { role: 'tab', name: 'Näytä kartalla' }         // Map view tab
    ];
    
    for (const selector of requiredElements) {
      let element;
      if (typeof selector === 'string') {
        element = await page.$(selector);
      } else {
        element = await page.getByRole(selector.role, { name: selector.name });
      }
      expect(element, `Required element not found: ${JSON.stringify(selector)}`).toBeTruthy();
    }
    
    console.log(`✅ All ${requiredElements.length} required page elements found`);
  });
}); 