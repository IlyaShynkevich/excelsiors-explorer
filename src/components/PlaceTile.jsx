import { bg } from '../lib/format.js';
import { openDetail } from '../hooks/useHashRouter.js';

// Photo tile with the place name (home grid and "Recently Viewed")
export const PlaceTile = ({ p }) => <button className="tile" style={{background: bg(p, true)}} onClick={() => openDetail(p.id)}>{p.name}</button>;
