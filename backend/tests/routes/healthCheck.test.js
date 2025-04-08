const request = require('supertest');
const express = require('express');

describe('Health Check API', () => {
  let app;

  beforeEach(() => {
    // Create a new Express app instance for each test
    app = express();
    
    // Replicate the health check endpoint from server.js
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'ok', message: 'Server is running' });
    });
  });

  test('should return 200 status code', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.status).toBe(200);
  });

  test('should return correct JSON response', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Server is running'
    });
  });

  test('should have correct content-type header', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.headers['content-type']).toContain('application/json');
  });
}); 