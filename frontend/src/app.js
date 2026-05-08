import { apiRequest } from "./api.js";
import { layout } from "./components.js";
import {
  authPage,
  dashboardPage,
  feedPage,
  profilePage,
  reportPage,
  solarPage
} from "./pages.js";
import { clearSession, setSession, state } from "./state.js";
import { escapeHtml, routeName } from "./utils.js";

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

const protectedRoutes = new Set(["/dashboard", "/report", "/solar", "/profile"]);

async function boot() {
  if (!window.location.hash) {
    window.location.hash = state.token ? "#/dashboard" : "#/login";
  }

  if (state.token) {
    try {
      const payload = await apiRequest("/api/auth/me");
      state.user = payload.user;
    } catch (error) {
      clearSession();
    }
  }

  window.addEventListener("hashchange", render);
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  await render();
}

async function render() {
  const route = routeName();

  if (protectedRoutes.has(route) && !state.user) {
    window.location.hash = "#/login";
    return;
  }

  app.className = "";
  app.innerHTML = layout(route, await currentPage(route));
  window.lucide?.createIcons();
}

async function currentPage(route) {
  if (route === "/register") {
    return authPage("register");
  }
  if (route === "/login") {
    return authPage("login");
  }
  if (route === "/feed") {
    return feedPage();
  }
  if (route === "/report") {
    return reportPage();
  }
  if (route === "/solar") {
    return solarPage();
  }
  if (route === "/profile") {
    return profilePage();
  }
  return dashboardPage();
}

async function handleSubmit(event) {
  const form = event.target.closest("form[data-action]");
  if (!form) {
    return;
  }

  event.preventDefault();
  const action = form.dataset.action;
  const data = Object.fromEntries(new FormData(form).entries());
  const button = form.querySelector("button[type='submit']");
  setBusy(button, true);

  try {
    if (action === "login") {
      const session = await apiRequest("/api/auth/login", {
        method: "POST",
        body: data,
        auth: false
      });
      setSession(session);
      notify("Logged in successfully.");
      window.location.hash = "#/dashboard";
    }

    if (action === "register") {
      const session = await apiRequest("/api/auth/register", {
        method: "POST",
        body: data,
        auth: false
      });
      setSession(session);
      notify("Account created.");
      window.location.hash = "#/dashboard";
    }

    if (action === "create-report") {
      await apiRequest("/api/outages", {
        method: "POST",
        body: data
      });
      notify("Outage report submitted.");
      window.location.hash = "#/feed";
    }

    if (action === "calculate-solar") {
      const payload = await apiRequest("/api/solar/calculate", {
        method: "POST",
        body: data
      });
      state.lastSolarEstimate = payload.estimate;
      notify("Solar estimate saved.");
      await render();
    }

    if (action === "filter-feed") {
      const params = new URLSearchParams();
      ["district", "type", "status"].forEach((key) => {
        if (data[key]) {
          params.set(key, data[key]);
        }
      });
      window.location.hash = `#/feed${params.toString() ? `?${params.toString()}` : ""}`;
    }
  } catch (error) {
    notify(formatError(error), "error");
  } finally {
    setBusy(button, false);
  }
}

async function handleClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  if (button.dataset.action === "logout") {
    clearSession();
    notify("Logged out.");
    window.location.hash = "#/login";
  }
}

async function handleChange(event) {
  const control = event.target.closest("[data-action='moderate-report']");
  if (!control) {
    return;
  }

  try {
    await apiRequest(`/api/outages/${control.dataset.id}/status`, {
      method: "PATCH",
      body: {
        status: control.value
      }
    });
    notify("Report status updated.");
    await render();
  } catch (error) {
    notify(formatError(error), "error");
  }
}

function formatError(error) {
  if (Array.isArray(error.details)) {
    return `${error.message} ${error.details.join(" ")}`;
  }
  return error.message || "Something went wrong.";
}

function notify(message, tone = "success") {
  toast.innerHTML = `<div class="toast ${tone}">${escapeHtml(message)}</div>`;
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => {
    toast.innerHTML = "";
  }, 3600);
}

function setBusy(button, busy) {
  if (!button) {
    return;
  }

  button.disabled = busy;
  button.dataset.originalText = button.dataset.originalText || button.innerHTML;
  button.innerHTML = busy ? "Working..." : button.dataset.originalText;
  if (!busy) {
    window.lucide?.createIcons();
  }
}

boot();
