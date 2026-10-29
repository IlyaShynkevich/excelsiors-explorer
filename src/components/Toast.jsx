export const Toast = ({ toast }) => <div className={'toast' + (toast.show ? ' show' : '')} id="toast">{toast.msg}</div>;
