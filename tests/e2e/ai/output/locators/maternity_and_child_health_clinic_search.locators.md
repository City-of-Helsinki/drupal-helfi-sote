# Maternity and Child Health Clinic Search Locators

## Language Selector
```javascript
// Language selector buttons
const languageButtons = {
  fi: page.getByRole('link', { name: /suomi/i }),
  sv: page.getByRole('link', { name: /svenska/i }),
  en: page.getByRole('link', { name: /english/i })
};
```

## Search Component
```javascript
// Main search input and button
const searchComponent = {
  // Search input with language variations
  searchInput: page.getByRole('searchbox', { 
    name: /(etsi neuvoloita|sök mottagningar|find clinics)/i 
  }),
  
  // Search submit button with language variations
  searchButton: page.getByRole('button', { 
    name: /(etsi|sök|search)/i 
  })
};
```

## Filters
```javascript
// Service type filter section
const serviceFilter = {
  // Container for service filter options
  container: page.getByRole('region', { 
    name: /(palvelut|tjänster|services)/i 
  }),
  
  // Example service options (add more as needed)
  maternityClinic: page.getByRole('checkbox', { 
    name: /(äitiysneuvola|mödravårdscentral|maternity clinic)/i 
  }),
  
  childHealthClinic: page.getByRole('checkbox', { 
    name: /(lastenneuvola|barnavårdscentral|child health clinic)/i 
  })
};

// Language filter section
const languageFilter = {
  // Container for language filter options
  container: page.getByRole('region', { 
    name: /(kielipalvelut|språktjänster|language services)/i 
  }),
  
  // Swedish language option
  swedishOption: page.getByRole('checkbox', { 
    name: /ruotsi|svenska|swedish/i 
  })
};
```

## Search Results
```javascript
// Search results container and items
const searchResults = {
  // Container for all results
  container: page.getByRole('region', { 
    name: /(hakutulokset|sökresultat|search results)/i 
  }),
  
  // Individual result items
  items: page.getByRole('article'),
  
  // First result item (for specific interactions)
  firstItem: {
    container: page.getByRole('article').first(),
    name: page.getByRole('article').first().getByRole('heading', { level: 2 }),
    address: page.getByRole('article').first().getByText(/(osoite|adress|address)/i).locator('+ div'),
    distance: page.getByRole('article').first().getByText(/(pääset|avstånd|distance)/i)
  }
};

// No results message
const noResults = page.getByText(
  /(ei hakutuloksia|inga sökresultat|no search results)/i
);
```

## View Toggles
```javascript
// Toggle between list and map view
const viewToggles = {
  listView: page.getByRole('tab', { 
    name: /(näytä listana|visa som lista|show as list)/i 
  }),
  
  mapView: page.getByRole('tab', { 
    name: /(näytä kartalla|visa på karta|show on map)/i 
  })
};

// Map container (when in map view)
const map = {
  container: page.locator('.map-container'),
  markers: page.locator('.map-marker'),
  
  // Map marker for first result (example)
  firstMarker: page.locator('.map-marker').first(),
  
  // Info window that appears when clicking a marker
  infoWindow: page.locator('.map-info-window'),
  
  // Close button for info window
  closeInfoWindow: page.locator('.map-info-window-close')
};
```

## Clinic Details
```javascript
// Modal or expanded view for clinic details
const clinicDetails = {
  // Modal container (if using a modal)
  modal: page.getByRole('dialog'),
  
  // Close button (if using a modal)
  closeButton: page.getByRole('button', { 
    name: /(sulje|stäng|close)/i 
  }),
  
  // Clinic name in details
  name: page.getByRole('heading', { level: 1 }),
  
  // Clinic type
  type: page.getByText(/(tyyppi|typ|type)/i).locator('+ div'),
  
  // Contact information
  contact: {
    address: page.getByText(/(osoite|adress|address)/i).locator('+ div'),
    phone: page.getByText(/(puhelin|telefon|phone)/i).locator('+ a'),
    email: page.getByText(/(sähköposti|e-post|email)/i).locator('+ a')
  },
  
  // Opening hours
  openingHours: {
    regular: page.getByText(/(aukioloajat|öppettider|opening hours)/i).locator('+ div'),
    exceptional: page.getByText(/(poikkeus|undantag|exceptional)/i).locator('+ div')
  },
  
  // Services provided
  services: page.getByText(/(tarjoamme|vi erbjuder|we offer)/i).locator('+ ul'),
  
  // Languages spoken
  languages: page.getByText(/(kielet|språk|languages)/i).locator('+ div'),
  
  // Get directions button
  directionsButton: page.getByRole('link', { 
    name: /(reittiohjeet|färdbeskrivning|get directions)/i 
  })
};
```

## Loading States
```javascript
// Loading indicator (if present)
const loadingIndicator = page.getByRole('status', { 
  name: /(ladataan|laddar|loading)/i 
});
```

## Error Messages
```javascript
// Error message container
const errorMessage = page.getByRole('alert').filter({ 
  hasText: /(virhe|error|något gick fel)/i 
});
```

## Utility Functions
```javascript
// Helper function to wait for search results to load
async function waitForSearchResults() {
  await Promise.race([
    searchResults.container.first().waitFor({ state: 'visible' }),
    noResults.waitFor({ state: 'visible' }),
    map.container.waitFor({ state: 'visible' })
  ]);
}

// Helper function to search for a term
async function searchFor(term) {
  await searchComponent.searchInput.fill(term);
  await searchComponent.searchButton.click();
  await waitForSearchResults();
}

// Helper function to switch to map view
async function switchToMapView() {
  await viewToggles.mapView.click();
  await map.container.waitFor({ state: 'visible' });
}

// Helper function to open first clinic details
async function openFirstClinicDetails() {
  if (await viewToggles.mapView.isVisible()) {
    // In map view, click the first marker
    await map.firstMarker.click();
    await clinicDetails.modal.waitFor({ state: 'visible' });
  } else {
    // In list view, click the first result
    await searchResults.firstItem.container.click();
    await clinicDetails.modal.waitFor({ state: 'visible' });
  }
}
```
