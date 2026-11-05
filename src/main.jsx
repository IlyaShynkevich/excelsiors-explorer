import { createRoot } from 'react-dom/client';
import lego from './assets/lego.jpg';
import './styles/base.css';
import './styles/forms.css';
import './styles/screens.css';
import './styles/booking.css';
import './styles/sheet.css';
import './styles/meetups-chat.css';
import './styles/explore.css';
import './styles/trip.css';
import './styles/arrive.css';
import './styles/motion.css';
import { App } from './App.jsx';

// Test switch for reduced motion: open the app with ?motion=reduce (e.g. /?motion=reduce#home) and it behaves
// like the OS "Reduce motion" setting is on (styles/motion.css, lib/motion.js).
if (new URLSearchParams(location.search).get('motion') === 'reduce') document.documentElement.classList.add('reduce-motion');

// The Lego avatar picture is used through a CSS variable (.av-lego)
document.documentElement.style.setProperty('--lego', `url("${lego}")`);

createRoot(document.getElementById('root')).render(<App />);

// Register the service worker (needed for "Install app"). Only works on https / localhost, not file://;
// not in `npm run dev`, so the cache never holds dev files.
if (import.meta.env.PROD && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
