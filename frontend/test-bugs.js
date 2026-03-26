const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`[PAGE ERROR] ${err.message}`);
  });
  
  page.on('requestfailed', req => {
    errors.push(`[REQUEST FAILED] ${req.url()} - ${req.failure()?.errorText}`);
  });

  async function testPage(name, url) {
    console.log(`\n=== Testing: ${name} (${url}) ===`);
    errors.length = 0;
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`Status: ${response?.status()}`);
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      console.log(`Title: ${title}`);
      
      if (errors.length > 0) {
        console.log(`Errors found: ${errors.length}`);
        errors.forEach(e => console.log(`  - ${e}`));
      } else {
        console.log(`No errors found`);
      }
    } catch (e) {
      console.log(`Navigation error: ${e.message}`);
    }
    return errors;
  }
  
  // Test frontend pages
  await testPage('Home Page', 'http://localhost:8001/');
  await testPage('Articles List', 'http://localhost:8001/articles');
  await testPage('Categories', 'http://localhost:8001/categories');
  await testPage('Tags', 'http://localhost:8001/tags');
  await testPage('Message', 'http://localhost:8001/message');
  await testPage('About', 'http://localhost:8001/about');
  
  // Test admin login
  await testPage('Admin Login', 'http://localhost:8001/admin/login');
  
  // Test admin dashboard if accessible
  console.log('\n=== Testing Admin Dashboard ===');
  errors.length = 0;
  try {
    // Try to access admin dashboard directly
    const response = await page.goto('http://localhost:8001/admin/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    console.log(`Dashboard Status: ${response?.status()}`);
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    if (errors.length > 0) {
      console.log(`Errors: ${errors.length}`);
      errors.forEach(e => console.log(`  - ${e}`));
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
  
  // Check for common UI issues
  console.log('\n=== Checking for UI Issues ===');
  try {
    await page.goto('http://localhost:8001/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Check if page has content
    const bodyText = await page.textContent('body');
    console.log(`Body has content: ${bodyText.length > 100 ? 'Yes' : 'No'}`);
    
    // Check for visible navigation
    const navLinks = await page.$$('a[href]');
    console.log(`Navigation links found: ${navLinks.length}`);
    
    // Check for visible text
    const headings = await page.$$eval('h1, h2, h3', els => els.map(el => el.textContent?.trim()).filter(t => t));
    console.log(`Headings: ${headings.slice(0, 5).join(', ')}`);
    
  } catch (e) {
    console.log(`UI Check Error: ${e.message}`);
  }
  
  await browser.close();
  console.log('\n=== Test Complete ===');
})();
