// Weather on Home: Berlin coordinates for Open-Meteo, icons for the WMO weather codes it returns,
// and a demo forecast that is shown (clearly labelled) when the live forecast can't be loaded.
export const BERLIN = {lat: 52.52, lon: 13.405};
export const RAINY = 60;   // rain chance (%) from which a day counts as rainy

// WMO weather interpretation codes → [icon, label]
export function wmo(code) {
  if (code === 0) return ['☀️', 'Clear sky'];
  if (code <= 2) return ['🌤️', 'Partly cloudy'];
  if (code === 3) return ['☁️', 'Overcast'];
  if (code <= 48) return ['🌫️', 'Fog'];
  if (code <= 57) return ['🌦️', 'Drizzle'];
  if (code <= 67) return ['🌧️', 'Rain'];
  if (code <= 77) return ['🌨️', 'Snow'];
  if (code <= 82) return ['🌦️', 'Rain showers'];
  if (code <= 86) return ['🌨️', 'Snow showers'];
  return ['⛈️', 'Thunderstorm'];
}

// Demo forecast for the next 5 days (day 2 is rainy, so the "try indoor places" hint can be shown)
const DEMO = [[3, 11, 5, 20], [61, 9, 4, 70], [3, 8, 2, 40], [1, 10, 3, 10], [2, 12, 6, 30]];
export function demoForecast(startIso) {
  const d0 = new Date(startIso + 'T12:00');
  return DEMO.map(([code, hi, lo, rain], i) => {
    const d = new Date(d0); d.setDate(d0.getDate() + i);
    return {date: d.toISOString().slice(0, 10), code, hi, lo, rain};
  });
}
