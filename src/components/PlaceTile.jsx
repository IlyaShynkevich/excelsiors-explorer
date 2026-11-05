import { Photo } from './Photo.jsx';
import { openDetail } from '../hooks/useHashRouter.js';

// Photo tile with the place name (home grid and "Recently Viewed")
export const PlaceTile = ({ p }) => <Photo as="button" className="tile" p={p} shade onClick={() => openDetail(p.id)}>{p.name}</Photo>;
