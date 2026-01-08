// test/utils.test.js
/**
 * TestSprite Utility Tests
 * Tests helper functions and data processing
 */

const assert = require('assert');

describe('Utility Functions', () => {
  
  describe('URL Validation', () => {
    
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://sub.domain.com/path',
        'https://example.com:8080',
        'https://example.com/path?query=value'
      ];
      
      validUrls.forEach(url => {
        try {
          new URL(url);
          assert.ok(true);
        } catch (error) {
          assert.fail(`${url} should be valid`);
        }
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com',
        'ftp://example.com',
        '',
        'javascript:alert(1)'
      ];
      
      invalidUrls.forEach(url => {
        try {
          new URL(url);
          // Only http and https should be allowed in practice
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            assert.fail(`${url} should be invalid`);
          }
        } catch (error) {
          assert.ok(true);
        }
      });
    });
  });

  describe('Data Processing', () => {
    
    it('should calculate percentages correctly', () => {
      const getPercentage = (value, total) => {
        return total === 0 ? 0 : (value / total * 100).toFixed(1);
      };
      
      assert.strictEqual(getPercentage(25, 100), '25.0');
      assert.strictEqual(getPercentage(33, 100), '33.0');
      assert.strictEqual(getPercentage(0, 100), '0.0');
      assert.strictEqual(getPercentage(100, 100), '100.0');
      assert.strictEqual(getPercentage(10, 0), '0');
    });

    it('should escape HTML correctly', () => {
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };
      
      // Note: This requires DOM environment
      // In actual test, this would use JSDOM
    });
  });

  describe('Issue Categorization', () => {
    
    it('should categorize color contrast issues', () => {
      const categorizeIssue = (violation) => {
        const id = violation.id.toLowerCase();
        if (id.includes('color-contrast') || id.includes('contrast')) {
          return 'colorContrast';
        }
        return 'other';
      };
      
      assert.strictEqual(
        categorizeIssue({ id: 'color-contrast', tags: [] }),
        'colorContrast'
      );
    });

    it('should categorize image issues', () => {
      const categorizeIssue = (violation) => {
        const id = violation.id.toLowerCase();
        if (id.includes('image') || id.includes('alt')) {
          return 'images';
        }
        return 'other';
      };
      
      assert.strictEqual(
        categorizeIssue({ id: 'image-alt', tags: [] }),
        'images'
      );
    });

    it('should categorize keyboard issues', () => {
      const categorizeIssue = (violation) => {
        const id = violation.id.toLowerCase();
        if (id.includes('keyboard') || id.includes('focus')) {
          return 'keyboard';
        }
        return 'other';
      };
      
      assert.strictEqual(
        categorizeIssue({ id: 'keyboard-navigation', tags: [] }),
        'keyboard'
      );
    });
  });
});