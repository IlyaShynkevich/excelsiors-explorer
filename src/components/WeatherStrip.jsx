import { useEffect } from 'react';
import { weather, loadWeather, isRainy } from '../state/weather.js';
import { wmo } from '../data/weather.js';
import { go } from '../hooks/useHashRouter.js';
import { CloudRain } from 'lucide-react';
import { wxIcon } from './Icons.jsx';
import { Tag } from './Tag.jsx';

const dayName = (iso, i) => i === 0 ? 'Today' : new Date(iso + 'T12:00').toLocaleDateString('en-GB', {weekday: 'short'});

// 5-day Berlin forecast (Home). Live from Open-Meteo, or a labelled demo forecast as fallback.
export function WeatherStrip() {
  useEffect(() => { loadWeather(); }, []);
  const {status, days} = weather;
  const rainy = days.findIndex(isRainy);
  return (
    <div className="wx" id="weather">
      <div className="wx-head">
        <h2 className="sec">Berlin weather</h2>
        {status === 'live' && <small className="wx-src">Open-Meteo</small>}
        {status === 'demo' && <Tag tone="demo">Demo data</Tag>}
      </div>
      {/* loading: the same day boxes as skeletons (same height, so nothing moves when the forecast arrives) */}
      {!days.length ? <div className="wx-days loading" aria-busy="true" aria-label="Loading the forecast">{[0,1,2,3,4].map(i =>
          <div key={i} className="wx-day skel"><b>&nbsp;</b><span className="ico">&nbsp;</span><span className="t">&nbsp;</span><small>&nbsp;</small></div>)}</div> :
        <div className="wx-days" role="list" aria-label="5-day forecast">
          {days.map((d, i) => {
            const [, label] = wmo(d.code), Icon = wxIcon(d.code);
            return (
              <div className={'wx-day' + (isRainy(d) ? ' rainy' : '')} role="listitem" key={d.date}
                   aria-label={`${dayName(d.date, i)}: ${label}, high ${d.hi}°, low ${d.lo}°, ${d.rain}% chance of rain`}>
                <b>{dayName(d.date, i)}</b>
                <span className="ico" aria-hidden="true"><Icon size={22} /></span>
                <span className="t"><b>{d.hi}°</b> {d.lo}°</span>
                <small>{d.rain}% rain</small>
              </div>
            );
          })}
        </div>}
      {status === 'demo' && <p className="note wx-note">Live weather is unavailable right now, so this is a demo forecast.</p>}
      {rainy >= 0 && (
        <button className="wx-hint" id="rainHint" onClick={() => go('explore', {cats: ['museums']})}>
          <span aria-hidden="true"><CloudRain size={22} /></span>
          <span><b>Rainy: try indoor places</b><small>{rainy === 0 ? 'Rain is likely today' : `Rain is likely on ${dayName(days[rainy].date, rainy)}`} · see museums</small></span>
        </button>
      )}
    </div>
  );
}
