// App-wide demo date (Stage 4): Profile → "Demo: simulate next day" moves the app's clock forward by whole days.
// Used by the daily challenges, the streak and the reminders. Saved, with a reset (userData.js demoDays).
import { emit, toast } from './appStore.js';
import { getDemoDays, setDemoDays } from './userData.js';
import { ymd, niceDate } from '../lib/format.js';

export const appNow = () => Date.now() + getDemoDays() * 864e5;
export const appToday = () => ymd(new Date(appNow()));
export const demoDays = () => getDemoDays();
export function nextDemoDay() { setDemoDays(getDemoDays() + 1); emit(); toast('Demo date: ' + niceDate(appToday())); }
export function resetDemoDate() { setDemoDays(0); emit(); toast('Back to today'); }
