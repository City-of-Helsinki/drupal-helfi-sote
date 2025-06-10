# E2E Tests for Helsinki SOTE Search Features

This directory contains Playwright end-to-end tests for the Helsinki SOTE (Social and Health Services) search features.

## Test Files

### 1. Maternity and Child Health Clinic Search (`maternity-and-child-health-clinic-search.spec.js`)

Tests the maternity and child health clinic search functionality at:
- **URL**: `/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat`

**Test Coverage:**
- Basic search functionality and initial page load
- Address-based filtering (street addresses, postal codes, multiple formats)
- Swedish language service filtering
- View switching (list/map toggle)
- Accessibility and mobile responsiveness
- Page content and structure validation

### 2. Health Station Search (`health-station-search.spec.js`)

Tests the health station search functionality at:
- **URL**: `/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/terveysasemat`

**Test Coverage:**
- Address-based search functionality
- React component testing
- Swedish language service filtering
- Accessibility and mobile responsiveness
- Search result validation and pagination

## Helper Files

### `helpers/common-helpers.js`

Contains shared utility functions:
- `setupPage(page)`: Handles cookie banners and survey modals
- `handleCookieBanner(page)`: Accepts cookies automatically
- `handleSurveyModal(page)`: Dismisses survey modals
- `waitForSearchResults(page)`: Waits for search results to load

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Specific Test Suites
```bash
# Run maternity clinic search tests only
npm run test:maternity

# Run health station search tests only
npm run test:health-station

# Run both search test suites
npm run test:searches
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests in Headed Mode (with browser visible)
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

## Test Features

### Automated Modal Handling
The tests automatically handle common site elements:
- **Cookie Banner**: Accepts all cookies with "Hyväksy kaikki evästeet"
- **Survey Modal**: Dismisses with "En osallistu kyselyyn"

### Accessibility Testing
Tests include accessibility checks for:
- Keyboard navigation
- Screen reader compatibility
- ARIA labels and roles
- Skip links and navigation landmarks

### Mobile Responsiveness
Tests verify functionality on mobile viewports (375px width)

### Error Handling
Tests gracefully handle:
- Missing elements
- Network delays
- Invalid search inputs
- Pagination variations

## Test Data

The tests use realistic Helsinki addresses and postal codes:
- `Keskuskatu 1`
- `Mannerheimintie 1, Helsinki`
- `00100`, `00150`, `00200` (postal codes)
- Known clinic/health station names

## Browser Configuration

Tests run on:
- **Primary**: Chromium (Desktop Chrome)
- **Base URL**: `https://www.hel.fi`
- **Retries**: 2 on CI, 0 locally
- **Timeout**: Standard Playwright timeouts with custom waits for search results

## Test Plan References

These tests are based on detailed test plans located in:
- `e2e/generated_plan/plans/maternity_and_child_health_clinic_search.test_plan.md`
- `e2e/generated_plan/plans/health_station_search.test_plan.md`

And use locators from:
- `e2e/generated_plan/locators/maternity_and_child_health_clinic_search.locators.md`
- `e2e/generated_plan/locators/health_station_search.locators.md`

## Notes

- Tests skip performance-related validations as per requirements
- Only tests for one browser (Chromium) to optimize execution time
- Tests are designed to handle variations in search results and UI states
- Swedish language service filtering may not always show results depending on available services 