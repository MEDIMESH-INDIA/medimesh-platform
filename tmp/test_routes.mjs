import puppeteer from 'puppeteer';

const port = process.argv[2] || 5173;
const routes = [
  '/',
  '/discover',
  '/compare',
  '/doctors',
  '/home-visits',
  '/for-doctors',
  '/for-hospitals',
  '/about',
  '/login',
  '/register',
  '/app',
  '/app/discover',
  '/app/compare',
  '/app/saved',
  '/app/doctors',
  '/app/home-visits',
  '/doctors/dr-suresh-patil',
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  let anyError = false;

  console.log(`Testing routes on port ${port}...`);

  for (const route of routes) {
    try {
      await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'networkidle2', timeout: 10000 });
      const html = await page.content();
      if (html.includes('Vite Error') || html.includes('Internal server error')) {
        console.log(`❌ ${route} -> Vite Compilation Error`);
        anyError = true;
      } else if (html.includes('MEDIMESH could not load this page') || html.includes('An unexpected error occurred')) {
        console.log(`❌ ${route} -> React Error Boundary Triggered`);
        anyError = true;
      } else {
        console.log(`✅ ${route} -> OK`);
      }
    } catch (e) {
      console.log(`❌ ${route} -> Error: ${e.message}`);
      anyError = true;
    }
  }

  await browser.close();
  if (anyError) process.exit(1);
})();
