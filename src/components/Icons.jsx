// UI icons: one line-icon set (lucide-react, tree-shaken: only the icons imported here and in the screens are bundled).
// Emoji stay only for badges, avatars, chat and the quest icons of the challenge game.
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Landmark, Palette, Trees, Utensils, Moon, MapPin, Plane, BedDouble, CarTaxiFront, Users, Leaf, Bus,
         Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

export const CAT_ICONS = {sights: Landmark, museums: Palette, parks: Trees, food: Utensils, nightlife: Moon};
export const catIcon = p => CAT_ICONS[p.cats[0]] || MapPin;
// bookings and meetups (Trip, Book, Reminders)
export const KIND_ICONS = {flight: Plane, hotel: BedDouble, taxi: CarTaxiFront, meetup: Users};
// taxi ride types (data/booking.js RIDES ids)
export const RIDE_ICONS = {eco: Leaf, std: CarTaxiFront, xl: Bus};

// WMO weather code (Open-Meteo) → icon
export function wxIcon(code) {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return CloudRain;
}

// An icon as an SVG string, for HTML that React doesn't render (Leaflet map pins). Rendered once per icon and cached.
const svgCache = new Map();
export function iconSvg(Icon, size = 16) {
  const key = (Icon.displayName || Icon.name) + size;
  if (!svgCache.has(key)) {
    const el = document.createElement('div'), root = createRoot(el);
    flushSync(() => root.render(<Icon size={size} strokeWidth={2} aria-hidden="true" />));
    svgCache.set(key, el.innerHTML);
    root.unmount();
  }
  return svgCache.get(key);
}
