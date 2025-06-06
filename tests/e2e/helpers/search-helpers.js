/**
 * Helper functions for maternity and child health clinic search tests
 * Provides healthcare-specific utilities for performance, accessibility, and data validation
 */

/**
 * Performance measurement utilities for healthcare service requirements
 */
export class PerformanceHelper {
  /**
   * Measure page load time with healthcare standards (≤3 seconds)
   */
  static async measurePageLoad(page) {
    const startTime = Date.now();
    // Use domcontentloaded instead of networkidle for faster, more reliable loading
    await page.waitForLoadState('domcontentloaded');
    // Wait for the main content to be visible
    await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    return {
      loadTime,
      isWithinStandard: loadTime <= 3000,
      standard: 3000
    };
  }

  /**
   * Measure search response time with healthcare standards (≤2 seconds)
   */
  static async measureSearchResponse(page, searchAction) {
    const startTime = Date.now();
    await searchAction();
    // Wait for search results to update - look for the results heading change
    await page.waitForSelector('tabpanel', { timeout: 10000 });
    const responseTime = Date.now() - startTime;
    
    return {
      responseTime,
      isWithinStandard: responseTime <= 2000,
      standard: 2000
    };
  }

  /**
   * Measure view switching time (≤1 second)
   */
  static async measureViewSwitch(page, switchAction) {
    const startTime = Date.now();
    await switchAction();
    await page.waitForTimeout(500); // Allow for UI update
    const switchTime = Date.now() - startTime;
    
    return {
      switchTime,
      isWithinStandard: switchTime <= 1000,
      standard: 1000
    };
  }
}

/**
 * Accessibility validation utilities for healthcare compliance
 */
export class AccessibilityHelper {
  /**
   * Validate heading hierarchy (h1 → h2 → h3)
   */
  static async validateHeadingHierarchy(page) {
    // Wait for headings to be present
    await page.waitForSelector('h1, h2, h3', { timeout: 10000 });
    
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent.trim()
      }))
    );

    const issues = [];
    let previousLevel = 0;

    for (const heading of headings) {
      if (heading.level > previousLevel + 1) {
        issues.push(`Heading level ${heading.level} follows level ${previousLevel}: "${heading.text}"`);
      }
      previousLevel = heading.level;
    }

    return {
      isValid: issues.length === 0,
      issues,
      headings
    };
  }

  /**
   * Test keyboard navigation workflow
   */
  static async testKeyboardNavigation(page) {
    const tabStops = [];
    let tabCount = 0;
    const maxTabs = 20; // Reasonable limit for healthcare search

    // Start from the search section under "Hae neuvolaa" heading
    await page.waitForSelector('#hae-neuvolaa', { timeout: 10000 });
    
    // Focus on the search input using the correct selector
    const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
    await searchBox.focus();
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el.tagName,
          type: el.type,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent?.trim().substring(0, 50)
        };
      });
      
      tabStops.push(activeElement);
      
      // Check if we've reached the search button
      if (activeElement.text?.includes('Etsi') || activeElement.ariaLabel?.includes('search')) {
        break;
      }
    }

    return {
      tabCount,
      isWithinStandard: tabCount <= 15, // Healthcare standard
      tabStops,
      standard: 15
    };
  }

  /**
   * Validate ARIA labels and landmarks
   */
  static async validateAriaCompliance(page) {
    const ariaIssues = [];
    
    // Check for proper landmarks
    const landmarks = await page.$$eval('[role="search"], [role="main"], [role="navigation"]', 
      elements => elements.length
    );
    
    if (landmarks === 0) {
      ariaIssues.push('No ARIA landmarks found');
    }

    // Check form elements have labels
    const unlabeledInputs = await page.$$eval('input:not([aria-label]):not([aria-labelledby])', 
      elements => elements.filter(el => !el.labels || el.labels.length === 0).length
    );
    
    if (unlabeledInputs > 0) {
      ariaIssues.push(`${unlabeledInputs} form elements without proper labels`);
    }

    return {
      isCompliant: ariaIssues.length === 0,
      issues: ariaIssues,
      landmarkCount: landmarks
    };
  }
}

