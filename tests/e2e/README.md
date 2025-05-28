# Maternity and Child Health Clinic Search Tests

This directory contains comprehensive Playwright end-to-end tests for the maternity and child health clinic search functionality on the Helsinki SOTE website, specifically designed for healthcare service requirements.

## Overview

The tests verify the functionality of the clinic search feature located at:
`https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat`

This search functionality is built with React and utilizes a Views listing (`maternity_and_child_health_clinics_search`) as a fallback when JavaScript is disabled. The React-based search uses a Search API index called `maternity_and_child_health_clinic`.

## Healthcare-Specific Requirements

### Performance Standards 🚀
- **Page Load**: ≤ 3 seconds (critical for healthcare service access)
- **Search Response**: ≤ 2 seconds (urgent healthcare needs)
- **View Switching**: ≤ 1 second (smooth user experience)

### Data Quality Standards 📊
- **Clinic Coverage**: 15-30 clinics in Helsinki (validated range)
- **Information Completeness**: ≥90% of clinics have complete information
- **Swedish Services**: ≥3 clinics with Swedish language services
- **Geographic Accuracy**: Address searches return 1-5 closest clinics

### Accessibility Standards ♿
- **WCAG Compliance**: Proper heading hierarchy (h1 → h2 → h3)
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Mobile Responsiveness**: Functional on 375px+ viewports

## Test Structure

### Main Test Files
- `maternity-search.spec.js` - Complete test suite with healthcare-specific scenarios
- `helpers/search-helpers.js` - Healthcare-specific utilities and helper functions

### Browser Coverage
- **Desktop**: Chromium (Chrome) only - optimized for speed and reliability
- **Mobile Testing**: Responsive design testing within Chromium at different viewport sizes

### Test Categories

#### 🏥 Healthcare Service Performance Tests
1. **Page Load Performance** - Validates ≤3 second loading times
2. **Search Response Performance** - Ensures ≤2 second search responses
3. **View Switching Performance** - Tests ≤1 second view transitions

#### 📊 Data Quality and Healthcare Standards
1. **Clinic Count Validation** - Ensures 15-30 clinics are available
2. **Information Completeness** - Validates ≥90% data completeness
3. **Swedish Service Availability** - Confirms ≥3 clinics offer Swedish services

#### 🔍 Search Functionality Tests
1. **Address Search** - Tests real Helsinki addresses
2. **Postal Code Search** - Validates geographic area filtering
3. **Swedish Language Filter** - Tests bilingual service filtering
4. **Search Reset** - Validates clear functionality
5. **Error Handling** - Tests invalid input handling

#### ♿ Accessibility and Usability Tests
1. **Heading Hierarchy** - Validates proper h1→h2→h3 structure
2. **Keyboard Navigation** - Tests full keyboard workflow (≤15 tab stops)
3. **ARIA Compliance** - Validates screen reader support
4. **Mobile Responsiveness** - Tests 375px+ viewport functionality
5. **Tablet Support** - Validates tablet device compatibility

#### 🚀 User Experience and Navigation Tests
1. **View Switching** - Tests list/map view transitions
2. **State Maintenance** - Validates search state persistence
3. **Clinic Links** - Tests navigation to clinic detail pages
4. **Contact Information** - Validates clinic address display

#### 🌐 Language and Internationalization Tests
1. **Language Switching** - Tests Swedish/English language links
2. **Swedish Service Indicators** - Validates service marking accuracy

#### 🔧 Error Handling and Edge Cases
1. **Network Timeout Handling** - Tests slow network resilience
2. **JavaScript Fallback** - Validates Drupal Views fallback
3. **Special Characters** - Tests Unicode input handling

#### 📱 Cross-Browser and Device Compatibility
1. **Viewport Compatibility** - Tests multiple screen sizes within Chromium
2. **Search State Persistence** - Validates functionality across viewport changes

## Helper Functions

### PerformanceHelper
- `measurePageLoad(page)` - Measures page load time against healthcare standards
- `measureSearchResponse(page, searchAction)` - Times search operations
- `measureViewSwitch(page, switchAction)` - Times view transitions

### AccessibilityHelper
- `validateHeadingHierarchy(page)` - Checks h1→h2→h3 structure
- `testKeyboardNavigation(page)` - Tests keyboard accessibility
- `validateAriaCompliance(page)` - Validates ARIA labels and landmarks

### DataQualityHelper
- `validateClinicData(page)` - Checks clinic information completeness
- `validateClinicCount(page)` - Validates clinic count range

### GeographicHelper
- `testAddressSearch(page, address)` - Tests address-based search
- `testPostalCodeSearch(page, postalCode)` - Tests postal code search

### ResponsiveHelper
- `testMobileResponsiveness(page)` - Tests mobile functionality
- `testTabletResponsiveness(page)` - Tests tablet functionality

### TestUtils
- `handleCookieConsent(page)` - Handles cookie banner
- `handleSurveyModal(page)` - Handles survey modal
- `clearSearch(page)` - Resets search to default state
- `getCurrentClinicCount(page)` - Gets current clinic count

## Running the Tests

### Prerequisites
```bash
npm install
```

