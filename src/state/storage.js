// The only code that touches localStorage / sessionStorage. Screens never use these directly:
// they go through the user data functions in userData.js, which can be swapped for a real backend later.
export const DATA_KEY = 'ee_berlin', SESSION_KEY = 'ee_session', LAST_KEY = 'ee_last';

export const store = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  del: k => { try { localStorage.removeItem(k); } catch (e) {} },
};

// The last visited route of this tab (sessionStorage)
export const lastRoute = {
  set: h => { try { sessionStorage.setItem(LAST_KEY, h); } catch (e) {} },
  clear: () => { try { sessionStorage.removeItem(LAST_KEY); } catch (e) {} },
};
