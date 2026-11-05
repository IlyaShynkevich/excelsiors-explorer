import { useEffect, useRef, useState } from 'react';
import { closeSheet, sheetClosed } from '../state/appStore.js';
import { motionMs } from '../lib/motion.js';
import { UnlockSheet, BadgeSheet, CompareSheet } from './sheets/BadgeSheets.jsx';
import { FlightConfirmSheet, FlightDoneSheet, HotelConfirmSheet, HotelDoneSheet, TaxiScheduledSheet } from './sheets/BookingSheets.jsx';
import { CreateMeetupSheet, CancelMeetupSheet } from './sheets/MeetupSheets.jsx';
import { DeleteAccountSheet } from './sheets/AccountSheets.jsx';
import { ChangeBookingSheet, CancelBookingSheet, DirectionsSheet } from './sheets/TripSheets.jsx';
import { ArrivalSheet } from './sheets/ArrivalSheet.jsx';

const SHEETS = {
  unlock: UnlockSheet, badge: BadgeSheet, compare: CompareSheet,
  flight: FlightConfirmSheet, flightDone: FlightDoneSheet, hotel: HotelConfirmSheet, hotelDone: HotelDoneSheet, taxiScheduled: TaxiScheduledSheet,
  createMeetup: CreateMeetupSheet, cancelMeetup: CancelMeetupSheet, deleteAccount: DeleteAccountSheet,
  changeBooking: ChangeBookingSheet, cancelBooking: CancelBookingSheet, directions: DirectionsSheet, arrival: ArrivalSheet,
};

// Bottom sheet over a dimmed background; tap the background (or press Escape, see App) to close.
// The content gets a new key on every openSheet(), like replacing its HTML.
// After closeSheet() the last sheet stays on screen while it slides out (.closing), then it is unmounted.
export function BottomSheet({ sheet }) {
  const last = useRef(null);                  // the last opened sheet: its content is shown while closing
  if (sheet.open) last.current = sheet;
  const [doneId, setDoneId] = useState(-1);   // id of the sheet whose slide-out has finished
  const closing = !sheet.open && !!last.current && last.current.id === sheet.id && doneId !== sheet.id;
  const s = sheet.open || closing ? last.current : null, Content = s && SHEETS[s.kind];
  const done = () => { if (doneId === sheet.id) return; setDoneId(sheet.id); sheetClosed(); };   // slid out: the unlock queue may continue
  useEffect(() => { if (closing) { const t = setTimeout(done, motionMs('sheet-out') + 150); return () => clearTimeout(t); } }, [closing, sheet.id]);   // fallback
  return (
    <div className={'sheet-bg' + (s ? ' show' : '') + (closing ? ' closing' : '')} id="sheet"
         onClick={e => { if (!closing && e.target === e.currentTarget) closeSheet(); }}>
      <div className="sheet" id="sheetBody" onAnimationEnd={e => { if (closing && e.target === e.currentTarget) done(); }}>
        {Content && <div className="sheet-in" key={s.id}><Content {...s.props} /></div>}
      </div>
    </div>
  );
}
