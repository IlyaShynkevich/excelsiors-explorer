import { useLayoutEffect, useRef, useState } from 'react';
import { toast } from '../state/appStore.js';
import { getProfile, saveProfile } from '../state/userData.js';
import { go, canGoBack } from '../hooks/useHashRouter.js';
import { useFieldMessages, checkName, checkCity } from '../hooks/useFieldMessages.js';
import { AVATARS } from '../data/avatars.js';
import { CITIES } from '../data/booking.js';
import { AppBar } from '../components/AppBar.jsx';
import { AvatarImg } from '../components/Avatar.jsx';
import { FieldMsg } from '../components/FieldMsg.jsx';

export function EditProfile() {
  const [v, setV] = useState(getProfile);   // the form starts from the saved profile every time the screen opens
  const fm = useFieldMessages(), refs = useRef({}), avBtns = useRef({});
  useLayoutEffect(() => { ['epName','epBio','epCity'].forEach(id => fm.setMsg(id, '')); }, []);
  const field = (id, key, check) => {
    const w = check ? fm.wire(id, check) : {};
    return {className: 'field', id, ref: el => refs.current[id] = el, 'aria-describedby': id + 'Msg', 'aria-invalid': fm.invalid(id),
            value: v[key], onBlur: w.onBlur, onChange: e => { const x = e.target.value; setV(s => ({...s, [key]: x})); if (w.onInput) w.onInput(e); }};
  };
  const pickAvatar = id => { setV(s => ({...s, avatar: id})); avBtns.current[id].focus(); };
  const avKeys = e => {   // radio group: arrow keys move the choice
    const d = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1}[e.key]; if (!d) return;
    e.preventDefault();
    const i = AVATARS.findIndex(a => a.id === v.avatar);
    pickAvatar(AVATARS[(i + d + AVATARS.length) % AVATARS.length].id);
  };
  const submit = e => {
    e.preventDefault();
    const name = v.name.trim(), bio = v.bio.trim(), city = v.city.trim();
    const errs = [['epName', checkName(name)], ['epBio', bio.length > 140 ? 'Please keep your bio to 140 characters.' : ''], ['epCity', checkCity(city)]];
    errs.forEach(([id, m]) => fm.setMsg(id, m));
    const bad = errs.find(([, m]) => m);
    if (bad) return refs.current[bad[0]].focus();
    saveProfile({name, bio, city, avatar: v.avatar});
    toast('Profile saved');
    if (canGoBack()) history.back(); else go('profile', {replace:true});
  };
  const n = v.bio.length;
  return (
    <section className="screen active" id="editProfile">
      <AppBar back="profile">Edit Profile</AppBar>
      <div className="scroll">
        <form id="editForm" className="form" noValidate onSubmit={submit}>
          <div className="pf-av ep-av" id="epPreview"><AvatarImg id={v.avatar} /></div>
          <label id="epAvLabel">Avatar</label>
          <div className="av-pick" id="epAvatars" role="radiogroup" aria-labelledby="epAvLabel" onKeyDown={avKeys}>
            {AVATARS.map(a => (
              <button type="button" role="radio" key={a.id} data-av={a.id} aria-label={a.label} ref={el => avBtns.current[a.id] = el}
                      aria-checked={a.id === v.avatar} tabIndex={a.id === v.avatar ? 0 : -1} onClick={() => pickAvatar(a.id)}><AvatarImg id={a.id} /></button>
            ))}
          </div>
          <label htmlFor="epName">Display name</label>
          <input {...field('epName', 'name', checkName)} autoComplete="nickname" maxLength={30} />
          <FieldMsg id="epName" m={fm.msg('epName')} />
          <label htmlFor="epBio">Short bio <span className={'cnt' + (n >= 140 ? ' max' : '')} id="epBioCnt">{`${n} / 140`}</span></label>
          <textarea {...field('epBio', 'bio')} maxLength={140} rows={3} placeholder="A few words about you and how you like to travel"></textarea>
          <FieldMsg id="epBio" m={fm.msg('epBio')} />
          <label htmlFor="epCity">Home city</label>
          <input {...field('epCity', 'city', checkCity)} list="epCities" maxLength={40} placeholder="Where are you from?" autoComplete="address-level2" />
          <datalist id="epCities">{['Berlin', ...CITIES.map(c => c[1])].map(c => <option key={c} value={c} />)}</datalist>
          <FieldMsg id="epCity" m={fm.msg('epCity')} />
          <button className="btn" type="submit">Save Changes</button>
        </form>
        <p className="demo">Demo: your profile is only stored in this browser.</p>
      </div>
    </section>
  );
}
