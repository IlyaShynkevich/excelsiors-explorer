import { Bell, List, Moon, Languages, UserPen, LogOut, Trash2 } from 'lucide-react';
import { ui, emit, toast, openSheet } from '../state/appStore.js';
import { user, persist, getUser, getSession, clearSession } from '../state/userData.js';
import { remindersOn, toggleReminders } from '../state/reminders.js';
import { go } from '../hooks/useHashRouter.js';
import { niceDate } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';
import { Group, Row, SwitchRow } from '../components/RowList.jsx';

// Settings (Profile › Settings): reminders, appearance, language, account
export function Settings() {
  const u = getUser() && getUser().email === getSession() ? getUser() : null;   // a demo login can happen while an account exists
  const toggleDark = () => { user.dark = !user.dark; persist(); emit(); };
  const toggleLang = () => { ui.lang = ui.lang === 'English' ? 'Deutsch' : 'English'; emit(); toast('Language: ' + ui.lang + ' (demo)'); };
  const logout = () => { clearSession(); ui.login.pw = ''; go('login', {replace: true}); toast('Logged out'); };
  return (
    <section className="screen active" id="settings">
      <AppBar back="profile" title="Settings" />
      <div className="scroll">
        <h1 className="ltitle">Settings</h1>
        <Group>
          <SwitchRow icon={Bell} label="Trip reminders" id="remBtn" on={remindersOn()} onClick={toggleReminders} />
          <Row icon={List} label="Show reminders" id="remOpen" onClick={() => go('reminders')} />
        </Group>
        <p className="hint grp-hint">Flight 2 h, taxi 15 min, meetup 1 h, hotel 1 day before.</p>
        <Group>
          <SwitchRow icon={Moon} label="Dark mode" id="darkBtn" on={user.dark} onClick={toggleDark} />
          <Row icon={Languages} label="Language" value={ui.lang} id="langBtn" onClick={toggleLang} />
          <Row icon={UserPen} label="Edit profile" onClick={() => go('editProfile')} />
        </Group>
        <Group>
          <Row icon={LogOut} label="Log out" id="logoutBtn" tone="plain" onClick={logout} />
          <Row icon={Trash2} label="Delete account" id="deleteBtn" tone="danger" onClick={() => openSheet('deleteAccount')} />
        </Group>
        <p className="hint grp-hint" id="pfAcct">{u ? `${u.email}${u.created ? ' · since ' + niceDate(u.created) : ''}` : `Demo login: ${getSession()}`}</p>
      </div>
    </section>
  );
}
