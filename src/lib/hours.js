// "Open now" (EE-43): checks a place's weekly schedule (p.week, see parseHours in data/places.js)
// against the current local time in Berlin, whatever the time zone of the phone is.
const fmt = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});
const WD = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6};

// Berlin weekday (0 = Sunday) and minutes since midnight
export function berlinNow(date = new Date()) {
  const parts = Object.fromEntries(fmt.formatToParts(date).map(x => [x.type, x.value]));
  return {day: WD[parts.weekday], min: +parts.hour * 60 + +parts.minute};
}

export function isOpenNow(p, date) {
  if (p.oh === '24/7') return true;
  const {day, min} = berlinNow(date), yest = (day + 6) % 7;
  return p.week[day].some(([a, b]) => min >= a && min < b)
      || p.week[yest].some(([, b]) => b > 1440 && min < b - 1440);   // yesterday's late opening, past midnight
}
