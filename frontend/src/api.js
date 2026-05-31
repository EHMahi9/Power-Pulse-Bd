import { clearSession, state } from "./state.js";

const API_BASE = "https://power-pulse-bd.onrender.com";

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (state.token && options.auth !== false) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    const error = new Error(payload?.error?.message || "Request failed.");
    error.details = payload?.error?.details || null;
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function getMetrics() {
  return apiRequest("/api/metrics", { auth: Boolean(state.token) });
}

export function getOutages(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const suffix = params.toString() ? `?${params.toString()}` : "";

  return apiRequest(`/api/outages${suffix}`, { auth: false });
}