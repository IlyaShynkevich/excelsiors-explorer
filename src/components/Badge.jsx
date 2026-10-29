// Round badge icon; locked badges are grey with a lock
export function Badge({ b, earned, cls = '' }) {
  return (
    <div className="badge-wrap">
      <div className={`badge ${earned ? '' : 'locked'} ${cls}`} style={{background: `linear-gradient(145deg,${b.c[0]},${b.c[1]})`}}>{b.icon}</div>
      {!earned && <span className="lock">🔒</span>}
    </div>
  );
}
