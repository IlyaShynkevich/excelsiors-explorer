// Stage 4 "Arrive": the simulated location. The demo picker offers these central Berlin spots
// (ids are taxi spots from COORDS: places, hotels 'ht-<id>' and Alexanderplatz).
export const DEMO_SPOTS = [
  ['alex', '🚉'], ['tvtower', '🗼'], ['ht-parkinn', '🏨'], ['hackesche', '🎭'], ['museuminsel', '🏛️'],
  ['ht-circus', '🛏️'], ['brandenburg', '🚪'], ['ht-adlon', '🏨'], ['checkpoint', '🚧'], ['eastside', '🎨'],
];
export const DEFAULT_SPOT = 'alex';      // a new browser starts at Alexanderplatz (the old "km from Alexanderplatz")
export const NEARBY_M = 300;             // "Nearby" tag on places this close
export const ARRIVE_M = 150;             // "I'm here" works within this distance
export const BERLIN_KM = 30;             // further than this from the centre: "you seem to be outside Berlin"
