// test/integration.test.js
/**
 * TestSprite Integration Tests
 * End-to-end testing of the complete WCAG scanner workflow
 */

const assert = require('assert');
const http = require('http');

describe('Integration Tests', () => {
  const BASE_URL = 'http://localhost:3000';

  describe('Complete Scan Workflow', () => {
    
    it('should complete full scan workflow from API to results', async function() {
      this.timeout(40000);
      
      // Step 1: Request scan
      const scanResult = await new Promise((resolve, reject) => {
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
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(body));
            } else {
              reject(new Error(`Status: ${res.statusCode}`));
            }
          });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
      });

      // Step 2: Verify all required data is present
      assert.ok(scanResult.url);
      assert.ok(scanResult.timestamp);
      assert.ok(scanResult.summary);
      assert.ok(scanResult.violations);
      assert.ok(scanResult.categories);
      assert.ok(scanResult.passes);
      
      // Step 3: Verify data completeness
      assert.ok(scanResult.summary.totalTests >= 0);
      assert.strictEqual(
        scanResult.summary.totalTests,
        scanResult.summary.totalIssues + scanResult.summary.totalPasses
      );
      
      // Step 4: Verify all severity levels are present
      const severities = ['critical', 'serious', 'moderate', 'minor'];
      severities.forEach(severity => {
        assert.ok(Array.isArray(scanResult.violations[severity]));
      });
      
      // Step 5: Verify all categories are present
      const categories = ['colorContrast', 'images', 'keyboard', 'semanticHTML', 'other'];
      categories.forEach(category => {
        assert.ok(Array.isArray(scanResult.categories[category]));
      });
    });

    it('should handle multiple concurrent scan requests', async function() {
      this.timeout(60000);
      
      const urls = [
        'https://example.com',
        'https://www.w3.org',
        'https://github.com'
      ];
      
      const scanPromises = urls.map(url => {
        return new Promise((resolve, reject) => {
          const data = JSON.stringify({ url });
          
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
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
              if (res.statusCode === 200) {
                resolve(JSON.parse(body));
              } else {
                reject(new Error(`Status: ${res.statusCode} for ${url}`));
              }
            });
          });

          req.on('error', reject);
          req.write(data);
          req.end();
        });
      });
      
      const results = await Promise.all(scanPromises);
      
      // Verify all scans completed
      assert.strictEqual(results.length, urls.length);
      
      // Verify each result is valid
      results.forEach((result, index) => {
        assert.strictEqual(result.url, urls[index]);
        assert.ok(result.summary);
        assert.ok(typeof result.summary.totalTests === 'number');
      });
    });
  });

  describe('Error Handling', () => {
    
    it('should handle malformed JSON gracefully', (done) => {
      const data = 'not valid json';
      
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
        assert.ok(res.statusCode >= 400);
        done();
      });

      req.on('error', done);
      req.write(data);
      req.end();
    });

    it('should handle unreachable URLs', async function() {
      this.timeout(35000);
      
      const unreachablePromise = new Promise((resolve, reject) => {
        const data = JSON.stringify({ url: 'https://thisisnotarealdomainthatexists123456.com' });
        
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
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
      });

      const result = await unreachablePromise;
      assert.strictEqual(result.status, 500);
      assert.ok(result.body.error);
    });
  });
});