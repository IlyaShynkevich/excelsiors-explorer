// Message under a form field (see useFieldMessages)
export const FieldMsg = ({ id, m }) => <div className={'fmsg' + (m.msg && m.kind ? ' ' + m.kind : '')} id={id + 'Msg'} aria-live="polite">{m.msg}</div>;
