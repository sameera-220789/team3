const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('response', response => console.log('RESPONSE:', response.status(), response.url()));
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('NAVIGATED TO:', frame.url());
    }
  });

  try {
    await page.goto('http://localhost:5173/dashboard');
    await new Promise(r => setTimeout(r, 5000));
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
