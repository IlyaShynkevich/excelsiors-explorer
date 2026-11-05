import { streak, todayPoints, totalPoints, hasHotel } from '../state/challenges.js';

// 🔥 streak counter (Home card, Achievements)
export const Streak = ({ n = streak(), big }) => (
  <span className={'streak' + (n ? ' on' : '') + (big ? ' big' : '')} aria-label={`Streak: ${n} day${n === 1 ? '' : 's'}`}>
    <span aria-hidden="true">🔥</span>{n}
  </span>
);

// Today's 3 quests with progress; compact = Home card
export function QuestList({ quests, compact }) {
  const done = quests.filter(q => q.done).length;
  return (<>
    <div className="q-prog">
      <div className="bar"><i style={{width: `${done / quests.length * 100}%`}}></i></div>
      <small>{`${done} / ${quests.length} done · ${todayPoints()} pts today · ${totalPoints()} pts total`}</small>
    </div>
    <div className={'q-list' + (compact ? ' compact' : '')}>{quests.map(q => (
      <div className={'q-item' + (q.done ? ' done' : '')} key={q.id} data-quest={q.id}>
        <span className="q-ic" aria-hidden="true">{q.done ? '✓' : q.icon}</span>
        <span className="q-nm"><b>{q.title}</b>
          {!compact && q.id === 'nearhotel' && !hasHotel() && <small>No hotel booked: counts from Alexanderplatz</small>}
          {q.t > 1 && !q.done && <small>{`${q.p} / ${q.t}`}</small>}</span>
        <span className="q-pts">{`+${q.pts}`}</span>
      </div>
    ))}</div>
  </>);
}
