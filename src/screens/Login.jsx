import logo from '../assets/logo.webp';
import { ui, emit } from '../state/appStore.js';
import { getUser, signIn } from '../state/userData.js';
import { go, enterApp } from '../hooks/useHashRouter.js';
import { DemoBanner } from '../components/DetailParts.jsx';

export function Login() {
  const f = ui.login, u = getUser();
  const set = k => e => { f[k] = e.target.value; f.err = ''; emit(); };
  const submit = e => {
    e.preventDefault();
    const email = f.email.trim().toLowerCase(), pw = f.pw;
    const msg = !/\S+@\S+\.\S+/.test(email) ? 'Please enter a valid email address.' : !pw ? 'Please enter your password.' : signIn(email, pw);
    f.err = msg;
    if (msg) return emit();
    f.pw = '';
    enterApp();
  };
  return (
    <section className="screen active" id="login">
      <div className="scroll">
        <DemoBanner />
        {/* the logo has no name in it: the app name follows as live text */}
        <img className="logo" src={logo} width="88" height="88" alt="Excelsiors Explorer logo" />
        <h1 className="brand">Excelsiors Explorer</h1>
        <p className="tag">Booking App with Travel Guidance</p>
        <form id="loginForm" noValidate onSubmit={submit}>
          <label htmlFor="email">Email</label>
          <input className="field" id="email" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set('email')} />
          <label htmlFor="pw">Password</label>
          <input className="field" id="pw" type="password" autoComplete="current-password" value={f.pw} onChange={set('pw')} />
          <div className="err" id="loginErr" role="alert" style={f.err ? {display: 'block'} : undefined}>{f.err || 'Please enter a valid email and password.'}</div>
          <button className="btn" type="submit">Sign In</button>
        </form>
        <p className="alt">No account? <button type="button" onClick={() => go('signup')}>Create account</button></p>
        <p className="demo" id="loginDemo">Demo: any email and password work.</p>
      </div>
    </section>
  );
}
