# Maternity and Child Health Clinic Search Test Plan

## Table of Contents
- [Overview](#overview)
- [Page Analysis](#page-analysis)
- [Test Cases](#test-cases)
  - [Search Functionality](#search-functionality)
  - [Filtering](#filtering)
  - [Map View](#map-view)
  - [Responsive Design](#responsive-design)
  - [Accessibility](#accessibility)
- [Test Coverage](#test-coverage)
- [Prerequisites](#prerequisites)

## Overview
The Maternity and Child Health Clinic Search feature allows users to find and filter maternity and child health clinics in the Helsinki area. The feature provides search functionality, filtering options, and an interactive map view to help users locate clinics based on various criteria.

## Page Analysis
- **URLs**: 
  - Finnish: [https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat](https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat)
  - Swedish: [https://www.hel.fi/sv/social-och-halsovardstjanster/tjanster-for-barn-och-familjer/modra-och-barnradgivningarna](https://www.hel.fi/sv/social-och-halsovardstjanster/tjanster-for-barn-och-familjer/modra-och-barnradgivningarna)
  - English: [https://www.hel.fi/en/health-and-social-services/child-and-family-services/maternity-and-child-health-clinics](https://www.hel.fi/en/health-and-social-services/child-and-family-services/maternity-and-child-health-clinics)
- **Description**: A search interface for finding maternity and child health clinics with filtering options and map integration.
- **Key Functionalities**:
  1. Search clinics by name or location
  2. Filter by services and languages
  3. View clinics on an interactive map
  4. View detailed clinic information
  5. Filter by Swedish language service availability

## Test Cases

### Search Functionality

- **Test Title**: Verify basic search functionality  
  **Description**: Ensure users can search for clinics by name  
  **Test Steps**:
  1. Navigate to the Maternity and Child Health Clinic Search page
  2. Enter a clinic name in the search field
  3. Click the search button or press Enter
  **Expected Result**: The results should display clinics matching the search term

- **Test Title**: Verify location-based search  
  **Description**: Ensure users can search for clinics near a specific address  
  **Test Steps**:
  1. Navigate to the search page
  2. Enter an address or location in the search field
  3. Verify the search results show clinics near the specified location
  **Expected Result**: Clinics should be displayed in order of proximity to the searched location

### Filtering

- **Test Title**: Filter by Swedish language service  
  **Description**: Verify users can filter clinics that offer services in Swedish  
  **Test Steps**:
  1. Navigate to the search page
  2. Locate the language filter
  3. Check the option for Swedish language service
  **Expected Result**: Only clinics offering services in Swedish should be displayed

- **Test Title**: Filter by available services  
  **Description**: Verify filtering by specific services works correctly  
  **Test Steps**:
  1. Navigate to the search page
  2. Expand the services filter
  3. Select one or more services
  **Expected Result**: Only clinics offering the selected services should be displayed

### Map View

- **Test Title**: Verify interactive map functionality  
  **Description**: Ensure the interactive map displays clinic locations correctly  
  **Test Steps**:
  1. Perform a search that returns results
  2. Switch to map view
  3. Verify that markers appear on the map for each clinic
  **Expected Result**: Clinic locations should be accurately marked on the map

- **Test Title**: Verify map marker interaction  
  **Description**: Ensure clicking a map marker shows clinic information  
  **Test Steps**:
  1. In map view, click on a clinic marker
  **Expected Result**: An information window should appear with clinic details

### Responsive Design

- **Test Title**: Mobile viewport rendering  
  **Description**: Verify the search interface works on mobile devices  
  **Test Steps**:
  1. Open the search page on a mobile viewport (375×812)
  2. Test search and filtering functionality
  **Expected Result**: All functionality should work correctly on mobile devices

- **Test Title**: Tablet viewport rendering  
  **Description**: Verify the search interface works on tablets  
  **Test Steps**:
  1. Open the search page on a tablet viewport (768×1024)
  2. Test search and filtering functionality
  **Expected Result**: All functionality should work correctly on tablets

### Accessibility

- **Test Title**: Keyboard navigation  
  **Description**: Verify all interactive elements are keyboard accessible  
  **Test Steps**:
  1. Navigate through the page using only the keyboard
  2. Verify all interactive elements are reachable and usable
  **Expected Result**: All functionality should be accessible via keyboard

- **Test Title**: Screen reader compatibility  
  **Description**: Verify the page is properly announced by screen readers  
  **Test Steps**:
  1. Use a screen reader to navigate the page
  2. Verify all content is properly announced
  **Expected Result**: All content should be properly announced and navigable

## Test Coverage
This test plan covers the following aspects of the Maternity and Child Health Clinic Search feature:
- Core search functionality (80%)
- Filtering options (90%)
- Map integration (70%)
- Responsive design (100%)
- Accessibility (80%)

## Prerequisites
- Test environment with the Maternity and Child Health Clinic Search feature deployed
- Test data including multiple clinics with various services and language options
- Test devices with different screen sizes (mobile, tablet, desktop)
- Screen reader software for accessibility testing
- Network connectivity for map functionality
