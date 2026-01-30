export const buildProxyUrl = (url: string): string => {
  return `https://proxy.aleksi-nokelainen.workers.dev/?url=${encodeURIComponent(url)}`;
};
