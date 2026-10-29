import logo from '../assets/logo.png';
import { ui, emit } from '../state/appStore.js';
import { getUser, signIn } from '../state/userData.js';
import { go } from '../hooks/useHashRouter.js';

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
    go('home', {replace:true});
  };
  return (
    <section className="screen active" id="login">
      <div className="scroll">
        <img className="logo" src={logo} alt="Excelsiors Explorer logo" />
        <h1 className="brand">Excelsior Explorer</h1>
        <p className="tag">Booking App with Travel Guidance</p>
        <form id="loginForm" noValidate onSubmit={submit}>
          <label htmlFor="email">Email</label>
          <input className="field" id="email" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set('email')} />
          <label htmlFor="pw">Password</label>
          <input className="field" id="pw" type="password" autoComplete="current-password" value={f.pw} onChange={set('pw')} />
          <div className="err" id="loginErr" role="alert" style={f.err ? {display: 'block'} : undefined}>{f.err || 'Please enter a valid email and password.'}</div>
          <button className="btn" type="submit">Sign In</button>
        </form>
        <p className="alt">No account? <a onClick={() => go('signup')}>Create account</a></p>
        <p className="demo" id="loginDemo">{u ? 'Demo: sign in with the account created in this browser, or with any other email and password.'
                                              : 'Demo: sign in with any email and password, or create an account.'}</p>
      </div>
    </section>
  );
}
