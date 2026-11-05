import { useEffect, useRef, useState } from 'react';
import { COORDS } from '../data/booking.js';
import { byId } from '../data/places.js';
import { openDetail } from '../hooks/useHashRouter.js';
import { bg } from '../lib/format.js';
import { isOpenNow } from '../lib/hours.js';
import { PlaceMeta } from './PlaceMeta.jsx';

// Map view of Explore: Leaflet + OpenStreetMap tiles (no API key). Leaflet is loaded on demand,
// so it is its own build file (cached by the service worker like the rest of the app).
// The tiles come from openstreetmap.org: offline they can't load, then a message points back to the list.
const PIN = {food:'🍴', museums:'🖼️', parks:'🌳', nightlife:'🌙', sights:'🏛️'};
const pinFor = p => PIN[p.cats[0]] || '📍';
const CENTER = [52.515, 13.40];

export function PlaceMap({ places, sel, onSelect, onShowList }) {
  const box = useRef(null), m = useRef({});   // m.current = {L, map, layer, tiles, markers}
  const [status, setStatus] = useState(navigator.onLine ? 'loading' : 'offline');   // loading | ok | offline | failed

  // create the map once
  useEffect(() => {
    let dead = false, loaded = 0, errors = 0;
    Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(([mod]) => {
      if (dead) return;
      const L = mod.default || mod;
      const map = L.map(box.current, {center: CENTER, zoom: 12, zoomControl: true, tap: false});
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      }).addTo(map);
      tiles.on('tileload', () => { loaded++; setStatus(s => s === 'loading' ? 'ok' : s); });   // offline: cached tiles don't hide the message
      tiles.on('tileerror', () => { errors++; if (!loaded && errors >= 3) setStatus('offline'); });
      map.on('click', () => onSelect(''));
      // the map box can change size after the map is made (filters above it, fonts, rotation): keep Leaflet in sync
      const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => map.invalidateSize({animate: false, pan: false})) : null;
      if (ro) ro.observe(box.current);
      m.current = {L, map, tiles, ro, layer: L.layerGroup().addTo(map), markers: {}};
      latest.current();
    }).catch(() => { if (!dead) setStatus('failed'); });   // Leaflet itself could not be loaded (offline, never cached)
    const online = () => { const t = m.current.tiles; if (t) { loaded = errors = 0; setStatus('loading'); t.redraw(); } };
    const offline = () => setStatus('offline');
    window.addEventListener('online', online); window.addEventListener('offline', offline);
    return () => { dead = true; window.removeEventListener('online', online); window.removeEventListener('offline', offline); if (m.current.ro) m.current.ro.disconnect(); if (m.current.map) { m.current.map.stop(); m.current.map.remove(); } m.current = {}; };
  }, []);

  // pins for the filtered places; the map zooms to fit them
  function draw() {
    const {L, map, layer} = m.current;
    if (!map) return;
    layer.clearLayers(); m.current.markers = {};
    const pts = places.filter(p => COORDS[p.id]);
    pts.forEach(p => {
      const icon = L.divIcon({className: 'ex-pin', html: `<span><i>${pinFor(p)}</i></span>`, iconSize: [34, 34], iconAnchor: [17, 41]});
      const mk = L.marker(COORDS[p.id], {icon, title: p.name, alt: p.name, keyboard: true, riseOnHover: true})
        .on('click', () => onSelect(p.id)).addTo(layer);
      m.current.markers[p.id] = mk;
    });
    if (pts.length === 1) map.setView(COORDS[pts[0].id], 14, {animate: false});
    else if (pts.length) map.fitBounds(pts.map(p => COORDS[p.id]), {padding: [36, 36], maxZoom: 15, animate: false});   // no animation: the screen may unmount mid-zoom
    mark();
  }
  function mark() {
    Object.entries(m.current.markers || {}).forEach(([id, mk]) => {
      const el = mk.getElement(); if (el) el.classList.toggle('on', id === sel);
      mk.setZIndexOffset(id === sel ? 1000 : 0);
    });
  }
  const latest = useRef(draw); latest.current = draw;   // the map loads async: draw with the newest places
  const key = places.map(p => p.id).join();
  useEffect(draw, [key]);
  const card = useRef(null);
  useEffect(() => { mark(); if (card.current) card.current.scrollIntoView({block: 'nearest'}); }, [sel]);   // keep the preview above the tab bar

  const p = sel && byId(sel);
  return (
    <div className="map-wrap" id="exMap">
      <div className="ex-map" ref={box} role="region" aria-label="Map of the filtered places"></div>
      {(status === 'offline' || status === 'failed') && (
        <div className="map-msg" role="status">
          <b>🗺️ The map can't load right now</b>
          <p>{status === 'failed' ? 'Check your connection and try again.' : 'Map tiles need an internet connection.'} The list still works.</p>
          <button className="pill" onClick={onShowList}>Show list</button>
        </div>
      )}
      {p && (
        <div className="map-card" ref={card} role="dialog" aria-label={p.name}>
          <div className="thumb" style={{background: bg(p)}}></div>
          <div className="mc-body">
            <b>{p.name}</b>
            <PlaceMeta p={p} open={isOpenNow(p)} />
            {p.rating ? <small className="rating">{'★ ' + p.rating}</small> : <small className="muted">{`${p.area} · ${p.km} km`}</small>}
            <button className="pill" onClick={() => openDetail(p.id)}>View details</button>
          </div>
          <button className="mc-x" aria-label="Close preview" onClick={() => onSelect('')}>×</button>
        </div>
      )}
    </div>
  );
}
