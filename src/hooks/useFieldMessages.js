import { useReducer, useRef } from 'react';

// Inline validation: a message under the field (kind 'bad' = error, 'ok' = success, '' = neutral hint),
// shown in <FieldMsg> (#<id>Msg) and mirrored in the field's aria-invalid.
export function useFieldMessages() {
  const msgs = useRef({});
  const [, rerender] = useReducer(n => n + 1, 0);
  const setMsg = (id, msg, kind = 'bad') => { msgs.current = {...msgs.current, [id]: {msg, kind}}; rerender(); };
  const isBad = id => { const m = msgs.current[id]; return !!(m && m.msg && m.kind === 'bad'); };
  const msg = id => msgs.current[id] || {msg: '', kind: ''};
  const invalid = id => msgs.current[id] ? String(isBad(id)) : undefined;
  // Errors appear when leaving a filled field or on submit, and disappear as soon as the value is fixed.
  const val = el => el.type === 'password' ? el.value : el.value.trim();
  const wire = (id, check, hint) => ({
    onBlur: e => { const v = val(e.target); if (v) setMsg(id, check(v)); if (!isBad(id) && hint) hint(e.target.value); },
    onInput: e => { if (isBad(id)) setMsg(id, check(val(e.target))); if (!isBad(id) && hint) hint(e.target.value); },
  });
  return {setMsg, isBad, msg, invalid, wire};
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const checkName = v => v.length >= 2 ? '' : v ? 'Your name needs at least 2 characters.' : 'Please tell us your name.';
export const checkEmail = v => !v ? 'Please enter your email address.' : EMAIL_RE.test(v) ? '' : 'That doesn\'t look like an email address yet, e.g. name@example.com';
export const checkPw = v => v.length >= 8 ? '' : !v ? 'Please choose a password.' : `Almost there: the password needs ${8 - v.length} more character${8 - v.length === 1 ? '' : 's'}.`;
export const checkCity = v => !v || v.length >= 2 ? '' : 'Please enter the full city name.';
