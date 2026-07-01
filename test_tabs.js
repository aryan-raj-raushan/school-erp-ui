const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('=== ATTENDANCE REPORT TABS TEST ===\n');

    // Navigate to app
    await page.goto('http://localhost:3001/attendance/report/students', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if logged in
    try {
      await page.waitForSelector('button:has-text("Daily")', { timeout: 5000 });
      console.log('✅ Loaded attendance report page\n');
    } catch {
      console.log('❌ Not logged in or page not loaded');
      await browser.close();
      return;
    }

    // Test each tab
    const tabs = ['Daily', 'Monthly', 'Defaulters', 'Student History', 'Missing Punch', 'Heatmap', 'Late Trend'];
    const results = {};

    for (const tabName of tabs) {
      console.log(`--- TAB: ${tabName.toUpperCase()} ---`);
      try {
        await page.click(`button:has-text("${tabName}")`);
        await page.waitForTimeout(500);

        // Count visible selects and inputs
        const selects = await page.$$('select');
        const dateInputs = await page.$$('input[type="date"]');
        const numberInputs = await page.$$('input[type="number"]');
        const buttons = await page.$$('button:has-text("Fetch"), button:has-text("Load")');

        results[tabName] = {
          selectors: selects.length,
          dateInputs: dateInputs.length,
          numberInputs: numberInputs.length,
          buttons: buttons.length > 0,
          status: 'OK'
        };

        console.log(`✅ Selectors: ${selects.length}, Date Inputs: ${dateInputs.length}, Number Inputs: ${numberInputs.length}`);
        if (buttons.length > 0) console.log(`✅ Action button exists`);
        console.log('');
      } catch (error) {
        results[tabName] = { status: 'ERROR', error: error.message };
        console.log(`❌ Error: ${error.message}\n`);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(JSON.stringify(results, null, 2));

    // Take a screenshot
    await page.screenshot({ path: 'C:\Users\tejas\AppData\Local\Temp\attendance_tabs.png' });
    console.log('\nScreenshot saved');

  } catch (error) {
    console.error('Fatal error:', error.message);
  } finally {
    await browser.close();
  }
})();
