import { assertPublicUrl } from './fetch.js';

const DEFAULT_TIMEOUT_MS = 20_000;

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    try {
      return await import('playwright-core');
    } catch {
      throw new Error(
        'Browser rendering requires Playwright. Install it with "npm install playwright" and "npx playwright install chromium".'
      );
    }
  }
}

async function launchBrowser(chromium) {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    try {
      return await chromium.launch({ channel: 'chrome', headless: true });
    } catch {
      throw new Error(`Could not launch a Chromium browser: ${error.message}`);
    }
  }
}

export async function renderWithPlaywright(input, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = await assertPublicUrl(input);
  const { chromium } = await loadPlaywright();
  const browser = await launchBrowser(chromium);

  try {
    const context = await browser.newContext({
      javaScriptEnabled: true,
      serviceWorkers: 'block'
    });
    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);

    await page.route('**/*', async (route) => {
      const request = route.request();
      const resourceType = request.resourceType();

      if (['font', 'image', 'media'].includes(resourceType)) {
        await route.abort('blockedbyclient');
        return;
      }

      const requestUrl = request.url();
      if (!/^https?:/i.test(requestUrl)) {
        await route.continue();
        return;
      }

      try {
        await assertPublicUrl(requestUrl);
        await route.continue();
      } catch {
        await route.abort('blockedbyclient');
      }
    });

    await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => {});
    const finalUrl = await assertPublicUrl(page.url());
    const html = await page.content();

    return {
      html,
      url: finalUrl.toString()
    };
  } finally {
    await browser.close();
  }
}
