# Health Station Search Locators

## Language Selector
```javascript
// Language selector buttons
const languageButtons = {
  fi: page.getByRole('link', { name: 'Suomi' }),
  sv: page.getByRole('link', { name: 'Svenska' }),
  en: page.getByRole('link', { name: 'English' })
};

// Language selector button (mobile/desktop toggle)
const languageMenuButton = page.getByRole('button', { 
  name: /(Avaa tietoa muilla kielillä valikko|Öppna Information på andra språk meny|Open Information in other languages menu)/ 
});
```

## Search Form
```javascript
// Main search form elements
const searchForm = {
  // Main heading
  heading: page.getByRole('heading', { 
    name: /(Etsi oma terveysasemasi|Sök din egen hälsostation|Find your health station)/i,
    level: 1
  }),
  
  // Search input field
  addressInput: page.getByRole('combobox', { 
    name: /(Kotiosoite|Hemadress|Home address)/ 
  }),
  
  // Search button
  searchButton: page.getByRole('button', { 
    name: /(Etsi|Sök|Search)/ 
  }),
  
  // Swedish language service checkbox
  swedishServiceCheckbox: page.getByRole('checkbox', { 
    name: /(Näytä lähin toimipiste, josta saa palvelua ruotsiksi|Visa det närmaste verksamhetsställe där man får betjäning på svenska|Show the nearest service location where service is available in Swedish)/ 
  }),
  
  // Helper text
  helperText: page.getByText(/(Kirjoita kadunnimi ja talonumero|Ange gatunamnet och husnumret|Enter the street name and house number)/)
};

// Warning/Info messages
const messages = {
  // Note about not being able to search by district name
  districtSearchNote: page.getByText(/(Huom! Et voi etsiä terveysasemaa kaupunginosan nimellä|Obs! Du kan inte söka efter en hälsostation med stadsdelsnamn|Note! You cannot search for a health station using the name of a district)/),
  
  // Loading indicator
  loadingIndicator: page.getByText(/(Hakutuloksia ladataan|Sökresultat laddas|Search results are loading)/)
};

// Navigation links
const navigation = {
  // Link to health stations page
  healthStationsLink: page.getByRole('link', { 
    name: /(Siirry sivulle Terveysasemat|Gå till sidan Hälsostationer|Go to the Health Stations page)/ 
  }),
  
  // Breadcrumb navigation items
  breadcrumbs: {
    home: page.getByRole('link', { name: /(Etusivu|Huvudsida|Front page)/ }),
    healthServices: page.getByRole('link', { name: /(Sosiaali- ja terveyspalvelut|Social- och hälsovårdstjänster|Health and social services)/ }),
    healthCare: page.getByRole('link', { name: /(Terveydenhoito|Hälsovård|Health care)/ }),
    healthStations: page.getByRole('link', { name: /(Terveysasemat|Hälsostationer|Health stations)/ })
  }
};
```

## Search Results
```javascript
// Search results section
const searchResults = {
  // Container for all results
  container: page.getByRole('region').filter({ 
    has: page.getByRole('heading', { 
      name: /(Hakutulokset|Sökresultat|Search results)/i,
      level: 2 
    })
  }),
  
  // Individual result items
  items: page.getByRole('article'),
  
  // First result item (for specific interactions)
  firstItem: {
    container: page.getByRole('article').first(),
    name: page.getByRole('article').first().getByRole('heading', { level: 3 }),
    address: page.getByRole('article').first().getByText(/Osoite|Adress|Address/).locator('+ div'),
    phone: page.getByRole('article').first().getByText(/Puhelin|Telefon|Phone/).locator('+ div'),
    email: page.getByRole('article').first().getByText(/Sähköposti|E-post|Email/).locator('+ a')
  },
  
  // No results message
  noResults: page.getByText(/(Ei hakutuloksia|Inga sökresultat|No search results)/i)
};
```

## Common Elements
```javascript
// Header and navigation
const header = {
  // Main logo
  logo: page.getByRole('link', { 
    name: /(Helsinki-kehystunnus Helsingin kaupunki|Helsingfors logo Helsingfors stad|Helsinki logo City of Helsinki)/ 
  }),
  
  // Main menu toggle (mobile)
  menuToggle: page.getByRole('button', { 
    name: /(Valikko|Meny|Menu)/ 
  }),
  
  // Search toggle
  searchToggle: page.getByRole('button', { 
    name: /(Haku|Sök|Search)/ 
  })
};

// Footer
const footer = {
  // Footer navigation links
  links: {
    contact: page.getByRole('link', { 
      name: /(Ota yhteyttä|Kontakta oss|Contact us)/ 
    }),
    accessibility: page.getByRole('link', { 
      name: /(Saavutettavuusseloste|Tillgänglighetsutlåtande|Accessibility statement)/ 
    }),
    feedback: page.getByRole('link', { 
      name: /(Anna palautetta|Ge respons|Give feedback)/ 
    })
  },
  
  // Back to top button
  backToTop: page.getByRole('link', { 
    name: /(Takaisin ylös|Tillbaka till toppen|Back to top)/ 
  })
};
```

## Station Details
```javascript
// Modal or expanded view for station details
const stationDetails = {
  // Modal container (if using a modal)
  modal: page.getByRole('dialog'),
  
  // Close button (if using a modal)
  closeButton: page.getByRole('button', { 
    name: /(sulje|stäng|close)/i 
  }),
  
  // Station name in details
  name: page.getByRole('heading', { level: 1 }),
  
  // Contact information
  contact: {
    address: page.getByText(/(osoite|adress|address)/i).locator('+ div'),
    phone: page.getByText(/(puhelin|telefon|phone)/i).locator('+ a'),
    email: page.getByText(/(sähköposti|e-post|email)/i).locator('+ a')
  },
  
  // Opening hours
  openingHours: page.getByText(
    /(aukioloajat|öppettider|opening hours)/i
  ).locator('+ div'),
  
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
    noResults.waitFor({ state: 'visible' })
  ]);
}

// Helper function to search for a term
async function searchFor(term) {
  await searchComponent.searchInput.fill(term);
  await searchComponent.searchButton.click();
  await waitForSearchResults();
}
```
