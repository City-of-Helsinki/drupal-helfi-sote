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
    await page.waitForLoadState('networkidle');
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
    await page.waitForFunction(() => {
      const heading = document.querySelector('h3');
      return heading && heading.textContent.includes('neuvola');
    }, { timeout: 5000 });
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
    await page.waitForTimeout(100); // Allow for UI update
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

    // Start from the search section
    await page.focus('[role="search"]');
    
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
    // Wait for results to be present
    await page.waitForSelector('tabpanel', { timeout: 5000 });
    
    const clinics = await page.$$eval('tabpanel > div', elements => 
      elements.map(el => {
        const nameElement = el.querySelector('h4 a');
        const name = nameElement?.textContent?.trim();
        const addressElement = el.querySelector('[class*="Osoite"], div:has-text("Osoite:")');
        const address = addressElement?.textContent?.replace('Osoite:', '').trim();
        const swedishService = el.querySelector('[class*="Ruotsinkielistä"], div:has-text("Ruotsinkielistä")') !== null;
        
        return {
          name: name || '',
          address: address || '',
          hasSwedishService: swedishService,
          isComplete: !!(name && address)
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
    // Look for the heading that shows clinic count
    const countElement = await page.$('h3');
    let totalCount = 0;
    
    if (countElement) {
      const countText = await countElement.textContent();
      const match = countText.match(/(\d+)/);
      totalCount = match ? parseInt(match[1]) : 0;
    } else {
      // Fallback: count visible clinic items
      totalCount = await page.$$eval('tabpanel > div', elements => elements.length);
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
 * Geographic accuracy testing utilities
 */
export class GeographicHelper {
  /**
   * Test address search accuracy
   */
  static async testAddressSearch(page, address) {
    const searchBox = await page.getByRole('searchbox', { name: 'Kotiosoite' });
    await searchBox.fill(address);
    
    const searchButton = await page.getByRole('button', { name: 'Etsi' });
    await searchButton.click();
    
    // Wait for results to update
    await page.waitForFunction(() => {
      const heading = document.querySelector('h3');
      return heading && heading.textContent.includes('neuvola');
    }, { timeout: 5000 });
    
    const resultCount = await page.$$eval('tabpanel > div', elements => elements.length);
    
    return {
      address,
      resultCount,
      hasResults: resultCount > 0,
      isReasonableCount: resultCount >= 1 && resultCount <= 5 // Geographic relevance
    };
  }

  /**
   * Test postal code search
   */
  static async testPostalCodeSearch(page, postalCode) {
    const searchBox = await page.getByRole('searchbox', { name: 'Kotiosoite' });
    await searchBox.fill(postalCode);
    
    const searchButton = await page.getByRole('button', { name: 'Etsi' });
    await searchButton.click();
    
    // Wait for results to update
    await page.waitForFunction(() => {
      const heading = document.querySelector('h3');
      return heading && heading.textContent.includes('neuvola');
    }, { timeout: 5000 });
    
    const resultCount = await page.$$eval('tabpanel > div', elements => elements.length);
    
    return {
      postalCode,
      resultCount,
      hasResults: resultCount > 0,
      isReasonableCount: resultCount >= 1 && resultCount <= 5
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
    await page.waitForTimeout(500); // Allow for responsive adjustments
    
    const searchForm = await page.$('[role="search"]');
    const isSearchVisible = await searchForm.isVisible();
    
    const clinicList = await page.$('tabpanel');
    const isListVisible = await clinicList.isVisible();
    
    return {
      viewport: { width: 375, height: 667 },
      isSearchVisible,
      isListVisible,
      isFunctional: isSearchVisible && isListVisible
    };
  }

  /**
   * Test tablet functionality
   */
  static async testTabletResponsiveness(page) {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    const searchForm = await page.$('[role="search"]');
    const isSearchVisible = await searchForm.isVisible();
    
    const clinicList = await page.$('tabpanel');
    const isListVisible = await clinicList.isVisible();
    
    return {
      viewport: { width: 768, height: 1024 },
      isSearchVisible,
      isListVisible,
      isFunctional: isSearchVisible && isListVisible
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
      const cookieButton = await page.$('button:has-text("Hyväksy kaikki evästeet")');
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
      const surveyButton = await page.$('button:has-text("En osallistu kyselyyn")');
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
   * Clear search and reset to default state
   */
  static async clearSearch(page) {
    try {
      // Use the clear button if available
      const clearButton = await page.$('button:has-text("Tyhjennä")');
      if (clearButton) {
        await clearButton.click();
        await page.waitForTimeout(1000);
        return;
      }
      
      // Fallback: clear the search box manually
      const searchBox = await page.getByRole('searchbox', { name: 'Kotiosoite' });
      if (searchBox) {
        await searchBox.fill('');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('Could not clear search:', error.message);
    }
  }

  /**
   * Get current clinic count from the page
   */
  static async getCurrentClinicCount(page) {
    try {
      const countElement = await page.$('h3');
      if (countElement) {
        const countText = await countElement.textContent();
        const match = countText.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      
      // Fallback: count visible items
      return await page.$$eval('tabpanel > div', elements => elements.length);
    } catch (error) {
      return 0;
    }
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