/**
 * Data quality assessment for healthcare information
 */
export class DataQualityHelper {
  /**
   * Validate clinic information completeness (≥90% standard)
   */
  static async validateClinicData(page) {
    // Wait for results to be present - look for clinic results after search
    await page.waitForSelector('h4 a', { timeout: 15000 });
    
    // The clinic results appear as h4 links in the search results
    const clinics = await page.$$eval('h4 a', elements => 
      elements.map(el => {
        const clinicContainer = el.closest('generic') || el.closest('div');
        const name = el.textContent?.trim();
        const containerText = clinicContainer?.textContent || '';
        const hasAddress = containerText.includes('Osoite:') || /\d{5}/.test(containerText);
        const swedishService = containerText.includes('Ruotsinkielistä palvelua');
        
        return {
          name: name || '',
          address: hasAddress ? 'Present' : '',
          hasSwedishService: swedishService,
          isComplete: !!(name && hasAddress)
        };
      })
    );

    const completeCount = clinics.filter(clinic => clinic.isComplete).length;
    const completenessRate = clinics.length > 0 ? (completeCount / clinics.length) * 100 : 0;
    const swedishServiceCount = clinics.filter(clinic => clinic.hasSwedishService).length;

    return {
      totalClinics: clinics.length,
      completeCount,
      completenessRate,
      isWithinStandard: completenessRate >= 90,
      swedishServiceCount,
      hasMinimumSwedishServices: swedishServiceCount >= 3,
      clinics,
      standard: 90
    };
  }

  /**
   * Validate clinic count is within expected range (15-30)
   */
  static async validateClinicCount(page) {
    // Look for the heading that shows clinic count (e.g., "20 neuvolaa" or "1 neuvola")
    await page.waitForSelector('h3', { timeout: 10000 });
    
    let totalCount = 0;
    
    try {
      // Find the h3 element that contains the clinic count
      const countText = await page.$eval('h3', el => el.textContent);
      const match = countText.match(/(\d+)\s+neuvola/);
      totalCount = match ? parseInt(match[1]) : 0;
    } catch (error) {
      // Fallback: count visible clinic items
      totalCount = await page.$$eval('h4 a', elements => elements.length);
    }

    return {
      totalCount,
      isWithinRange: totalCount >= 15 && totalCount <= 30,
      minExpected: 15,
      maxExpected: 30
    };
  }
}

/**
 * Geographic search accuracy testing
 */
export class GeographicHelper {
  /**
   * Test address search accuracy
   */
  static async testAddressSearch(page, address) {
    const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
    await searchBox.fill(address);
    
    const searchButton = page.getByRole('button', { name: 'Etsi' });
    await searchButton.click();
    
    // Wait for results to update
    await page.waitForTimeout(3000);
    
    const resultCount = await TestUtils.getCurrentClinicCount(page);
    
    return {
      address,
      resultCount,
      hasResults: resultCount > 0,
      isReasonableCount: resultCount >= 1 && resultCount <= 10 // Geographic relevance
    };
  }

  /**
   * Test postal code search
   */
  static async testPostalCodeSearch(page, postalCode) {
    const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
    await searchBox.fill(postalCode);
    
    const searchButton = page.getByRole('button', { name: 'Etsi' });
    await searchButton.click();
    
    // Wait for results to update
    await page.waitForTimeout(3000);
    
    const resultCount = await TestUtils.getCurrentClinicCount(page);
    
    return {
      postalCode,
      resultCount,
      hasResults: resultCount > 0,
      isReasonableCount: resultCount >= 1 && resultCount <= 10
    };
  }
}

/**
 * Responsive design validation
 */
export class ResponsiveHelper {
  /**
   * Test mobile functionality (375px+ viewports)
   */
  static async testMobileResponsiveness(page) {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Allow for responsive adjustments
    
    const searchForm = await page.waitForSelector('search', { timeout: 10000 });
    const isSearchVisible = await searchForm.isVisible();
    
    const mainContent = await page.waitForSelector('main', { timeout: 10000 });
    const isContentVisible = await mainContent.isVisible();
    
    return {
      viewport: { width: 375, height: 667 },
      isSearchVisible,
      isContentVisible,
      isFunctional: isSearchVisible && isContentVisible
    };
  }

