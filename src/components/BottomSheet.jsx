import { closeSheet } from '../state/appStore.js';
import { UnlockSheet, BadgeSheet, CompareSheet } from './sheets/BadgeSheets.jsx';
import { FlightConfirmSheet, FlightDoneSheet, TaxiScheduledSheet } from './sheets/BookingSheets.jsx';
import { CreateMeetupSheet, CancelMeetupSheet } from './sheets/MeetupSheets.jsx';
import { DeleteAccountSheet } from './sheets/AccountSheets.jsx';

const SHEETS = {
  unlock: UnlockSheet, badge: BadgeSheet, compare: CompareSheet,
  flight: FlightConfirmSheet, flightDone: FlightDoneSheet, taxiScheduled: TaxiScheduledSheet,
  createMeetup: CreateMeetupSheet, cancelMeetup: CancelMeetupSheet, deleteAccount: DeleteAccountSheet,
};

// Bottom sheet over a dimmed background; tap the background (or press Escape, see App) to close.
// The content gets a new key on every openSheet(), like replacing its HTML.
export function BottomSheet({ sheet }) {
  const Content = SHEETS[sheet.kind];
  return (
    <div className={'sheet-bg' + (sheet.open ? ' show' : '')} id="sheet" onClick={e => { if (e.target === e.currentTarget) closeSheet(); }}>
      <div className="sheet" id="sheetBody">{sheet.open && Content && <Content key={sheet.id} {...sheet.props} />}</div>
    </div>
  );
}
