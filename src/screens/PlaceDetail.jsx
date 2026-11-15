import { Bookmark, BookmarkCheck, Navigation, CarTaxiFront, Users, MapPin, Clock, Ticket, Utensils, ExternalLink } from 'lucide-react';
import { ui, closeSheet, openSheet } from '../state/appStore.js';
import { user } from '../state/userData.js';
import { toggleSave } from '../state/achievements.js';
import { distLabel, isAt } from '../state/location.js';
import { HereAction } from '../components/HereAction.jsx';
import { upcomingMeetups } from '../state/meetups.js';
import { go, goBack, openBooking, openMeetups, TABS } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { Photo } from '../components/Photo.jsx';
import { isOpenNow } from '../lib/hours.js';
import { AppBar } from '../components/AppBar.jsx';
import { DietTags } from '../components/PlaceMeta.jsx';
import { RoundActions, Clamp, Details, InfoRow } from '../components/DetailParts.jsx';

// Place page – one job: decide and act. Photo, name, one meta line, About (2 lines + More), one primary button
// (I'm here / Directions), one row of round actions; everything else in the collapsed "Details".
export function PlaceDetail() {
  const p = byId(ui.detailId);
  const back = () => goBack(() => go(TABS.includes(ui.prev) ? ui.prev : 'explore'));
  return (
    <section className="screen active" id="detail">
      <AppBar overlay onBack={back} title={p && p.name} watch=".hero" />
      <div className="scroll" id="detailBody">{p && <Body p={p} />}</div>
    </section>
  );
}

function Body({ p }) {
  const isSaved = user.saved.includes(p.id), open = isOpenNow(p), at = isAt(p.id);
  const n = upcomingMeetups().filter(m => m.placeId === p.id).length;
  // wiki: "Title" (English Wikipedia), "de:Title" (German) or '' (no article)
  const [lang, title] = p.wiki.startsWith('de:') ? ['de', p.wiki.slice(3)] : ['en', p.wiki];
  const wiki = title && `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g,'_'))}`;
  const directions = () => openSheet('directions', {to: p.id, name: p.name});
  return (<>
    <Photo className="hero" size="hero" priority p={p} />
    <div className="detail">
      <h1 className="d-title">{p.name}</h1>
      <p className="d-meta" id="detailKm">{`${p.area} · ${distLabel(p.id)} · `}<span className={'oc ' + (open ? 'is-open' : 'is-closed')}>{open ? 'Open now' : 'Closed'}</span></p>
      <Clamp lines={2}>{p.about.map((t, i) => <p key={i}>{t}</p>)}</Clamp>
      <div className="d-primary"><HereAction spot={p.id} name={p.name} note={false} /></div>
      <RoundActions items={[
        {icon: isSaved ? BookmarkCheck : Bookmark, label: isSaved ? 'Saved' : 'Save', on: isSaved, id: 'saveBtn', onClick: () => toggleSave(p.id)},
        at && {icon: Navigation, label: 'Directions', id: 'dirBtn', onClick: directions},
        {icon: CarTaxiFront, label: 'Taxi', onClick: () => { closeSheet(); openBooking('taxi', p.id); }},
        {icon: Users, label: n ? `Meetups (${n})` : 'Meetups', onClick: () => openMeetups(p.id)},
      ]} />
      <Details id="placeDetails">
        <InfoRow icon={MapPin}>{p.addr}</InfoRow>
        <InfoRow icon={Clock}>{p.hours}</InfoRow>
        <InfoRow icon={Ticket}>{p.fee}</InfoRow>
        {p.diet.length > 0 && <InfoRow icon={Utensils}><DietTags p={p} /></InfoRow>}
        {wiki && <a className="wiki" href={wiki} target="_blank" rel="noopener">{lang === 'de' ? 'Wikipedia (German)' : 'Wikipedia'}<ExternalLink size={14} aria-hidden="true" /></a>}
        <p className="note">Opening hours, prices and dietary tags can change; check with the venue. Photo: Wikimedia Commons (free licence).</p>
      </Details>
    </div>
  </>);
}
