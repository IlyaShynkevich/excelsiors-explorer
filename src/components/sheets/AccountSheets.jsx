import { closeSheet, toast, ui } from '../../state/appStore.js';
import { getUser, deleteUser } from '../../state/userData.js';
import { stopRide } from '../../state/booking.js';
import { go } from '../../hooks/useHashRouter.js';

function deleteAccount() {
  stopRide(); deleteUser(); ui.typing = {}; closeSheet(true);
  ui.login.email = ''; ui.login.pw = '';
  go('login', {replace:true}); toast('Your account was deleted');
}

const REST = " saved in this browser will be removed: your profile, saved places, badges, bookings, meetups and chats. This can't be undone.";

export function DeleteAccountSheet() {
  const u = getUser();
  return (<>
    <div className="big-emoji">⚠️</div>
    <h3>Delete your account?</h3>
    <p>{u ? <>The account <b>{u.email}</b>{' and everything' + REST}</> : 'Everything' + REST}</p>
    <button className="btn danger" id="delConfirm" onClick={deleteAccount}>Delete Account</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Cancel</button>
  </>);
}
