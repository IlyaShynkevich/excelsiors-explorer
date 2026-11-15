import { Component, Suspense, useEffect, useLayoutEffect } from 'react';
import { ui, useStore, toast, closeSheet, sheetOpen } from './state/appStore.js';
import { user } from './state/userData.js';
import { useHashRouter, TABS } from './hooks/useHashRouter.js';
import { navPlay, motionReady } from './lib/motion.js';
import { TabBar } from './components/TabBar.jsx';
import { Toast } from './components/Toast.jsx';
import { BottomSheet } from './components/BottomSheet.jsx';
import { PullToRefresh } from './components/PullToRefresh.jsx';
import { OfflineBanner } from './components/OfflineBanner.jsx';
import { Login } from './screens/Login.jsx';
import { SignUp } from './screens/SignUp.jsx';
import { Home } from './screens/Home.jsx';
import { Explore } from './screens/Explore.jsx';
import { PlaceDetail } from './screens/PlaceDetail.jsx';
import { Saved } from './screens/Saved.jsx';
import { Profile } from './screens/Profile.jsx';
import { Interests } from './screens/Interests.jsx';
import { ScreenSkeleton } from './components/Skeleton.jsx';
import { lazyScreen } from './lib/lazyScreen.js';
import { initLocation } from './state/location.js';

// Screens that are not needed for Login and Home are their own build files (loaded on first use, preloaded
// when the browser is idle). While one loads, ScreenSkeleton shows. New screens: add them here the same way.
const EditProfile = lazyScreen(() => import('./screens/EditProfile.jsx'), 'EditProfile');
const Achievements = lazyScreen(() => import('./screens/Achievements.jsx'), 'Achievements');
const Book = lazyScreen(() => import('./screens/Book.jsx'), 'Book');
const Meetups = lazyScreen(() => import('./screens/Meetups.jsx'), 'Meetups');
const MeetupDetail = lazyScreen(() => import('./screens/MeetupDetail.jsx'), 'MeetupDetail');
const MeetupChat = lazyScreen(() => import('./screens/MeetupChat.jsx'), 'MeetupChat');
const Trip = lazyScreen(() => import('./screens/Trip.jsx'), 'Trip');
const TripItem = lazyScreen(() => import('./screens/Trip.jsx'), 'TripItem');
const Reminders = lazyScreen(() => import('./screens/Reminders.jsx'), 'Reminders');
const Location = lazyScreen(() => import('./screens/Location.jsx'), 'Location');
const LAZY = [EditProfile, Achievements, Book, Meetups, MeetupDetail, MeetupChat, Trip, Reminders, Location];
// the chat keeps its newest message in view (same as MeetupChat.jsx scrollChat; that file loads lazily)
const scrollChat = () => { const s = document.getElementById('chatMsgs'); if (s) s.scrollTop = s.scrollHeight; };

// A lazy screen whose file can't be loaded (offline before it was ever cached): a message instead of a blank app
class ScreenError extends Component {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="screen active">
        <div className="appbar">Excelsior Explorer</div>
        <div className="scroll"><div className="empty">
          <b>This screen can't load right now</b>
          <p>Check your connection and try again.</p>
          <button className="pill" onClick={() => location.reload()}>Try again</button>
        </div></div>
      </section>
    );
  }
}

const SCREENS = {
  interests: Interests,
  login: Login, signup: SignUp, home: Home, explore: Explore, detail: PlaceDetail, saved: Saved, profile: Profile,
  editProfile: EditProfile, achievements: Achievements, book: Book, meetups: Meetups, meetup: MeetupDetail, chat: MeetupChat,
  trip: Trip, tripItem: TripItem, reminders: Reminders, location: Location,
};

export function App() {
  useStore();
  useHashRouter();
  // screen transition: the new screen is in the DOM now, before the browser paints
  useLayoutEffect(() => navPlay(TABS.includes(ui.current)), [ui.navSeq]);
  useLayoutEffect(() => {   // dark mode: body class + browser bar colour
    document.body.classList.toggle('dark', user.dark);
    document.querySelector('meta[name=theme-color]').content = user.dark ? '#121614' : '#0b7a2b';
  }, [user.dark]);
  useEffect(() => {
    const setOnline = () => document.body.classList.toggle('is-offline', !navigator.onLine);
    const online = () => { setOnline(); toast('Back online'); };
    const keys = e => { if (e.key === 'Escape' && sheetOpen()) closeSheet(); };
    window.addEventListener('online', online);
    window.addEventListener('offline', setOnline);
    document.addEventListener('keydown', keys);
    setOnline();
    motionReady();   // screen transitions from now on (not on the first screen after a reload)
    // fetch the lazy screens once the first screen has loaded and the browser is idle, so later screens open at once
    const idle = window.requestIdleCallback || (f => setTimeout(f, 1));
    const preload = () => idle(() => LAZY.forEach(s => s.preload()), {timeout: 4000});
    if (document.readyState === 'complete') preload(); else window.addEventListener('load', preload, {once: true});
    initLocation();  // real location: only continues if it was on and the browser still allows it
    // Keyboard: Android resizes the page (interactive-widget=resizes-content); iOS only shrinks the
    // visual viewport, so there the chat is pinned to the visible area and the input stays above the keyboard.
    const vv = window.visualViewport;
    const onVV = () => {
      const open = window.innerHeight - vv.height * vv.scale > 80;
      document.body.classList.toggle('kb-open', open);
      document.body.style.setProperty('--vvh', vv.height + 'px');
      document.body.style.setProperty('--vvt', vv.offsetTop + 'px');
      if (ui.current === 'chat') scrollChat();
    };
    if (vv) { vv.addEventListener('resize', onVV); vv.addEventListener('scroll', onVV); }
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', setOnline);
      document.removeEventListener('keydown', keys);
      if (vv) { vv.removeEventListener('resize', onVV); vv.removeEventListener('scroll', onVV); }
    };
  }, []);
  const Screen = SCREENS[ui.current];
  return (<>
    <div id="app">
      {/* a new key on every navigation: the screen starts fresh (scrolled to the top), like before */}
      <ScreenError key={ui.navSeq}><Suspense fallback={<ScreenSkeleton />}><Screen /></Suspense></ScreenError>
      <TabBar current={ui.current} />
      {/* copy of the previous screen while it animates out (filled by lib/motion.js, never by React) */}
      <div id="navfx" aria-hidden="true"></div>
    </div>
    <Toast toast={ui.toast} />
    <PullToRefresh />
    <OfflineBanner />
    <BottomSheet sheet={ui.sheet} />
  </>);
}
