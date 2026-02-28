import { describe, expect, it } from 'vitest';

import { buildProxyUrl } from '../../utils/proxy';

describe('buildProxyUrl', () => {
  it('wraps URL with the proxy endpoint', () => {
    const result = buildProxyUrl('https://example.com/data.json');
    expect(result).toBe(
      'https://proxy.aleksi-nokelainen.workers.dev/?url=https%3A%2F%2Fexample.com%2Fdata.json',
    );
  });

  it('encodes special characters in the URL', () => {
    const result = buildProxyUrl('https://example.com/path?key=value&foo=bar');
    expect(result).toContain('https%3A%2F%2Fexample.com%2Fpath%3Fkey%3Dvalue%26foo%3Dbar');
  });

  it('handles URLs with spaces and unicode characters', () => {
    const result = buildProxyUrl('https://example.com/data file.json');
    expect(result).toContain(encodeURIComponent('https://example.com/data file.json'));
  });

  it('returns proper format for empty string', () => {
    const result = buildProxyUrl('');
    expect(result).toBe('https://proxy.aleksi-nokelainen.workers.dev/?url=');
  });
});