### Install Browser
```bash
npm run install-browsers
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# Maternity search tests only
npm run test:maternity

# With browser UI visible
npm run test:headed

# Interactive UI mode
npm run test:ui

# Debug mode with step-by-step execution
npm run test:debug
```

### Run Specific Test Groups
```bash
# Performance tests only
npx playwright test --grep "Healthcare Service Performance"

# Accessibility tests only
npx playwright test --grep "Accessibility and Usability"

# Search functionality tests only
npx playwright test --grep "Search Functionality"

# Data quality tests only
npx playwright test --grep "Data Quality"
```

### Generate Test Reports
```bash
# Run tests and generate HTML report
npm test

# View the generated report
npm run show-report
```

## Test Data

### Helsinki Test Addresses
- `Mannerheimintie 1` - Central Helsinki
- `Aleksanterinkatu 1` - City Center  
- `Töölönkatu 1` - Töölö district
- `Hämeentie 1` - Kallio district
- `Unioninkatu 1` - Central Helsinki

### Postal Codes
- `00100` - Central Helsinki
- `00120` - Punavuori
- `00140` - Kaivopuisto
- `00160` - Ullanlinna
- `00180` - Kamppi

### Error Test Cases
- Empty searches
- Invalid addresses (e.g., "Tukholma")
- Special characters (e.g., "åäö!@#")
- Non-Helsinki locations
- Malformed postal codes

## Validation Criteria

### Performance Thresholds
- Page load: < 3000ms
- Search response: < 2000ms  
- View switching: < 1000ms

### Data Quality Metrics
- Total clinics: 15-30 range
- Information completeness: ≥90%
- Swedish services: ≥3 clinics
- Geographic relevance: 1-5 results per address

### Accessibility Requirements
- Keyboard navigation: ≤15 tabs to search functionality
- Mobile functionality: 375px+ viewports
- Heading hierarchy: h1 → h2 → h3 structure
- ARIA compliance: All form elements properly labeled

## Continuous Integration

The tests are designed to run in CI/CD environments with the following considerations:

### CI Configuration
```yaml
# Example GitHub Actions configuration
- name: Run Playwright Tests
  run: |
    npm ci
    npx playwright install chromium --with-deps
    npm run test:maternity
```

### Environment Variables
- `CI=true` - Enables CI-specific configurations
- `PLAYWRIGHT_BROWSERS_PATH` - Custom browser installation path

### Retry Strategy
- Tests retry 2 times on CI environments
- Performance tests have extended timeouts for slower CI environments

## Troubleshooting

### Common Issues

#### Cookie Banner Not Handled
```javascript
// The test automatically handles cookie consent
await TestUtils.handleCookieConsent(page);
```

#### Search Elements Not Found
```javascript
// Use the correct selectors
await page.getByRole('searchbox', { name: 'Kotiosoite' }).fill(address);
```

#### Performance Test Failures
```javascript
// Check if CI environment needs extended timeouts
const isCI = process.env.CI === 'true';
const timeout = isCI ? 5000 : 3000;
```

#### Mobile Test Issues
```javascript
// Ensure viewport is set correctly
await page.setViewportSize({ width: 375, height: 667 });
await page.waitForTimeout(500); // Allow for responsive adjustments
```

### Debug Mode
```bash
# Run with debug output
DEBUG=pw:api npm run test:maternity

# Run single test with debug
npx playwright test --debug --grep "should meet page load performance"
```

### Screenshots and Videos
```bash
# Enable screenshots on failure
npx playwright test --screenshot=only-on-failure

# Enable video recording
npx playwright test --video=retain-on-failure
```

## Contributing

### Adding New Tests
1. Follow the existing test structure and naming conventions
2. Use the provided helper functions for consistency
3. Include appropriate healthcare-specific validations
4. Add console.log statements for test progress tracking

### Test Categories
Use emoji prefixes for test categories:
- 🏥 Healthcare Service Performance
- 📊 Data Quality and Healthcare Standards  
- 🔍 Search Functionality
- ♿ Accessibility and Usability
- 🚀 User Experience and Navigation
- 🌐 Language and Internationalization
- 🔧 Error Handling and Edge Cases
- 📱 Cross-Browser and Device Compatibility

### Helper Function Guidelines
- Make functions reusable across different test scenarios
- Include proper error handling and timeouts
- Return structured data for easy validation
- Add JSDoc comments for documentation

## Healthcare Compliance

These tests are specifically designed to meet healthcare service requirements:

### Service Continuity
- Tests ensure uninterrupted access to healthcare information
- Validates fallback functionality for critical service access
- Confirms error resilience for healthcare service users

### Accessibility Compliance
- WCAG 2.1 AA compliance validation
- Screen reader compatibility testing
- Keyboard-only navigation support
- Mobile accessibility for healthcare service access

### Performance Standards
- Healthcare-specific timing requirements
- Critical service access performance validation
- User experience optimization for healthcare contexts

### Data Quality Assurance
- Healthcare information accuracy validation
- Service availability confirmation
- Geographic accuracy for healthcare service location

## License

MIT License - See LICENSE file for details.

## Support

For issues or questions about these tests:
1. Check the troubleshooting section above
2. Review the test output and error messages
3. Consult the Playwright documentation for advanced debugging
4. Contact the development team for healthcare-specific requirements 