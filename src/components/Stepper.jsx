// − value + control. ids/labels keep the same element ids as before (paxMinus, mtMax …).
export function Stepper({ value, onMinus, onPlus, ids = [], labels = [] }) {
  return (
    <div className="stepper">
      <button id={ids[0]} aria-label={labels[0]} onClick={onMinus}>−</button>
      <b id={ids[1]}>{value}</b>
      <button id={ids[2]} aria-label={labels[1]} onClick={onPlus}>+</button>
    </div>
  );
}
