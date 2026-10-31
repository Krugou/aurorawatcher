import { expect, Page, test } from '@playwright/test';

// Near the Oulujärvi magnetometer, which is in the open FMI feed.
const LOCATION = { latitude: 64.51, longitude: 27.23 };

const member = (time: string, name: string, value: number) => `
<wfs:member><BsWfs:BsWfsElement gml:id="x">
  <BsWfs:Location><gml:Point gml:id="p" srsDimension="2"><gml:pos>64.5107 27.2267 </gml:pos></gml:Point></BsWfs:Location>
  <BsWfs:Time>${time}</BsWfs:Time>
  <BsWfs:ParameterName>${name}</BsWfs:ParameterName>
  <BsWfs:ParameterValue>${value}</BsWfs:ParameterValue>
</BsWfs:BsWfsElement></wfs:member>`;

const feedXml = () => {
  const now = Date.now();
  const rows: string[] = [];
  for (let i = 12; i >= 0; i--) {
    const time = new Date(Math.floor((now - i * 10 * 60 * 1000) / 60000) * 60000).toISOString();
    // Disturbance ramps up over the last hour
    const x = -400 - (12 - i) * 20;
    for (const [name, value] of [
      ['MAGNX_PT1M_AVG', x],
      ['MAGNY_PT1M_AVG', 100],
      ['MAGNZ_PT1M_AVG', 49000],
    ] as const) {
      rows.push(member(time, name, value));
    }
  }
  return `<?xml version="1.0"?><wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:BsWfs="http://xml.fmi.fi/schema/wfs/2.0">${rows.join('')}</wfs:FeatureCollection>`;
};

const mockNetwork = async (page: Page) => {
  await page.route('https://opendata.fmi.fi/wfs**', (route) => {
    const url = decodeURIComponent(route.request().url());
    if (url.includes('magnetometer')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/xml',
        headers: { 'access-control-allow-origin': '*' },
        body: feedXml(),
      });
    }
    return route.fulfill({
      status: 500,
      headers: { 'access-control-allow-origin': '*' },
      body: '',
    });
  });

  const cors = { 'access-control-allow-origin': '*' };
  const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  await page.route('https://services.swpc.noaa.gov/**', (route) => {
    const body = route.request().url().includes('planetary_k_index')
      ? [{ time_tag: stamp, estimated_kp: 5 }]
      : [
          ['time_tag', 'bz', 'speed', 'density'],
          [stamp, '-6', '520', '6'],
        ];
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      json: body,
    });
  });

  await page.route('https://api.met.no/**', (route) => {
    const timeseries = Array.from({ length: 30 }, (_, i) => ({
      time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      data: {
        instant: { details: { air_temperature: -5, cloud_area_fraction: i % 6 < 3 ? 10 : 90 } },
        next_1_hours: { summary: { symbol_code: 'clearsky_night' } },
      },
    }));
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      json: { properties: { timeseries } },
    });
  });
};

test.describe('Local verdict', () => {
  // The PWA service worker reloads the page when it takes control, which wipes the test state.
  test.use({ serviceWorkers: 'block' });

  test.beforeEach(async ({ context, page }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(LOCATION);
    // Force the download fallback so the test does not depend on the native share sheet.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
    });
    await mockNetwork(page);
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('shows one verdict with best time, trend and a shareable card', async ({ page }) => {
    await page.getByRole('button', { name: /Locate Me|Paikanna/i }).click();

    const card = page.getByTestId('verdict-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('data-level', /go|maybe|wait|nogo|daylight/);

    // The three old verdicts are merged into this one card
    await expect(page.getByTestId('verdict-card')).toHaveCount(1);
    await expect(page.getByText(/ODDS:/)).toHaveCount(0);

    await expect(page.getByTestId('best-window')).toBeVisible();
    await expect(page.getByTestId('trend')).toContainText(/rising|nousee/i);
    await expect(card.getByRole('listitem').first()).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await card.getByRole('button', { name: /Share verdict|Jaa arvio/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('aurora-verdict.png');
  });

  test('draws a 24h disturbance chart for the stations in the open feed', async ({ page }) => {
    const charts = page.getByTestId('station-chart');
    await expect(charts.first()).toBeAttached();
    await expect(charts.first().getByRole('img')).toHaveAttribute('aria-label', /24/);
  });
});
