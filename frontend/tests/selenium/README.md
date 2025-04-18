# Selenium Tests for Contest Tracker

This directory contains pure Selenium WebDriver tests for the Contest Tracker application. These are standalone Node.js scripts that open a Chrome browser and perform automated tests.

## Test Files

- `basic-test.js`: Basic tests for page loading, navigation, and theme toggle
- `navigation-test.js`: Tests for navigating between pages and filtering contests
- `contests-test.js`: Tests for contest display, bookmarking, and external links
- `submit-solution-test.js`: Tests for the Submit Solution form

## Requirements

- Node.js
- Chrome browser must be installed
- ChromeDriver is included as a dependency in package.json

## Running the Tests

Before running the tests, make sure your development server is running:

```bash
# Start the development server
npm run dev
```

Then, in a separate terminal, run the tests:

```bash
# Run a specific test
npm run selenium:basic
npm run selenium:navigation
npm run selenium:contests
npm run selenium:submit

# Run all tests
npm run selenium:all
```

## Test Output

The tests print detailed information to the console, including:
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warning/informational messages

Each test automatically opens Chrome, performs its tests, and then closes the browser when done.

## Troubleshooting

If you encounter issues:

1. Make sure Chrome is installed and up to date
2. Check that the development server is running on port 5173
3. The scripts look for specific UI elements - if the UI has changed, the tests may need updating
4. Some tests depend on data being available (e.g., contests in the API) - if no data is available, some checks may be skipped

## Modifying Tests

To modify these tests:

1. Each file is a standalone Node.js script using the Selenium WebDriver API
2. All tests use standard Selenium methods like `findElement`, `click`, etc.
3. Tests include try/catch blocks to handle potential errors gracefully
4. CSS selectors and XPath expressions are used to find elements in the DOM 