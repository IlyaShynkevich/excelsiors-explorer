import { fmtEur } from '../lib/format.js';
import { Tag } from './Tag.jsx';

// "Compare providers": the same flight or room from several (fictional, demo) providers, cheapest first.
// offers = sorted offers; kind 'flight' | 'hotel' decides the terms shown; onPick(offer, isCheapest).
// limit = show only the n cheapest, with "Compare all N providers" for the rest (expanded / onExpand).
// The "Save €X" line is the app's core value and always stays visible.
const terms = (o, kind) => kind === 'flight'
  ? [o.bag ? 'Bag included' : 'Cabin bag only', o.free ? 'Free cancellation' : 'Non‑refundable']
  : [o.breakfast ? 'Breakfast' : 'Room only', o.free ? 'Free cancellation' : 'Non‑refundable'];

export function ProviderList({ offers, kind, onPick, limit = 3, expanded, onExpand, title = 'Compare providers' }) {
  if (!offers.length) return null;
  const save = offers[offers.length - 1].total - offers[0].total;
  const shown = limit && !expanded ? offers.slice(0, limit) : offers;
  return (
    <div className="pv-list">
      <div className="pv-head">
        <b>{title}</b>
        {offers.length > 1 && save >= 0.01 && <span className="save">{`Save ${fmtEur(save)}`}</span>}
      </div>
      {shown.map((o, i) => (
        <button type="button" className={'prov' + (i === 0 ? ' best' : '')} key={o.id} data-provider={o.id} onClick={() => onPick(o, i === 0)}>
          <span className="pv-ic" aria-hidden="true">{o.name[0]}</span>
          <span className="pv-nm"><b>{o.name}</b>{i === 0 && <Tag>Cheapest</Tag>}
            <small>{terms(o, kind).join(' · ')}</small></span>
          <span className="pv-pr"><b>{fmtEur(o.total)}</b><small>{kind === 'hotel' ? `${fmtEur(o.rate)} / night` : 'total'}</small></span>
        </button>
      ))}
      {limit && offers.length > limit && (
        <button type="button" className="link-btn pv-more" onClick={onExpand}>{expanded ? 'Show fewer' : `Compare all ${offers.length} providers`}</button>
      )}
    </div>
  );
}
