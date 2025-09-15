// helpers.js
export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
export const nowISO = () => new Date().toISOString();

/**
 * fetchCountries() - uses restcountries.com to get dial codes.
 * If the API fails (CORS/slow), caller can fallback.
 */
export async function fetchCountries() {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all');
    const data = await res.json();
    const mapped = data
      .map((c) => ({
        name: c?.name?.common || '',
        dial: c?.idd?.root ? c.idd.root + (c.idd.suffixes?.[0] || '') : '',
      }))
      .filter((x) => x.name && x.dial)
      .sort((a, b) => a.name.localeCompare(b.name));
    return mapped;
  } catch (err) {
    // fallback small list
    return [
      { name: 'India', dial: '+91' },
      { name: 'United States', dial: '+1' },
      { name: 'United Kingdom', dial: '+44' },
    ];
  }
}
