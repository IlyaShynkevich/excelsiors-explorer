import { useEffect, useState } from 'react';

// Re-renders the screen every `ms` (default 30 s), so things that depend on the real clock
// (due reminders, "upcoming" in the trip) update while the screen stays open.
export function useClock(ms = 30e3) {
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), ms); return () => clearInterval(t); }, [ms]);
}
