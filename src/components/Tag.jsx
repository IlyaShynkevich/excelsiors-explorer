// The one small tag (status, info): not tappable, one size, one radius (.tg in simple.css).
// tone: '' (green, default) | 'off' (grey) | 'plain' (grey, normal text) | 'warn' (orange) | 'demo' (amber) | 'photo' (dark, on a photo)
export const Tag = ({ tone = '', className = '', children, ...rest }) =>
  <span className={['tg', tone, className].filter(Boolean).join(' ')} {...rest}>{children}</span>;
