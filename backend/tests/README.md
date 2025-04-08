# Contest Tracker Backend Tests

This directory contains the test suite for the Contest Tracker backend.

## Overview

The test suite covers:
- Unit tests for utilities
- Model tests
- API integration tests
- Postman collection for manual API testing

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Run tests:
   ```
   npm test
   ```

3. Run tests with coverage:
   ```
   npm run test:coverage
   ```

4. Run tests in watch mode (for development):
   ```
   npm run test:watch
   ```

## Test Structure

- `models/`: Tests for database models
- `routes/`: Tests for API endpoints
- `utils/`: Tests for utility functions
- `setup.js`: Global setup for tests (database connection)
- `Contest-Tracker-API.postman_collection.json`: Postman collection for API testing
- `Contest-Tracker-Environment.postman_environment.json`: Postman environment variables

## Using the Postman Collection

1. Import both the collection and environment files into Postman
2. Ensure the backend server is running
3. Set the `baseUrl` variable in the environment if your server runs on a different port/URL
4. Run the collection to test all endpoints

## Adding New Tests

When adding new features to the backend, please follow these guidelines for test coverage:

1. **Unit Tests**: Add tests for utility functions and models to ensure they work correctly in isolation
2. **Integration Tests**: Add tests for API endpoints to ensure they handle requests and responses correctly
3. **Edge Cases**: Include tests for error handling and edge cases

## Coverage Goals

- Aim for at least 80% code coverage for all files
- Critical path functionality should have closer to 100% coverage
- Error handling should be thoroughly tested

## Sample Test

```javascript
describe('Sample Test', () => {
  test('should demonstrate how tests work', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Mocking Dependencies

Most tests use Jest's mocking capabilities to isolate the code being tested:

```javascript
jest.mock('axios');
```

See existing tests for examples of mocking databases, APIs, and other dependencies. 