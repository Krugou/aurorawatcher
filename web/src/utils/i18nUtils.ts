export const normalizeStationKey = (name: string): string => {
  if (!name) return '';
  const lowercase = name.trim().toLowerCase();

  // Manual replacement for common Finnish characters to ensure ASCII
  const ascii = lowercase.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'a');

  // Then normalize to remove potential combining marks and strip anything else non-alphanumeric
  return ascii
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
};
