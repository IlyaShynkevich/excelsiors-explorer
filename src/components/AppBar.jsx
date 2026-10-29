import { go, goBack } from '../hooks/useHashRouter.js';

// Compact frosted top bar. `back` = screen to go to when there is no app history to go back to.
export function AppBar({ back, children }) {
  return <div className="appbar">{back && <BackButton to={back} />}{children}</div>;
}
export function BackButton({ to, onClick, ...rest }) {
  const click = onClick || (() => goBack(typeof to === 'function' ? to : () => go(to)));
  return <button className="back" aria-label="Back" onClick={click} {...rest}>‹</button>;
}
