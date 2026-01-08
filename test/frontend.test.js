// test/frontend.test.js
/**
 * TestSprite Frontend Tests
 * Tests UI functionality and client-side logic
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Frontend UI', () => {
  let dom;
  let document;
  let window;

  before(() => {
    // Load the HTML file
    const html = fs.readFileSync(
      path.join(__dirname, '../public/index.html'),
      'utf8'
    );
    
    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost:3000'
    });
    
    document = dom.window.document;
    window = dom.window;
  });

  describe('HTML Structure', () => {
    
    it('should have required form elements', () => {
      assert.ok(document.getElementById('url-input'));
      assert.ok(document.getElementById('scan-btn'));
    });

    it('should have result sections', () => {
      assert.ok(document.getElementById('loading-section'));
      assert.ok(document.getElementById('results-section'));
      assert.ok(document.getElementById('error-section'));
    });

    it('should have summary elements', () => {
      assert.ok(document.getElementById('total-tests'));
      assert.ok(document.getElementById('total-passes'));
      assert.ok(document.getElementById('total-issues'));
    });

    it('should have category tabs', () => {
      const tabs = document.querySelectorAll('.tab');
      assert.ok(tabs.length >= 6); // all, colorContrast, images, keyboard, semanticHTML, other
    });
  });

  describe('Accessibility Features', () => {
    
    it('should have proper ARIA labels', () => {
      const urlInput = document.getElementById('url-input');
      assert.ok(urlInput.getAttribute('aria-label'));
    });

    it('should have proper lang attribute', () => {
      assert.strictEqual(document.documentElement.lang, 'en');
    });

    it('should have meta viewport for responsive design', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      assert.ok(viewport);
    });

    it('should have descriptive title', () => {
      assert.ok(document.title);
      assert.ok(document.title.length > 0);
    });
  });

  describe('Button Types', () => {
    
    it('should have explicit button types to prevent form submission', () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        // Each button should have type attribute
        assert.ok(button.hasAttribute('type'));
      });
    });

    it('should have scan button with correct type', () => {
      const scanBtn = document.getElementById('scan-btn');
      assert.strictEqual(scanBtn.getAttribute('type'), 'button');
    });
  });
});