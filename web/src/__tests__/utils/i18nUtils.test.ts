import { describe, expect, it } from 'vitest';

import { normalizeStationKey } from '../../utils/i18nUtils';

describe('normalizeStationKey', () => {
  it('converts Finnish characters ä, ö, å to ASCII', () => {
    expect(normalizeStationKey('Sodankylä')).toBe('sodankyla');
    expect(normalizeStationKey('Oulujärvi')).toBe('oulujarvi');
  });

  it('lowercases the input', () => {
    expect(normalizeStationKey('KEVO')).toBe('kevo');
    expect(normalizeStationKey('Helsinki')).toBe('helsinki');
  });

  it('trims whitespace', () => {
    expect(normalizeStationKey('  Kevo  ')).toBe('kevo');
    expect(normalizeStationKey('\tMuonio\n')).toBe('muonio');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeStationKey('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(normalizeStationKey(null as unknown as string)).toBe('');
    expect(normalizeStationKey(undefined as unknown as string)).toBe('');
  });

  it('removes non-alphanumeric characters', () => {
    expect(normalizeStationKey('Nurmijärvi!')).toBe('nurmijarvi');
    expect(normalizeStationKey('test-station')).toBe('teststation');
    expect(normalizeStationKey('hello world')).toBe('helloworld');
  });

  it('handles combining diacritical marks via NFD normalization', () => {
    // Pre-composed vs decomposed form of ä
    const precomposed = 'Sodankyl\u00E4'; // ä as single char
    const decomposed = 'Sodankyla\u0308'; // a + combining umlaut
    expect(normalizeStationKey(precomposed)).toBe('sodankyla');
    expect(normalizeStationKey(decomposed)).toBe('sodankyla');
  });

  it('handles all Finnish station names correctly', () => {
    const stations = [
      ['Kevo', 'kevo'],
      ['Kilpisjärvi', 'kilpisjarvi'],
      ['Ivalo', 'ivalo'],
      ['Muonio', 'muonio'],
      ['Sodankylä', 'sodankyla'],
      ['Pello', 'pello'],
      ['Ranua', 'ranua'],
      ['Oulujärvi', 'oulujarvi'],
      ['Mekrijärvi', 'mekrijarvi'],
      ['Hankasalmi', 'hankasalmi'],
      ['Nurmijärvi', 'nurmijarvi'],
      ['Tartto', 'tartto'],
    ];

    stations.forEach(([input, expected]) => {
      expect(normalizeStationKey(input)).toBe(expected);
    });
  });
});
