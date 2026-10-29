import { useLayoutEffect, useRef } from 'react';
import { ui, emit, toast } from '../state/appStore.js';
import { signUp } from '../state/userData.js';
import { go } from '../hooks/useHashRouter.js';
import { useFieldMessages, checkName, checkEmail, checkPw } from '../hooks/useFieldMessages.js';
import { FieldMsg } from '../components/FieldMsg.jsx';
import { AppBar } from '../components/AppBar.jsx';

export function SignUp() {
  const f = ui.signup, fm = useFieldMessages(), refs = useRef({});
  const pwHint = pw => {
    const n = pw.length;
    if (fm.isBad('suPw')) return;
    if (n >= 8) fm.setMsg('suPw', '✓ Good length', 'ok');
    else fm.setMsg('suPw', n ? `${8 - n} more character${8 - n === 1 ? '' : 's'} needed` : 'At least 8 characters', '');
  };
  useLayoutEffect(() => { fm.setMsg('suName', ''); fm.setMsg('suEmail', ''); fm.setMsg('suPw', ''); pwHint(f.pw); }, []);
  const input = (id, key, check, hint) => {
    const w = fm.wire(id, check, hint);
    return {className: 'field', id, ref: el => refs.current[id] = el, 'aria-describedby': id + 'Msg', 'aria-invalid': fm.invalid(id),
            value: f[key], onBlur: w.onBlur, onChange: e => { f[key] = e.target.value; emit(); w.onInput(e); }};
  };
  const submit = e => {
    e.preventDefault();
    const name = f.name.trim(), email = f.email.trim().toLowerCase(), pw = f.pw;
    const errs = [['suName', checkName(name)], ['suEmail', checkEmail(email)], ['suPw', checkPw(pw)]];
    errs.forEach(([id, m]) => fm.setMsg(id, m)); pwHint(pw);
    const bad = errs.find(([, m]) => m);
    if (bad) return refs.current[bad[0]].focus();
    const err = signUp({name, email, pw});
    if (err) { fm.setMsg('suEmail', err); return refs.current.suEmail.focus(); }
    ui.signup = {name: '', email: '', pw: '', show: false};
    go('home', {replace:true});
    toast(`Welcome, ${name}! 🎉 Personalise your profile any time.`);
  };
  const eye = () => { f.show = !f.show; emit(); };
  return (
    <section className="screen active" id="signup">
      <AppBar back="login">Excelsior Explorer</AppBar>
      <div className="scroll">
        <form id="signupForm" className="form" noValidate onSubmit={submit}>
          <h1 className="ltitle">Create Account</h1>
          <p className="hint">Save places, collect badges and join meetups in Berlin.</p>
          <label htmlFor="suName">Name</label>
          <input {...input('suName', 'name', checkName)} autoComplete="name" maxLength={30} enterKeyHint="next" />
          <FieldMsg id="suName" m={fm.msg('suName')} />
          <label htmlFor="suEmail">Email</label>
          <input {...input('suEmail', 'email', checkEmail)} type="email" autoComplete="email" inputMode="email" enterKeyHint="next" />
          <FieldMsg id="suEmail" m={fm.msg('suEmail')} />
          <label htmlFor="suPw">Password</label>
          <div className="pw-wrap">
            <input {...input('suPw', 'pw', checkPw, pwHint)} type={f.show ? 'text' : 'password'} autoComplete="new-password" enterKeyHint="go" />
            <button type="button" className="pw-eye" id="suPwEye" aria-label={f.show ? 'Hide password' : 'Show password'} aria-pressed={f.show}
                    onPointerDown={e => e.preventDefault()} onClick={eye}>{f.show ? 'Hide' : 'Show'}</button>
          </div>
          <FieldMsg id="suPw" m={fm.msg('suPw')} />
          <button className="btn" type="submit">Create Account</button>
        </form>
        <p className="alt">Already have an account? <a onClick={() => go('login')}>Sign In</a></p>
        <p className="demo">Demo: your account is only stored in this browser. Please don't use a real password.</p>
      </div>
    </section>
  );
}
