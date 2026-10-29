import { ui, emit, toast, openSheet } from '../state/appStore.js';
import { user, persist, getProfile, getUser, getSession, clearSession, isEarned, myBadges } from '../state/userData.js';
import { leaderboard } from '../state/achievements.js';
import { upcomingMeetups, joinedM } from '../state/meetups.js';
import { go, openDetail, openMeetups } from '../hooks/useHashRouter.js';
import { BADGES, FRIENDS } from '../data/badges.js';
import { byId } from '../data/places.js';
import { bg, niceDate } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';
import { AvatarImg } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';

const RECENT_DEST = [['reichstag','Visited 2 weeks ago'],['tvtower','Visited 1 month ago'],['eastside','Visited 2 months ago']];

export function Profile() {
  const p = getProfile(), mine = myBadges();
  const order = [...BADGES.filter(b => isEarned(b.id)), ...BADGES.filter(b => !isEarned(b.id))];
  const rank = leaderboard().findIndex(r => r.me) + 1;
  const nj = upcomingMeetups().filter(m => joinedM(m)).length;
  const u = getUser() && getUser().email === getSession() ? getUser() : null;   // a demo login can happen while an account exists
  const notInPrototype = what => toast(what + ' (not in prototype)');
  const toggleDark = () => { user.dark = !user.dark; persist(); emit(); };
  const toggleLang = () => { ui.lang = ui.lang === 'English' ? 'Deutsch' : 'English'; emit(); toast('Language: ' + ui.lang + ' (demo)'); };
  const logout = () => { clearSession(); ui.login.pw = ''; go('login', {replace:true}); toast('Logged out'); };
  return (
    <section className="screen active" id="profile">
      <AppBar>Excelsior Explorer</AppBar>
      <div className="scroll">
        <h1 className="ltitle">Profile</h1>
        <div className="pf-head">
          <div className="pf-av" id="pfAv"><AvatarImg id={p.avatar} /></div>
          <h2 className="uname">{p.name}</h2>
          <small id="pfCity">{p.city ? '🏠 ' + p.city : ''}</small>
          <p className="pf-bio" id="pfBio">{p.bio}</p>
          <button className="pill ghost pf-edit" onClick={() => go('editProfile')}>Edit Profile</button>
        </div>
        <button className="ach-card" onClick={() => go('achievements')}>
          <div className="top"><b>🏅 Achievements</b><span id="achCount">{`${mine.length} / ${BADGES.length}`}</span></div>
          <div className="bar"><i id="achBar" style={{width: (mine.length / BADGES.length * 100) + '%'}}></i></div>
          <div className="mini-badges" id="miniBadges">{order.slice(0, 7).map(b => <Badge key={b.id} b={b} earned={isEarned(b.id)} />)}</div>
          <div className="rank" id="achRank">{`#${rank} among ${FRIENDS.length + 1} friends · tap to see all badges`}</div>
        </button>
        <div className="list mt-entry">
          <button onClick={() => openMeetups('')}><span className="ico">👥</span>Travel Meetups<span className="muted" id="pfMeetups">{nj ? `${nj} joined` : ''}</span></button>
        </div>
        <h3 className="sec">Profile Settings</h3>
        <div className="list">
          <button onClick={() => go('editProfile')}><span className="ico">◉</span>Personal Information</button>
          <button onClick={() => notInPrototype('Notifications')}><span className="ico">{'🔔︎'}</span>Notifications</button>
          <button onClick={() => notInPrototype('Wishlist')}><span className="ico">♡</span>Wishlist</button>
          <button onClick={() => go('saved')}><span className="ico">➤</span>Saved Locations</button>
        </div>
        <h3 className="sec">Recent Destinations</h3>
        <div className="hscroll" id="recentProfile">
          {RECENT_DEST.map(([id, when]) => { const pl = byId(id); return (
            <button className="rp-item" key={id} onClick={() => openDetail(id)}>
              <div className="tile" style={{background: bg(pl, true)}}>{pl.name}</div>
              <small>{when}</small>
            </button>); })}
        </div>
        <h3 className="sec">Account Settings</h3>
        <div className="settings">
          <button className="item" id="langBtn" onClick={toggleLang}><span className="l"><span className="ico">◍</span>Language</span><span className="muted" id="langVal">{ui.lang + ' ›'}</span></button>
          <button className="item" id="darkBtn" onClick={toggleDark}><span className="l"><span className="ico">☾</span>Dark Mode</span><span className={'switch' + (user.dark ? ' on' : '')} id="darkSwitch"></span></button>
          <button className="item" id="logoutBtn" onClick={logout}><span className="l"><span className="ico">➜</span>Log Out</span></button>
          <button className="item" id="deleteBtn" onClick={() => openSheet('deleteAccount')}><span className="l"><span className="ico">✕</span>Delete Account</span></button>
        </div>
        <p className="hint pf-acct" id="pfAcct">{u ? `Signed in as ${u.email}${u.created ? ' · member since ' + niceDate(u.created) : ''}`
                                                    : `Demo login as ${getSession()} · log out to create an account`}</p>
        <button className="btn pf-home" onClick={() => go('home')}>Return to Home</button>
      </div>
    </section>
  );
}
