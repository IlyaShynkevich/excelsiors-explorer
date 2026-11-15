// Loading placeholders (grey blocks with the photo shimmer, styles/screens.css .skel + motion.css).
// The same shapes are in index.html (#boot), shown before the app's JavaScript has run.

// A list of card placeholders (n rows: photo-less card with two text lines)
export const SkelCards = ({ n = 3 }) => (
  <div className="sk-cards" aria-hidden="true">{Array.from({length: n}, (_, i) =>
    <div className="skel sk-card" key={i}><span className="skel sk-line" /><span className="skel sk-line short" /></div>)}</div>
);

// A whole screen while its code is loading (lazy screens, App.jsx)
export function ScreenSkeleton() {
  return (
    <section className="screen active sk-screen" aria-busy="true" aria-label="Loading">
      <div className="appbar"></div>
      <div className="scroll">
        <div className="skel sk-title" />
        <SkelCards />
      </div>
    </section>
  );
}
