const TOKEN_KEY = "powerpulse_token";

export const state = {
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  lastSolarEstimate: null
};

export function setSession(session) {
  state.token = session.token;
  state.user = session.user;
  localStorage.setItem(TOKEN_KEY, session.token);
}

export function clearSession() {
  state.token = null;
  state.user = null;
  state.lastSolarEstimate = null;
  localStorage.removeItem(TOKEN_KEY);
}
