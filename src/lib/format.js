// Small formatting helpers (dates, times, prices, place backgrounds).
export const fmtEur = n => '€' + n.toFixed(2).replace('.', ',');
export const pad = n => String(n).padStart(2, '0');
export const hm = m => pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);
export const dur = m => Math.floor(m / 60) + 'h ' + pad(m % 60) + 'm';
export const tomorrow = () => { const d = new Date(Date.now() + 864e5); return d.toISOString().slice(0, 10); };
export const today = () => new Date().toISOString().slice(0, 10);
export const niceDate = iso => new Date(iso + 'T12:00').toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'});
export const mkRef = () => Array.from({length:6}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.random() * 32 | 0]).join('');
export const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const dayDiff = t => Math.round((new Date(t).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 864e5);
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// "Today, 18:00" · "Tomorrow, 10:00" · "Sat 7 Nov, 15:00"
export function whenText(t, long) {
  const d = new Date(t), dd = dayDiff(t), time = pad(d.getHours()) + ':' + pad(d.getMinutes());
  if (t <= Date.now()) return 'Happening now · started ' + time;
  const full = d.toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'});
  if (dd === 0 || dd === 1) return (dd ? 'Tomorrow' : 'Today') + ', ' + time + (long ? ' · ' + full : '');
  return full + ', ' + time;
}
// Time separator in the chat: "Today 18:00", "Yesterday 09:12", "Sat 7 Nov 15:00"
export function stamp(t) {
  const dd = dayDiff(t), d = new Date(t);
  const day = dd === 0 ? 'Today' : dd === -1 ? 'Yesterday' : d.toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'});
  return day + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// Background of a place: the photo over its colour gradient (the gradient shows while loading or offline).
export function bg(p, shade) {
  const img = p.img ? `url('${p.img}') center/cover no-repeat, ` : '';
  const sh = shade ? 'linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0) 60%), ' : '';
  return sh + img + p.g;
}
