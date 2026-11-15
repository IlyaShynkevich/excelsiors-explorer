// Toast below the top bar and large title; an optional action button (e.g. "Saved" → View)
export const Toast = ({ toast }) => (
  <div className={'toast' + (toast.show ? ' show' : '') + (toast.action ? ' has-act' : '')} id="toast" role="status">
    {toast.msg}{toast.action && <button className="toast-act" onClick={toast.action.onClick}>{toast.action.label}</button>}
  </div>
);
