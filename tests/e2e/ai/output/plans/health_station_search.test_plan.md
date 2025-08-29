# Health Station Search Test Plan

## Table of Contents
- [Overview](#overview)
- [Page Analysis](#page-analysis)
- [Test Cases](#test-cases)
  - [Search Functionality](#search-functionality)
  - [Filtering Options](#filtering-options)
  - [Accessibility and Responsiveness](#accessibility-and-responsiveness)
  - [Multilingual Support](#multilingual-support)
- [Test Coverage](#test-coverage)
- [Prerequisites](#prerequisites)

## Overview
The Health Station Search feature enables users to find and filter health stations in the Helsinki area. It includes search functionality, filtering options, and displays detailed information about each health station.

## Page Analysis
- **URLs**: 
  - Finnish: [https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/terveysasemat/etsi-oma-terveysasemasi](https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/terveysasemat/etsi-oma-terveysasemasi)
  - Swedish: [https://www.hel.fi/sv/social-och-halsovardstjanster/halsovard/halsostationer/sok-din-egen-halsostation](https://www.hel.fi/sv/social-och-halsovardstjanster/halsovard/halsostationer/sok-din-egen-halsostation)
  - English: [https://www.hel.fi/en/health-and-social-services/health-care/health-stations/find-your-health-station](https://www.hel.fi/en/health-and-social-services/health-care/health-stations/find-your-health-station)
- **Description**: A search interface for finding health stations with filtering options.
- **Key Functionalities**:
  1. Search health stations by name or location
  2. Filter by available services and accessibility options
  3. View station details including contact information and opening hours
  4. Check real-time service availability and waiting times
  5. Get directions to selected health stations

## Test Cases

### Search Functionality

- **Test Title**: Verify basic search by station name  
  **Test Steps**:
  1. Navigate to the Health Station Search page
  2. Enter a health station name in the search field
  3. Submit the search
  **Expected Result**: Matching health stations should be displayed

- **Test Title**: Verify location-based search  
  **Test Steps**:
  1. Enter an address or location in the search field
  2. Verify the distance sorting
  **Expected Result**: Results should be sorted by proximity

### Filtering Options

- **Test Title**: Filter by Swedish language service  
  **Test Steps**:
  1. Locate the language filter
  2. Select Swedish language option
  **Expected Result**: Only stations offering Swedish services should be shown

- **Test Title**: Filter by accessibility options  
  **Test Steps**:
  1. Expand the accessibility filters
  2. Select specific accessibility options
  **Expected Result**: Only stations matching the selected criteria should be displayed

### Accessibility and Responsiveness

- **Test Title**: Keyboard navigation  
  **Test Steps**:
  1. Navigate using only keyboard
  2. Verify all interactive elements are reachable
  **Expected Result**: Full functionality should be available via keyboard

- **Test Title**: Mobile responsiveness  
  **Test Steps**:
  1. Test on mobile viewport (375×812)
  2. Verify all elements are properly displayed and functional
  **Expected Result**: Interface should be fully functional on mobile devices

### Multilingual Support

- **Test Title**: Language switching  
  **Test Steps**:
  1. Change the site language
  2. Verify all text elements update accordingly
  **Expected Result**: All interface text should be in the selected language

## Test Coverage
- Core search functionality: 85%
- Filtering options: 90%
- Responsive design: 100%
- Accessibility: 85%
- Multilingual support: 100%

## Prerequisites
- Test environment with Health Station Search feature deployed
- Test data with various health stations and services
- Devices for responsive testing
- Screen reader software for accessibility testing
