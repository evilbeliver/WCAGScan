const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');

/**
 * Scans a website for WCAG 2.1 Level AA compliance using axe-core
 * @param {string} targetUrl - The URL to scan
 * @returns {Promise<Object>} Detailed accessibility report
 */
async function scanWebsite(targetUrl) {
  let browser;
  
  try {
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent testing
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Navigating to ${targetUrl}...`);
    
    // Navigate to the target URL
    await page.goto(targetUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('Page loaded. Injecting axe-core...');

    // Inject axe-core library into the page
    await page.evaluate(axeCore.source);

    console.log('Running accessibility scan...');

    // Run axe-core scan with WCAG 2.1 Level AA standards
    const results = await page.evaluate(async () => {
      return await axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });
    });

    // Process and categorize results
    const report = processResults(results, targetUrl);

    console.log(`Scan complete. Found ${report.summary.totalIssues} issues.`);

    return report;

  } catch (error) {
    console.error('Error during scanning:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Process axe-core results into a structured report
 * @param {Object} results - Raw axe-core results
 * @param {string} url - Scanned URL
 * @returns {Object} Processed report
 */
function processResults(results, url) {
  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];

  // Categorize issues by severity
  const issuesBySeverity = {
    critical: [],
    serious: [],
    moderate: [],
    minor: []
  };

  // Categorize by type
  const issuesByCategory = {
    colorContrast: [],
    images: [],
    keyboard: [],
    semanticHTML: [],
    other: []
  };

  violations.forEach(violation => {
    const severity = violation.impact || 'minor';
    const category = categorizeIssue(violation);

    const processedViolation = {
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      tags: violation.tags,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
        impact: node.impact,
        wcagCriteria: extractWCAGCriteria(violation.tags),
        remediation: getRemediationGuidance(violation.id, node)
      }))
    };

    issuesBySeverity[severity].push(processedViolation);
    issuesByCategory[category].push(processedViolation);
  });

  // Calculate statistics
  const totalIssues = violations.reduce((sum, v) => sum + v.nodes.length, 0);
  const totalPasses = passes.reduce((sum, p) => sum + p.nodes.length, 0);

  return {
    url,
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues,
      totalPasses,
      totalTests: totalIssues + totalPasses,
      violationTypes: violations.length,
      issuesBySeverity: {
        critical: issuesBySeverity.critical.reduce((sum, v) => sum + v.nodes.length, 0),
        serious: issuesBySeverity.serious.reduce((sum, v) => sum + v.nodes.length, 0),
        moderate: issuesBySeverity.moderate.reduce((sum, v) => sum + v.nodes.length, 0),
        minor: issuesBySeverity.minor.reduce((sum, v) => sum + v.nodes.length, 0)
      }
    },
    violations: issuesBySeverity,
    categories: issuesByCategory,
    passes: passes.map(pass => ({
      id: pass.id,
      description: pass.description,
      help: pass.help,
      nodeCount: pass.nodes.length
    })),
    incomplete: incomplete.map(inc => ({
      id: inc.id,
      description: inc.description,
      help: inc.help,
      nodeCount: inc.nodes.length
    }))
  };
}

/**
 * Categorize issue by type
 * @param {Object} violation - Violation object
 * @returns {string} Category name
 */
function categorizeIssue(violation) {
  const id = violation.id.toLowerCase();
  const tags = violation.tags.join(' ').toLowerCase();

  if (id.includes('color-contrast') || id.includes('contrast')) {
    return 'colorContrast';
  }
  if (id.includes('image') || id.includes('alt') || tags.includes('cat.text-alternatives')) {
    return 'images';
  }
  if (id.includes('keyboard') || id.includes('focus') || id.includes('tabindex')) {
    return 'keyboard';
  }
  if (id.includes('heading') || id.includes('landmark') || id.includes('aria') || id.includes('label')) {
    return 'semanticHTML';
  }
  return 'other';
}

/**
 * Extract WCAG criteria from tags
 * @param {Array} tags - Tags array
 * @returns {Array} WCAG criteria
 */
function extractWCAGCriteria(tags) {
  return tags.filter(tag => tag.startsWith('wcag')).map(tag => {
    // Convert wcag111 to WCAG 1.1.1
    const match = tag.match(/wcag(\d)(\d+)/);
    if (match) {
      const level = match[1];
      const criteria = match[2].split('').join('.');
      return `WCAG ${level}.${criteria}`;
    }
    return tag;
  });
}

/**
 * Get remediation guidance for specific issues
 * @param {string} violationId - Violation ID
 * @param {Object} node - Node object
 * @returns {Object} Remediation guidance
 */
function getRemediationGuidance(violationId, node) {
  const guidance = {
    'color-contrast': {
      issue: 'Text does not have sufficient color contrast with its background',
      steps: [
        'Use a color contrast checker tool to verify ratios',
        'Ensure normal text has at least 4.5:1 contrast ratio',
        'Ensure large text (18pt+ or 14pt+ bold) has at least 3:1 contrast ratio',
        'Consider using darker text or lighter backgrounds',
        'Test with various color blindness simulators'
      ]
    },
    'image-alt': {
      issue: 'Images must have alternative text for screen readers',
      steps: [
        'Add descriptive alt text that conveys the image\'s purpose',
        'For decorative images, use alt=""',
        'Keep alt text concise but meaningful (under 125 characters)',
        'Don\'t include "image of" or "picture of" in alt text',
        'For complex images, provide extended descriptions'
      ]
    },
    'button-name': {
      issue: 'Buttons must have discernible text',
      steps: [
        'Add visible text content inside the button',
        'Or use aria-label attribute for icon buttons',
        'Ensure button purpose is clear to all users',
        'Avoid using only icons without text alternatives'
      ]
    },
    'link-name': {
      issue: 'Links must have discernible text',
      steps: [
        'Add descriptive link text that indicates destination',
        'Avoid generic phrases like "click here" or "read more"',
        'For icon links, add aria-label with descriptive text',
        'Ensure link purpose is clear from its text alone'
      ]
    },
    'heading-order': {
      issue: 'Heading levels should increase by one',
      steps: [
        'Maintain logical heading hierarchy (h1 > h2 > h3)',
        'Don\'t skip heading levels (e.g., h1 to h3)',
        'Use only one h1 per page',
        'Use headings to structure content, not for styling'
      ]
    },
    'label': {
      issue: 'Form elements must have labels',
      steps: [
        'Add <label> element associated with the input',
        'Use for/id attributes to connect label and input',
        'Or use aria-label or aria-labelledby attributes',
        'Ensure label describes the input\'s purpose clearly'
      ]
    },
    'list': {
      issue: 'List elements must be properly structured',
      steps: [
        'Ensure <li> elements are only direct children of <ul> or <ol>',
        'Use semantic list markup for related items',
        'Don\'t use lists solely for layout purposes'
      ]
    },
    'aria-required-attr': {
      issue: 'ARIA roles must have required attributes',
      steps: [
        'Add all required ARIA attributes for the role',
        'Consult ARIA specification for role requirements',
        'Test with screen readers to verify functionality'
      ]
    },
    'landmark-one-main': {
      issue: 'Document must have one main landmark',
      steps: [
        'Add a <main> element or role="main" to primary content',
        'Use only one main landmark per page',
        'Ensure main content is wrapped in the landmark'
      ]
    },
    'region': {
      issue: 'Page content must be contained by landmarks',
      steps: [
        'Use semantic HTML5 elements (header, nav, main, footer)',
        'Or use ARIA landmark roles',
        'Ensure all content is within appropriate landmarks'
      ]
    }
  };

  const baseGuidance = guidance[violationId] || {
    issue: node.failureSummary || 'Accessibility issue detected',
    steps: [
      'Review the WCAG documentation for this issue',
      'Test the fix with assistive technologies',
      'Consult with accessibility experts if needed'
    ]
  };

  return {
    ...baseGuidance,
    element: node.html,
    selector: node.target.join(', ')
  };
}

module.exports = { scanWebsite };
