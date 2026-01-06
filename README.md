# 🔍 WCAG Accessibility Scanner

A comprehensive web accessibility scanner that tests websites against **WCAG 2.1 Level AA standards** using Puppeteer and axe-core. This tool provides detailed accessibility reports with actionable remediation guidance.

## ✨ Features

- **Automated WCAG 2.1 Level AA Testing** - Comprehensive accessibility audits
- **User-Friendly Web Interface** - Simple URL input and beautiful results display
- **Detailed Reporting** - Issue categorization by severity and type
- **Remediation Guidance** - Step-by-step instructions to fix accessibility issues
- **HTML Report Export** - Download complete reports for documentation
- **Category Filtering** - Focus on specific accessibility areas:
  - 🎨 Color Contrast
  - 🖼️ Images & Alt Text
  - ⌨️ Keyboard Accessibility
  - 📝 Semantic HTML
  - 🔧 Other Issues

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/davidcristinzio/Desktop/WCAGScan
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install:
   - Express (web server)
   - Puppeteer (browser automation)
   - axe-core (accessibility testing engine)
   - body-parser (request parsing)

### Running the Scanner

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

3. **Enter a URL and click "Scan Website"**

4. **View the detailed accessibility report**

## 📋 Usage

### Web Interface

1. Enter the complete URL of the website you want to scan (including `http://` or `https://`)
2. Click the **"Scan Website"** button
3. Wait 10-30 seconds for the scan to complete
4. Review the results:
   - **Summary Statistics** - Total tests, passes, and issues
   - **Severity Breakdown** - Critical, Serious, Moderate, and Minor issues
   - **Detailed Issues** - Expandable cards with full information
5. Download the HTML report for documentation

### Command Line (Optional)

For development, you can use nodemon for auto-restart:

```bash
npm run dev
```

## 📊 Understanding the Report

### Summary Statistics

- **Total Tests** - Number of accessibility checks performed
- **Passed** - Number of elements that passed all checks
- **Issues Found** - Total number of accessibility violations

### Severity Levels

- **🔴 Critical** - Issues that will prevent access for users with disabilities
- **🟠 Serious** - Major barriers that significantly impact user experience
- **🟡 Moderate** - Noticeable issues that may cause difficulties
- **🔵 Minor** - Small issues with minimal impact

### Issue Details

Each issue includes:
- **WCAG Criteria** - Specific WCAG success criteria violated
- **Element Location** - CSS selector to find the element
- **HTML Snippet** - The problematic code
- **Issue Description** - What's wrong and why it matters
- **Remediation Steps** - How to fix the issue
- **Documentation Link** - Detailed WCAG guidance

## 🎯 Key Categories Checked

### Color Contrast
- Text-to-background contrast ratios
- Ensures readability for users with visual impairments
- Minimum 4.5:1 for normal text, 3:1 for large text

### Images
- Missing or inadequate alt text
- Decorative images properly marked
- Meaningful descriptions for complex images

### Keyboard Accessibility
- Focus indicators
- Tab order
- Keyboard-only navigation
- Interactive element accessibility

### Semantic HTML
- Proper heading hierarchy (h1-h6)
- ARIA landmarks and roles
- Form labels and associations
- List structure

## 🛠️ Technical Details

### Architecture

```
WCAGScan/
├── server.js           # Express server
├── scanner.js          # Puppeteer + axe-core scanning logic
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Web interface
│   └── styles.css     # Styling
└── README.md          # This file
```

### Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web server framework
- **Puppeteer** - Headless browser automation
- **axe-core** - Accessibility testing engine (by Deque Systems)
- **Vanilla JavaScript** - Frontend interactivity

### Standards Tested

- WCAG 2.0 Level A
- WCAG 2.0 Level AA
- WCAG 2.1 Level A
- WCAG 2.1 Level AA

## 🔧 Configuration

### Port Configuration

By default, the server runs on port 3000. To change this, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Puppeteer Options

The scanner can be configured in [scanner.js](scanner.js):

```javascript
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Timeout Settings

Page load timeout (default: 30 seconds):

```javascript
await page.goto(targetUrl, { 
  waitUntil: 'networkidle2',
  timeout: 100000 
});
```

## 📝 Example Output

### Console Output
```
🚀 WCAG Scanner server running at http://localhost:3000
📊 Open your browser and navigate to the URL above to start scanning websites
Starting scan for: https://example.com
Page loaded. Injecting axe-core...
Running accessibility scan...
Scan complete. Found 12 issues.
```

### Report Contents

- **URL** - Scanned website
- **Scan Time** - When the scan was performed
- **Total Tests** - e.g., 87 checks performed
- **Passed** - e.g., 75 elements passed
- **Issues** - e.g., 12 violations found
- **Detailed Breakdown** - Full list with remediation guidance

## 🐛 Troubleshooting

### Common Issues

**Issue:** "Failed to launch browser"
- **Solution:** Install Chromium dependencies (Linux):
  ```bash
  sudo apt-get install -y chromium-browser
  ```

**Issue:** "Navigation timeout"
- **Solution:** Increase timeout in scanner.js or check if website is accessible

**Issue:** "Port 3000 already in use"
- **Solution:** Use a different port:
  ```bash
  PORT=8080 npm start
  ```

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Puppeteer Documentation](https://pptr.dev/)
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)

## 🤝 Contributing

This is a professional accessibility scanning tool. To extend functionality:

1. Add new violation patterns in `scanner.js`
2. Update remediation guidance in `getRemediationGuidance()`
3. Enhance UI in `public/index.html` and `public/styles.css`
4. Customize reporting in the `processResults()` function

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🙏 Acknowledgments

- **axe-core** by Deque Systems - Industry-leading accessibility testing engine
- **Puppeteer** by Google Chrome team - Powerful browser automation
- **WCAG** by W3C - Comprehensive accessibility standards

---

**Built with ❤️ for digital accessibility**

*Making the web accessible to everyone, one scan at a time.*
