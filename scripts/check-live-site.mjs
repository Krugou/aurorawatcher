import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.resolve(repoRoot, process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'output/playwright');
const baseUrl = process.env.AURORA_WATCHER_URL ?? 'https://krugou.github.io/aurorawatcher/';
const results = [];
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const badResponses = [];
const magnetometerRequests = [];

const record = (name, passed, details, severity = 'fail') => {
  results.push({ name, status: passed ? 'passed' : severity, details });
};

const uniqueBy = (items, keyOf) => [...new Map(items.map((item) => [keyOf(item), item])).values()];

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.addInitScript(() => localStorage.clear());

  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' });
  });
  page.on('request', (request) => {
    if (request.url().includes('opendata.fmi.fi/wfs')) magnetometerRequests.push(request.url());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      badResponses.push({ status: response.status(), url: response.url() });
    }
  });

  const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('h1').first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(6000);

  record('Site responds', response?.ok() ?? false, {
    status: response?.status() ?? null,
    url: page.url(),
    title: await page.title(),
  });
  record('Main dashboard renders', (await page.locator('h1').count()) === 1, {
    heading: await page.locator('h1').first().textContent(),
  });

  const galleryResponse = await page.request.get(new URL('data/aurora_gallery.json', baseUrl).href);
  const galleryData = galleryResponse.ok() ? await galleryResponse.json() : { entries: [] };
  const galleryEntries = Array.isArray(galleryData.entries) ? galleryData.entries : [];
  const colorCount = (entry) => entry.greenPixels + entry.purplePixels + entry.redPixels;
  const galleryIsRanked = galleryEntries.every((entry, index) => {
    if (index === 0) return true;
    const previous = galleryEntries[index - 1];
    return (
      colorCount(previous) > colorCount(entry) ||
      (colorCount(previous) === colorCount(entry) &&
        (previous.score > entry.score ||
          (previous.score === entry.score && previous.timestamp >= entry.timestamp)))
    );
  });
  const gallerySection = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: /Aurora Color Gallery|Revontulivärien galleria/i }) })
    .first();
  const galleryText = await gallerySection.innerText().catch(() => '');
  const placeNames = {
    muonio: ['Muonio, Finland', 'Muonio, Suomi'],
    nyrola: ['Nyrölä Observatory, Finland', 'Nyrölän Observatorio, Suomi'],
    hankasalmi: ['Hankasalmi Observatory', 'Hankasalmen observatorio'],
    metsahovi: ['Metsähovi Radio Observatory', 'Metsähovin radio-observatorio'],
  };
  const firstPlaceName = galleryEntries[0] ? placeNames[galleryEntries[0].camId] : null;
  const galleryPlaceIsVisible =
    galleryEntries.length > 0 &&
    Array.isArray(firstPlaceName) &&
    firstPlaceName.some((name) => galleryText.includes(name));
  record(
    'Curated gallery data is saved in aurora-color order and displays the full place name',
    galleryResponse.ok() && galleryEntries.length > 0 && galleryIsRanked && galleryPlaceIsVisible,
    {
      status: galleryResponse.status(),
      count: galleryEntries.length,
      firstMatch: galleryEntries[0] ?? null,
      ranked: galleryIsRanked,
      placeNameVisible: galleryPlaceIsVisible,
    },
  );

  const accessibleSectionToggles = await page.locator(
    'section > button[aria-expanded][aria-controls]',
  ).count();
  record('Section toggles expose expanded state and panel controls', accessibleSectionToggles >= 6, {
    count: accessibleSectionToggles,
  });

  const cameraImages = await page.locator('img').evaluateAll((images) =>
    images.map((image) => ({
      alt: image.alt,
      src: image.currentSrc || image.src,
      loaded: image.complete && image.naturalWidth > 0,
    })),
  );
  const failedImages = cameraImages.filter((image) => !image.loaded);
  record('Observatory and webcam images load', failedImages.length === 0, {
    imageCount: cameraImages.length,
    failed: failedImages,
  });

  const themeButton = page.getByRole('button', {
    name: /Switch to Light Mode|Switch to Dark Mode|Vaihda vaaleaan tilaan|Vaihda tummaan tilaan/i,
  });
  const beforeTheme = await themeButton.getAttribute('aria-label');
  await themeButton.click();
  const afterTheme = await themeButton.getAttribute('aria-label');
  record('Theme toggle responds', beforeTheme !== afterTheme, {
    before: beforeTheme,
    after: afterTheme,
  });
  await themeButton.click();

  const languageButton = page.getByRole('button', { name: /Switch Language|Vaihda kieli/i });
  const originalHeading = (await page.locator('h1').first().textContent())?.trim();
  await languageButton.click();
  const switchedHeading = (await page.locator('h1').first().textContent())?.trim();
  await languageButton.click();
  const restoredHeading = (await page.locator('h1').first().textContent())?.trim();
  record(
    'Language toggle responds and restores the original language',
    switchedHeading !== originalHeading && restoredHeading === originalHeading,
    {
      originalHeading,
      switchedHeading,
      restoredHeading,
    },
  );

  await page.waitForTimeout(8000);
  const graphSection = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: /Real-time Activity Graphs|Reaaliaikaiset graafit/i }),
    })
    .first();
  const graphButton = graphSection.getByRole('button').first();
  const graphContent = graphSection.locator(':scope > div').first();
  const initiallyExpanded = !(await graphContent.getAttribute('class'))?.includes('max-h-0');
  if (!initiallyExpanded) {
    await graphButton.click();
    await page.waitForTimeout(700);
  }

  const graphMetrics = await graphSection.evaluate((section) => ({
    chartCount: section.querySelectorAll('svg.recharts-surface').length,
    chartContainers: section.querySelectorAll('[class*="h-[250px]"]').length,
    text: section.innerText.trim(),
  }));
  record('Activity graphs render with data', graphMetrics.chartCount >= 1, graphMetrics);
  const magnetometerStatusVisible =
    /FMI|magnetometer|Ilmatieteen/i.test(graphMetrics.text) &&
    /Try again|Yritä uudelleen/i.test(graphMetrics.text);
  record(
    'Magnetometer graph or explicit FMI availability state is visible',
    graphMetrics.chartContainers >= 2 || magnetometerStatusVisible,
    {
      chartContainers: graphMetrics.chartContainers,
      statusVisible: magnetometerStatusVisible,
    },
  );
  const usesHelsinkiDefault = magnetometerRequests.some((requestUrl) => {
    const bbox = new URL(requestUrl).searchParams.get('bbox');
    return bbox?.startsWith('58.1699,22.9384,62.1699,26.9384') ?? false;
  });
  record('Magnetometer history uses Helsinki when location is unavailable', usesHelsinkiDefault, {
    requests: magnetometerRequests,
  });

  const weatherSection = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: /Space Weather \(Live\)|Avaruussää \(Live\)/i }),
    })
    .first();
  const weatherText = await weatherSection.innerText().catch(() => '');
  record(
    'Live space-weather values render',
    /\bBz\b/i.test(weatherText) && /\bKp\b/i.test(weatherText),
    {
      visibleText: weatherText.trim(),
    },
  );

  await mkdir(outputDir, { recursive: true });
  const screenshotPath = path.join(outputDir, 'live-site.png');
  await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });

  const historyLink = page.getByRole('link', { name: /HISTORY|HISTORIA/i }).first();
  await historyLink.click();
  await page.waitForTimeout(500);
  const historyModeWorks = new URL(page.url()).searchParams.get('cam') !== null;
  record('Camera history link opens a camera view', historyModeWorks, { url: page.url() });

  record('No uncaught browser exceptions', pageErrors.length === 0, pageErrors);
  const relevantFailedRequests = failedRequests.filter(
    ({ url, error }) =>
      !error.includes('ERR_ABORTED') &&
      !url.includes('google-analytics.com') &&
      !url.includes('firestore.googleapis.com'),
  );
  const uniqueFailedRequests = uniqueBy(
    relevantFailedRequests,
    ({ url, error }) => `${error} ${url.split('?')[0]}`,
  );
  const uniqueBadResponses = uniqueBy(
    badResponses,
    ({ status, url }) => `${status} ${url.split('&t=')[0]}`,
  );
  record(
    'No browser console errors',
    consoleErrors.length === 0,
    uniqueBy(consoleErrors, (text) => text),
  );
  record(
    'No failed or HTTP error requests',
    uniqueFailedRequests.length === 0 && uniqueBadResponses.length === 0,
    {
      failedRequests: uniqueFailedRequests,
      badResponses: uniqueBadResponses,
    },
  );

  const uniqueConsoleErrors = uniqueBy(consoleErrors, (text) => text);

  const report = {
    testedAt: new Date().toISOString(),
    url: baseUrl,
    browser: 'Chromium via Playwright',
    geolocation: 'not granted',
    screenshot: screenshotPath,
    summary: {
      passed: results.filter((result) => result.status === 'passed').length,
      failed: results.filter((result) => result.status === 'fail').length,
      warnings: results.filter((result) => result.status === 'warning').length,
    },
    results,
    browserErrors: {
      consoleErrors: uniqueConsoleErrors,
      pageErrors,
      failedRequests: uniqueFailedRequests,
      badResponses: uniqueBadResponses,
    },
  };

  const reportPath = path.join(outputDir, 'live-site-report.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, report: reportPath }, null, 2));

  await context.close();
  if (report.summary.failed > 0) process.exitCode = 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
