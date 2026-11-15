import { Photo } from './Photo.jsx';
import { openDetail } from '../hooks/useHashRouter.js';

// Photo tile with the place name (home grid and "Recently Viewed")
// sub = optional small line under the name (e.g. the distance on Home → Near you)
// priority = the screen's largest paint (Home: first "Near you" tile)
export const PlaceTile = ({ p, sub, priority }) => <Photo as="button" className="tile" size="tile" priority={priority} p={p} shade onClick={() => openDetail(p.id)}>
  {sub ? <span className="tile-tx">{p.name}<small>{sub}</small></span> : p.name}</Photo>;
