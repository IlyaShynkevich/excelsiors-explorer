// Horizontally scrolling filter chips; options = [[key, label], …]
export function FilterChips({ options, value, onChange }) {
  return (
    <div className="chips" id="mtChips">
      {options.map(([k, l]) => <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  );
}
