import { Trophy, Users, Bookmark, MapPin, Navigation, Settings as SettingsIcon, Info, BellRing, CalendarPlus, RotateCcw, Award } from 'lucide-react';
import { getProfile, myBadges } from '../state/userData.js';
import { upcomingMeetups, joinedM } from '../state/meetups.js';
import { remindersOn, remindersDemo, toggleRemindersDemo } from '../state/reminders.js';
import { resetProgress } from '../state/achievements.js';
import { here, setDemoSpot } from '../state/location.js';
import { ui } from '../state/appStore.js';
import { byId } from '../data/places.js';
import { user } from '../state/userData.js';
import { demoDays, appToday, nextDemoDay, resetDemoDate } from '../state/clock.js';
import { go, openMeetups } from '../hooks/useHashRouter.js';
import { BADGES } from '../data/badges.js';
import { niceDate } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';
import { AvatarImg } from '../components/Avatar.jsx';
import { Details } from '../components/DetailParts.jsx';
import { Group, Row, SwitchRow } from '../components/RowList.jsx';

// Profile – one job: me and my settings. Avatar, name, city, one short list; the demo tools collapsed at the end.
export function Profile() {
  const p = getProfile(), nj = upcomingMeetups().filter(m => joinedM(m)).length;
  const last = byId(ui.recent[0]);   // the place opened last in this session ("Put me here" moved from the place page)
  return (
    <section className="screen active" id="profile">
      <AppBar title="Profile"><button className="ab-text" id="pfEdit" onClick={() => go('editProfile')}>Edit</button></AppBar>
      <div className="scroll">
        <h1 className="ltitle">Profile</h1>
        <button className="pf-head" onClick={() => go('editProfile')} aria-label="Edit profile">
          <span className="pf-av" id="pfAv"><AvatarImg id={p.avatar} /></span>
          <span className="pf-id"><b className="uname">{p.name}</b><small id="pfCity">{p.city}</small></span>
        </button>
        <Group id="pfList">
          <Row icon={Trophy} label="Achievements" value={`${myBadges().length} / ${BADGES.length}`} id="pfAch" onClick={() => go('achievements')} />
          <Row icon={Users} label="Meetups" value={nj ? `${nj} joined` : ''} id="pfMeetups" onClick={() => openMeetups('')} />
          <Row icon={Bookmark} label="Saved" value={user.saved.length || ''} id="pfSaved" onClick={() => go('saved')} />
          <Row icon={MapPin} label="Where am I?" value={here().name} id="pfLoc" onClick={() => go('location')} />
        </Group>
        <Group>
          <Row icon={SettingsIcon} label="Settings" id="pfSettings" onClick={() => go('settings')} />
          <Row icon={Info} label="About this demo" id="pfAbout" onClick={() => go('about')} />
        </Group>
        <Details label="Demo tools" id="demoTools">
          <Group>
            <SwitchRow icon={BellRing} label="Show reminders now" id="remDemoBtn" on={remindersDemo()} disabled={!remindersOn()} onClick={toggleRemindersDemo} />
            <Row icon={CalendarPlus} label="Simulate next day" value={niceDate(appToday())} id="nextDay" onClick={nextDemoDay} />
            <Row icon={RotateCcw} label="Reset demo date" value={demoDays() ? `+${demoDays()} d` : 'Today'} id="resetDay" disabled={!demoDays()} onClick={resetDemoDate} />
            <Row icon={MapPin} label="Demo location" value={here().real ? 'Real' : here().name} onClick={() => go('location')} />
            {last && <Row icon={Navigation} label="Put me at" value={last.name} id="putMeAt" onClick={() => setDemoSpot(last.id)} />}
            <Row icon={Award} label="Reset badges" id="resetAch" onClick={resetProgress} />
          </Group>
        </Details>
      </div>
    </section>
  );
}
