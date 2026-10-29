import { useRef, useState } from 'react';
import { closeSheet } from '../../state/appStore.js';
import { cancelMeetup, createMeetup } from '../../state/meetups.js';
import { PLACES } from '../../data/places.js';
import { ymd } from '../../lib/format.js';
import { Stepper } from '../Stepper.jsx';

export function CancelMeetupSheet({ m }) {
  return (<>
    <div className="big-emoji">🗑️</div>
    <h3>Cancel this meetup?</h3>
    <p>{`“${m.title}” and its group chat will be removed.`}</p>
    <button className="btn" id="mtDel" style={{background: 'var(--danger)'}} onClick={() => cancelMeetup(m)}>Cancel meetup</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Keep it</button>
  </>);
}

export function CreateMeetupSheet({ pre }) {
  const [v, setV] = useState(() => ({title:'', where:pre, date:ymd(new Date(Date.now() + 864e5)), time:'18:00', note:''}));
  const [max, setMax] = useState(6);
  const [bad, setBad] = useState('');                       // id of the field marked as wrong
  const [err, setErr] = useState({msg: '', show: false});
  const refs = useRef({});
  const field = id => ({
    id, ref: el => refs.current[id] = el,
    className: 'field' + (bad === id ? ' bad' : ''),
    onChange: e => { const k = id.slice(2).toLowerCase(); setV(s => ({...s, [k]: e.target.value})); if (bad === id) setBad(''); setErr(x => ({...x, show: false})); },
  });
  const fail = (id, msg) => { setBad(id); if (refs.current[id]) refs.current[id].focus(); setErr({msg, show: true}); };
  const create = () => {
    const title = v.title.trim(), note = v.note.trim(), {date, time} = v;
    const start = date && time ? new Date(date + 'T' + time).getTime() : NaN;
    if (title.length < 3) return fail('mtTitle', 'Give your meetup a title (at least 3 characters).');
    if (!date) return fail('mtDate', 'Please pick a date.');
    if (!time || isNaN(start)) return fail('mtTime', 'Please pick a start time.');
    if (start < Date.now() + 5 * 6e4) return fail('mtTime', 'That time has already passed – pick a time in the future.');
    if (start > Date.now() + 365 * 864e5) return fail('mtDate', 'Please pick a date within the next year.');
    if (max < 2 || max > 20) return fail('mtMax', 'Max people must be between 2 and 20.');
    createMeetup({title, placeId: v.where, start, max, note});
  };
  return (<>
    <h3>New meetup</h3>
    <p>Plan an activity and meet other travelers.</p>
    <div className="fgroup"><label htmlFor="mtTitle">Title</label><input {...field('mtTitle')} maxLength={40} placeholder="e.g. Sunset walk by the Spree" autoComplete="off" value={v.title} /></div>
    <div className="fgroup"><label htmlFor="mtWhere">Place</label><select {...field('mtWhere')} value={v.where}>{PLACES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    <div className="row2">
      <div className="fgroup"><label htmlFor="mtDate">Date</label><input {...field('mtDate')} type="date" value={v.date} min={ymd(new Date())} /></div>
      <div className="fgroup"><label htmlFor="mtTime">Time</label><input {...field('mtTime')} type="time" value={v.time} step="300" /></div>
    </div>
    <div className="fgroup"><label>Max people</label>
      <Stepper value={max} onMinus={() => setMax(n => Math.max(2, n - 1))} onPlus={() => setMax(n => Math.min(20, n + 1))}
               ids={['mtMinus', 'mtMax', 'mtPlus']} labels={['Fewer', 'More']} /></div>
    <div className="fgroup"><label htmlFor="mtNote">Short note</label><textarea {...field('mtNote')} maxLength={160} rows={3} placeholder="What's the plan? Where exactly do you meet?" value={v.note}></textarea></div>
    <div className="err" id="mtErr" style={err.show ? {display: 'block'} : undefined}>{err.msg}</div>
    <button className="btn" id="mtCreate" onClick={create}>Create meetup</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Cancel</button>
    <p className="demo">Demo: the meetup is only saved on this device.</p>
  </>);
}
