// Horizontally scrolling filter chips; options = [[key, label], …]
// value = the selected key, or an array of keys for multi-select (each chip toggles, aria-pressed).
// wrap = chips flow onto several lines instead of scrolling.
export function FilterChips({ options, value, onChange, id = 'mtChips', label, wrap, children }) {
  const multi = Array.isArray(value);
  return (
    <div className={'chips' + (wrap ? ' wrap' : '')} id={id} role={label ? 'group' : undefined} aria-label={label}>
      {children}
      {options.map(([k, l]) => {
        const on = multi ? value.includes(k) : value === k;
        return <button type="button" key={k} className={on ? 'on' : ''} aria-pressed={multi ? on : undefined} onClick={() => onChange(k)}>{l}</button>;
      })}
    </div>
  );
}
