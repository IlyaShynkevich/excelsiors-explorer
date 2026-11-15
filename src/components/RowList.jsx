import { ChevronRight } from 'lucide-react';

// Grouped list rows (iOS settings style): icon, label (≤ 3 words), value, chevron or switch.
export const Group = ({ children, id }) => <div className="group" id={id}>{children}</div>;

// A navigation row: onClick opens something (chevron)
export function Row({ icon: Icon, label, value, onClick, id, tone, disabled }) {
  return (
    <button className={'row-item' + (tone ? ' ' + tone : '')} id={id} onClick={onClick} disabled={disabled}>
      {Icon && <span className="ri-ic"><Icon size={18} aria-hidden="true" /></span>}
      <span className="ri-l">{label}</span>
      {value !== undefined && value !== '' && <span className="ri-v">{value}</span>}
      {!tone && <ChevronRight size={18} className="ri-chev" aria-hidden="true" />}
    </button>
  );
}

// A switch row (role="switch")
export function SwitchRow({ icon: Icon, label, on, onClick, id, disabled }) {
  return (
    <button className="row-item" id={id} role="switch" aria-checked={on} onClick={onClick} disabled={disabled}>
      {Icon && <span className="ri-ic"><Icon size={18} aria-hidden="true" /></span>}
      <span className="ri-l">{label}</span>
      <span className={'switch' + (on ? ' on' : '')} aria-hidden="true"></span>
    </button>
  );
}
