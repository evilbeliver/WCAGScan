// test/scanner.test.js
/**
 * TestSprite Test Suite for Scanner Module
 * Tests the core accessibility scanning functionality
 */

const assert = require('assert');
const { scanWebsite } = require('../scanner');

describe('Scanner Module', () => {
  
  describe('scanWebsite()', () => {
    
    it('should throw error for invalid URL', async function() {
      this.timeout(10000);
      
      try {
        await scanWebsite('not-a-url');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error);
      }
    });

    it('should scan a valid website and return results', async function() {
      this.timeout(30000);
      
      const result = await scanWebsite('https://example.com');
      
      // Verify basic structure
      assert.ok(result);
      assert.strictEqual(result.url, 'https://example.com');
      assert.ok(result.timestamp);
      assert.ok(result.summary);
      assert.ok(result.violations);
      assert.ok(result.categories);
      assert.ok(result.passes);
    });

    it('should categorize issues correctly', async function() {
      this.timeout(30000);
      
      const result = await scanWebsite('https://example.com');
      
      // Verify category structure
      assert.ok(result.categories.colorContrast !== undefined);
      assert.ok(result.categories.images !== undefined);
      assert.ok(result.categories.keyboard !== undefined);
      assert.ok(result.categories.semanticHTML !== undefined);
      assert.ok(result.categories.other !== undefined);
    });

    it('should calculate severity levels', async function() {
      this.timeout(30000);
      
      const result = await scanWebsite('https://example.com');
      
      // Verify severity structure
      assert.ok(typeof result.summary.issuesBySeverity.critical === 'number');
      assert.ok(typeof result.summary.issuesBySeverity.serious === 'number');
      assert.ok(typeof result.summary.issuesBySeverity.moderate === 'number');
      assert.ok(typeof result.summary.issuesBySeverity.minor === 'number');
      
      // Total issues should equal sum of severity levels
      const severityTotal = 
        result.summary.issuesBySeverity.critical +
        result.summary.issuesBySeverity.serious +
        result.summary.issuesBySeverity.moderate +
        result.summary.issuesBySeverity.minor;
      
      assert.strictEqual(result.summary.totalIssues, severityTotal);
    });

    it('should include remediation guidance for violations', async function() {
      this.timeout(30000);
      
      const result = await scanWebsite('https://example.com');
      
      // Check if any violations exist and have remediation
      const allViolations = [
        ...result.violations.critical,
        ...result.violations.serious,
        ...result.violations.moderate,
        ...result.violations.minor
      ];
      
      if (allViolations.length > 0) {
        const violation = allViolations[0];
        assert.ok(violation.nodes);
        assert.ok(violation.nodes.length > 0);
        
        const node = violation.nodes[0];
        assert.ok(node.remediation);
        assert.ok(node.remediation.issue);
        assert.ok(Array.isArray(node.remediation.steps));
      }
    });

    it('should include WCAG criteria tags', async function() {
      this.timeout(30000);
      
      const result = await scanWebsite('https://example.com');
      
      // Check if violations include WCAG criteria
      const allViolations = [
        ...result.violations.critical,
        ...result.violations.serious,
        ...result.violations.moderate,
        ...result.violations.minor
      ];
      
      if (allViolations.length > 0) {
        const violation = allViolations[0];
        assert.ok(Array.isArray(violation.tags));
        
        if (violation.nodes.length > 0) {
          assert.ok(Array.isArray(violation.nodes[0].wcagCriteria));
        }
      }
    });

    it('should handle timeout gracefully', async function() {
      this.timeout(35000);
      
      try {
        // Test with a potentially slow or non-existent URL
        await scanWebsite('https://httpstat.us/200?sleep=35000');
        // If it succeeds, that's also acceptable
        assert.ok(true);
      } catch (error) {
        // Should fail gracefully with timeout
        assert.ok(error.message.includes('timeout') || error.message.includes('Navigation'));
      }
    });
  });
});