  /**
   * Test tablet functionality
   */
  static async testTabletResponsiveness(page) {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const searchForm = await page.waitForSelector('search', { timeout: 10000 });
    const isSearchVisible = await searchForm.isVisible();
    
    const mainContent = await page.waitForSelector('main', { timeout: 10000 });
    const isContentVisible = await mainContent.isVisible();
    
    return {
      viewport: { width: 768, height: 1024 },
      isSearchVisible,
      isContentVisible,
      isFunctional: isSearchVisible && isContentVisible
    };
  }
}

/**
 * Common test utilities
 */
export class TestUtils {
  /**
   * Handle cookie consent banner
   */
  static async handleCookieConsent(page) {
    try {
      const cookieButton = await page.waitForSelector('button:has-text("Hyväksy kaikki evästeet")', { timeout: 3000 });
      if (cookieButton) {
        await cookieButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      // Cookie banner might not be present
      console.log('Cookie banner not found or already handled');
    }
  }

  /**
   * Handle potential survey modal
   */
  static async handleSurveyModal(page) {
    try {
      const surveyButton = await page.waitForSelector('button:has-text("En osallistu kyselyyn")', { timeout: 3000 });
      if (surveyButton) {
        await surveyButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      // Survey modal might not be present
      console.log('Survey modal not found or already handled');
    }
  }

  /**
   * Clear search form and return to default state
   */
  static async clearSearch(page) {
    try {
      // Clear the search input using the correct selector
      const searchBox = page.getByRole('searchbox', { name: 'Kotiosoite' });
      await searchBox.fill('');
      
      // Uncheck Swedish language filter if checked
      const swedishCheckbox = page.getByRole('checkbox', { name: 'Näytä lähin toimipiste, josta saa palvelua ruotsiksi.' });
      if (await swedishCheckbox.isChecked()) {
        await swedishCheckbox.uncheck();
      }
      
      // Click search to reset results
      const searchButton = page.getByRole('button', { name: 'Etsi' });
      await searchButton.click();
      
      // Wait for reset to complete
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('Search clear failed:', error.message);
    }
  }

  /**
   * Get current clinic count from search results
   */
  static async getCurrentClinicCount(page) {
    try {
      // Try to get count from the h3 heading (e.g., "20 neuvolaa" or "1 neuvola")
      const countText = await page.$eval('h3', el => el.textContent);
      const match = countText.match(/(\d+)\s+neuvola/);
      if (match) {
        return parseInt(match[1]);
      }
    } catch (error) {
      // Fallback: count visible clinic links
      try {
        return await page.$$eval('h4 a', elements => elements.length);
      } catch (fallbackError) {
        return 0;
      }
    }
    return 0;
  }
}

/**
 * Test data constants
 */
export const TEST_DATA = {
  HELSINKI_ADDRESSES: [
    'Mannerheimintie 1',
    'Aleksanterinkatu 1',
    'Töölönkatu 1',
    'Hämeentie 1',
    'Unioninkatu 1'
  ],
  
  HELSINKI_POSTAL_CODES: [
    '00100',
    '00120',
    '00140',
    '00160',
    '00180'
  ],
  
  INVALID_SEARCHES: [
    '',
    'Tukholma',
    '12345',
    'åäö!@#',
    'Very long address that should not exist in Helsinki and should return no results'
  ],
  
  PERFORMANCE_STANDARDS: {
    PAGE_LOAD: 3000,
    SEARCH_RESPONSE: 2000,
    VIEW_SWITCH: 1000
  },
  
  DATA_QUALITY_STANDARDS: {
    MIN_CLINICS: 15,
    MAX_CLINICS: 30,
    COMPLETENESS_RATE: 90,
    MIN_SWEDISH_SERVICES: 3
  }
}; 