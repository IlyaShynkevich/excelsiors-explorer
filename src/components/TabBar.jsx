import { go, TABS } from '../hooks/useHashRouter.js';

const ICONS = {
  home: <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>,
  explore: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>,
  book: <svg viewBox="0 0 24 24"><path d="M2 16l20-6-2-3-7 2-6-6-2 1 4 7-5 1.5-2-2-1.5.5z"/><path d="M3 21h18"/></svg>,
  saved: <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>,
  profile: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
};
const LABELS = {home:'Home', explore:'Explore', book:'Book', saved:'Saved', profile:'Profile'};

// Floating tab bar, only shown on the five tab screens
export function TabBar({ current }) {
  return (
    <nav id="nav" className={TABS.includes(current) ? 'show' : ''}>
      {TABS.map(t => <button key={t} className={t === current ? 'active' : ''} onClick={() => go(t)}>{ICONS[t]}{LABELS[t]}</button>)}
    </nav>
  );
}
