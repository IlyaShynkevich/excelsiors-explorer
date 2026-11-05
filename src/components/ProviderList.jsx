import { fmtEur } from '../lib/format.js';

// "Compare providers": the same flight or room from several (fictional, demo) providers, cheapest first.
// offers = sorted offers; kind 'flight' | 'hotel' decides the terms shown; onPick(offer, isCheapest).
// limit = show only the first n offers, with a button to show the rest (expanded / onExpand).
const terms = (o, kind) => kind === 'flight'
  ? [o.bag ? '🧳 Checked bag included' : 'Cabin bag only', o.free ? 'Free cancellation' : 'Non‑refundable']
  : [o.breakfast ? '🍳 Breakfast included' : 'Room only', o.free ? 'Free cancellation' : 'Non‑refundable'];

export function ProviderList({ offers, kind, onPick, limit, expanded, onExpand, title = 'Compare providers' }) {
  if (!offers.length) return null;
  const save = offers[offers.length - 1].total - offers[0].total;
  const shown = limit && !expanded ? offers.slice(0, limit) : offers;
  return (
    <div className="pv-list">
      <div className="pv-head">
        <b>{title}</b>
        {offers.length > 1 && save >= 0.01 && <span className="save">{`Save ${fmtEur(save)} vs the most expensive`}</span>}
      </div>
      {shown.map((o, i) => (
        <button type="button" className={'prov' + (i === 0 ? ' best' : '')} key={o.id} data-provider={o.id} onClick={() => onPick(o, i === 0)}>
          <span className="pv-ic" aria-hidden="true">{o.ic}</span>
          <span className="pv-nm"><b>{o.name}</b>{i === 0 && <span className="fl-badge">Cheapest</span>}
            <small>{terms(o, kind).join(' · ')}</small></span>
          <span className="pv-pr"><b>{fmtEur(o.total)}</b><small>{kind === 'hotel' ? `${fmtEur(o.rate)} / night` : 'total'}</small></span>
        </button>
      ))}
      {limit && offers.length > limit && (
        <button type="button" className="link-btn pv-more" onClick={onExpand}>{expanded ? 'Show fewer providers' : `Show all ${offers.length} providers`}</button>
      )}
    </div>
  );
}
