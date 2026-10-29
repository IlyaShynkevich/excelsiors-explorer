import { useEffect, useLayoutEffect } from 'react';
import { ui, useStore, toast, closeSheet, sheetOpen } from './state/appStore.js';
import { user } from './state/userData.js';
import { useHashRouter } from './hooks/useHashRouter.js';
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
import { EditProfile } from './screens/EditProfile.jsx';
import { Achievements } from './screens/Achievements.jsx';
import { Book } from './screens/Book.jsx';
import { Meetups } from './screens/Meetups.jsx';
import { MeetupDetail } from './screens/MeetupDetail.jsx';
import { MeetupChat, scrollChat } from './screens/MeetupChat.jsx';

const SCREENS = {
  login: Login, signup: SignUp, home: Home, explore: Explore, detail: PlaceDetail, saved: Saved, profile: Profile,
  editProfile: EditProfile, achievements: Achievements, book: Book, meetups: Meetups, meetup: MeetupDetail, chat: MeetupChat,
};

export function App() {
  useStore();
  useHashRouter();
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
      <Screen key={ui.navSeq} />
      <TabBar current={ui.current} />
    </div>
    <Toast toast={ui.toast} />
    <PullToRefresh />
    <OfflineBanner />
    <BottomSheet sheet={ui.sheet} />
  </>);
}
