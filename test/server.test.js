// test/server.test.js
/**
 * TestSprite Test Suite for WCAG Scanner Server
 * Tests the Express server and API endpoints
 */

const assert = require('assert');
const http = require('http');

describe('WCAG Scanner Server', () => {
  const BASE_URL = 'http://localhost:3000';
  let server;

  before(() => {
    // Server should be started before tests
    console.log('Ensure server is running on port 3000');
  });

  describe('GET /', () => {
    it('should serve the index.html page', (done) => {
      http.get(BASE_URL, (res) => {
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers['content-type'], 'text/html; charset=UTF-8');
        done();
      }).on('error', done);
    });
  });

  describe('POST /api/scan', () => {
    it('should return 400 when URL is missing', (done) => {
      const data = JSON.stringify({});
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/scan',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        assert.strictEqual(res.statusCode, 400);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          const response = JSON.parse(body);
          assert.strictEqual(response.error, 'URL is required');
          done();
        });
      });

      req.on('error', done);
      req.write(data);
      req.end();
    });

    it('should return 400 when URL format is invalid', (done) => {
      const data = JSON.stringify({ url: 'not-a-valid-url' });
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/scan',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        assert.strictEqual(res.statusCode, 400);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          const response = JSON.parse(body);
          assert.strictEqual(response.error, 'Invalid URL format');
          done();
        });
      });

      req.on('error', done);
      req.write(data);
      req.end();
    });

    it('should successfully scan a valid URL', function(done) {
      this.timeout(30000); // Extended timeout for scanning
      
      const data = JSON.stringify({ url: 'https://example.com' });
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/scan',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        assert.strictEqual(res.statusCode, 200);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          const response = JSON.parse(body);
          
          // Verify response structure
          assert.ok(response.url);
          assert.ok(response.timestamp);
          assert.ok(response.summary);
          assert.ok(response.violations);
          assert.ok(response.categories);
          assert.ok(response.passes);
          
          // Verify summary structure
          assert.ok(typeof response.summary.totalIssues === 'number');
          assert.ok(typeof response.summary.totalPasses === 'number');
          assert.ok(typeof response.summary.totalTests === 'number');
          
          done();
        });
      });

      req.on('error', done);
      req.write(data);
      req.end();
    });
  });

  describe('Static Files', () => {
    it('should serve styles.css', (done) => {
      http.get(`${BASE_URL}/styles.css`, (res) => {
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.headers['content-type'].includes('css'));
        done();
      }).on('error', done);
    });
  });
});