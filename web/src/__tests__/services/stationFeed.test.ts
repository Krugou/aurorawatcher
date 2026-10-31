import { describe, expect, it, vi } from 'vitest';

import {
  buildStationSeries,
  fetchStationFeed,
  getStationsMissingFromFeed,
  parseFeedXml,
} from '../../services/stationFeed';

const member = (lat: number, lon: number, time: string, name: string, value: number) => `
<wfs:member><BsWfs:BsWfsElement gml:id="x">
  <BsWfs:Location><gml:Point gml:id="p" srsDimension="2"><gml:pos>${lat} ${lon} </gml:pos></gml:Point></BsWfs:Location>
  <BsWfs:Time>${time}</BsWfs:Time>
  <BsWfs:ParameterName>${name}</BsWfs:ParameterName>
  <BsWfs:ParameterValue>${value}</BsWfs:ParameterValue>
</BsWfs:BsWfsElement></wfs:member>`;

// Ivalo (68.559, 27.289): quiet baseline, then one big excursion at the end
const ivalo = (time: string, x: number, y: number) =>
  member(68.559, 27.289, time, 'MAGNX_PT1M_AVG', x) +
  member(68.559, 27.289, time, 'MAGNY_PT1M_AVG', y);

const xml = [
  ivalo('2026-10-31T18:00:00Z', -400, 100),
  ivalo('2026-10-31T18:10:00Z', -402, 101),
  ivalo('2026-10-31T18:20:00Z', -398, 99),
  ivalo('2026-10-31T18:30:00Z', -800, 100),
  member(10, 10, '2026-10-31T18:30:00Z', 'MAGNX_PT1M_AVG', 1), // far from any station
].join('');

describe('parseFeedXml', () => {
  it('extracts position, time, parameter and value without a DOM parser', () => {
    const rows = parseFeedXml(xml);
    expect(rows).toHaveLength(9);
    expect(rows[0]).toEqual({
      lat: 68.559,
      lon: 27.289,
      time: Date.parse('2026-10-31T18:00:00Z'),
      parameter: 'MAGNX_PT1M_AVG',
      value: -400,
    });
  });
});

describe('buildStationSeries', () => {
  it('matches stations by position and measures deviation from the median', () => {
    const series = buildStationSeries(parseFeedXml(xml));
    expect(series).toHaveLength(1);
    const [ivaloSeries] = series;
    expect(ivaloSeries.name).toBe('Ivalo');
    expect(ivaloSeries.samples).toHaveLength(4);
    expect(ivaloSeries.latest?.disturbance).toBeGreaterThan(390);
    expect(ivaloSeries.status).toBe('HIGH');
    expect(ivaloSeries.peak).toBe(ivaloSeries.latest?.disturbance);
  });

  it('lists the stations that still need the map image', () => {
    const missing = getStationsMissingFromFeed(buildStationSeries(parseFeedXml(xml)));
    expect(missing).not.toContain('Ivalo');
    expect(missing).toContain('Sodankylä');
    expect(missing).toHaveLength(11);
  });
});

describe('fetchStationFeed', () => {
  it('requests the open magnetometer feed and parses it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(xml) });
    const series = await fetchStationFeed(24, fetchMock as unknown as typeof fetch);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(decodeURIComponent(url)).toContain('fmi::observations::magnetometer::simple');
    expect(url).toContain('timestep=10');
    expect(series[0].name).toBe('Ivalo');
  });

  it('throws on HTTP errors so callers can fall back to the map image', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchStationFeed(24, fetchMock as unknown as typeof fetch)).rejects.toThrow('503');
  });
});
