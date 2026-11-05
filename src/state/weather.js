// 5-day Berlin forecast from the free Open-Meteo API (no key). Kept for this session (not saved).
// If the request fails, times out or the phone is offline, a clearly labelled demo forecast is used.
import { emit } from './appStore.js';
import { BERLIN, RAINY, demoForecast } from '../data/weather.js';

export const weather = {status: 'idle', days: [], tried: 0};   // status: idle | loading | live | demo

const berlinToday = () => new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Berlin'}).format(new Date());   // YYYY-MM-DD
const URL_ = 'https://api.open-meteo.com/v1/forecast?latitude=' + BERLIN.lat + '&longitude=' + BERLIN.lon +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FBerlin&forecast_days=5';

function useDemo() { Object.assign(weather, {status: 'demo', days: demoForecast(berlinToday())}); emit(); }

export function loadWeather() {
  const fresh = weather.status === 'live' && weather.days[0] && weather.days[0].date === berlinToday();
  if (fresh || weather.status === 'loading') return;
  if (weather.status === 'demo' && Date.now() - weather.tried < 60e3) return;   // retry the live forecast at most once a minute
  weather.tried = Date.now();
  if (!navigator.onLine) return useDemo();
  weather.status = 'loading';
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 6000);
  fetch(URL_, {signal: ctl.signal})
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(j => {
      const d = j.daily, n = d && Array.isArray(d.time) ? Math.min(5, d.time.length) : 0;
      if (n < 5) throw new Error('bad data');
      const num = v => (typeof v === 'number' ? v : null);
      const days = d.time.slice(0, 5).map((date, i) => ({date, code: num(d.weather_code[i]) ?? 3,
        hi: Math.round(num(d.temperature_2m_max[i]) ?? 0), lo: Math.round(num(d.temperature_2m_min[i]) ?? 0),
        rain: num(d.precipitation_probability_max[i]) ?? 0}));
      Object.assign(weather, {status: 'live', days}); emit();
    })
    .catch(useDemo)
    .finally(() => clearTimeout(t));
}

export const isRainy = day => day.rain >= RAINY;
// For a later stage: the forecast for a travel date (YYYY-MM-DD), if it is within the next 5 days
export const forecastFor = date => weather.days.find(d => d.date === date) || null;
