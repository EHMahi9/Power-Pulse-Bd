import { apiRequest, getMetrics, getOutages } from "./api.js";
import { state } from "./state.js";
import {
  emptyState,
  inlineStat,
  metricTile,
  pageHeader,
  reportTable,
  solarResultCard,
  statusBadge
} from "./components.js";
import {
  districts,
  escapeHtml,
  formatDate,
  formatNumber,
  hashQuery,
  icon,
  statusLabel,
  typeLabel
} from "./utils.js";

export async function authPage(mode) {
  const metrics = await getMetrics();
  const isRegister = mode === "register";
  const recentReports = metrics.recentReports || [];

  return `
    ${pageHeader(
      isRegister ? "Create Account" : "Enter Dashboard",
      "Community outage reporting with solar backup planning",
      `<a class="button secondary" href="#/${isRegister ? "login" : "register"}">
        ${icon(isRegister ? "LogIn" : "UserPlus")}
        ${isRegister ? "Login" : "Register"}
      </a>`
    )}
    <section class="auth-grid">
      <form class="panel form-panel" data-action="${isRegister ? "register" : "login"}">
        <h2>${isRegister ? "Register" : "Login"}</h2>
        ${
          isRegister
            ? `
              <label>
                Name
                <input name="name" autocomplete="name" required minlength="2" />
              </label>
            `
            : ""
        }
        <label>
          Email
          <input name="email" type="email" autocomplete="email" required value="${
            isRegister ? "" : "demo@powerpulse.bd"
          }" />
        </label>
        <label>
          Password
          <input name="password" type="password" autocomplete="${
            isRegister ? "new-password" : "current-password"
          }" required value="${isRegister ? "" : "Demo@12345"}" />
        </label>
        <button class="button primary" type="submit">
          ${icon(isRegister ? "UserPlus" : "LogIn")}
          ${isRegister ? "Create account" : "Login"}
        </button>
      </form>
      <section class="panel public-snapshot">
        <div class="snapshot-map">
          <img src="/assets/bd-grid-map.svg" alt="Simplified Bangladesh regional outage diagram" />
        </div>
        <div class="metric-grid compact">
          ${inlineStat("Reports", String(metrics.totals.reports), "Community submissions", "blue")}
          ${inlineStat("Last 24h", String(metrics.totals.reportsLast24h), "Fresh grid signals", "amber")}
          ${inlineStat("Active areas", String(metrics.totals.activeAreas), "Unresolved reports", "red")}
        </div>
      </section>
    </section>
    <section class="panel">
      <div class="section-title">
        <h2>Recent community feed</h2>
        <a href="#/feed">Open feed</a>
      </div>
      ${reportTable(recentReports.slice(0, 5))}
    </section>
  `;
}

export async function dashboardPage() {
  const metrics = await getMetrics();
  const latestSolar = metrics.user?.latestSolarEstimate || state.lastSolarEstimate;
  const topDistricts = metrics.topDistricts || [];

  return `
    ${pageHeader(
      "Dashboard",
      "Live course project workspace",
      `<a class="button primary" href="#/report">${icon("CircleAlert")}Report outage</a>`
    )}
    <section class="metric-grid">
      ${metricTile("Total reports", String(metrics.totals.reports), "All community entries", "Database", "blue")}
      ${metricTile("Last 24h", String(metrics.totals.reportsLast24h), "Fresh reports", "Clock3", "amber")}
      ${metricTile("Active areas", String(metrics.totals.activeAreas), "Unresolved districts", "MapPin", "red")}
      ${metricTile("My reports", String(metrics.user?.reports || 0), "Your submissions", "UserRoundCheck", "green")}
    </section>
    <section class="dashboard-grid">
      <section class="panel coverage-panel">
        <div class="section-title">
          <h2>Bangladesh coverage</h2>
          <span>${formatNumber(metrics.totals.verifiedReports)} verified</span>
        </div>
        <img src="/assets/bd-grid-map.svg" alt="Simplified Bangladesh outage coverage diagram" />
      </section>
      <section class="panel">
        <div class="section-title">
          <h2>Top active districts</h2>
          <a href="#/feed">Details</a>
        </div>
        ${
          topDistricts.length
            ? topDistricts
                .map((item) => {
                  const level = Math.min(10, Math.max(1, Math.ceil(item.count * 2)));
                  return `
                    <div class="district-row">
                      <span>${escapeHtml(item.district)}</span>
                      <strong>${item.count}</strong>
                      <i class="bar-level-${level}"></i>
                    </div>
                  `;
                })
                .join("")
            : emptyState("No active district data.")
        }
      </section>
    </section>
    <section class="dashboard-grid">
      <section class="panel">
        <div class="section-title">
          <h2>Recent outage feed</h2>
          <a href="#/feed">Open feed</a>
        </div>
        ${reportTable(metrics.recentReports || [])}
      </section>
      ${solarResultCard(latestSolar)}
    </section>
  `;
}

export async function feedPage() {
  const query = hashQuery();
  const payload = await getOutages(query);
  const reports = payload.reports || [];

  return `
    ${pageHeader("Community Feed", "Recent Bangladesh electricity reports")}
    <form class="panel filter-bar" data-action="filter-feed">
      <label>
        District
        <input name="district" value="${escapeHtml(query.district || "")}" placeholder="Example: Sylhet" />
      </label>
      <label>
        Type
        <select name="type">
          ${option("", "All types", query.type)}
          ${option("loadshedding", "Loadshedding", query.type)}
          ${option("maintenance", "Maintenance", query.type)}
          ${option("power_on", "Power on", query.type)}
        </select>
      </label>
      <label>
        Status
        <select name="status">
          ${option("", "All statuses", query.status)}
          ${option("pending", "Pending", query.status)}
          ${option("verified", "Verified", query.status)}
          ${option("resolved", "Resolved", query.status)}
          ${option("dismissed", "Dismissed", query.status)}
        </select>
      </label>
      <button class="button secondary" type="submit">${icon("Search")}Filter</button>
    </form>
    <section class="panel">
      <div class="section-title">
        <h2>${reports.length} reports</h2>
        <a href="#/report">Submit new</a>
      </div>
      ${reportTable(reports)}
    </section>
  `;
}

export function reportPage() {
  return `
    ${pageHeader("Report Outage", "Submit a local electricity update")}
    <form class="panel form-grid" data-action="create-report">
      <label>
        District
        <select name="district" required>
          <option value="">Select district</option>
          ${districts.map((district) => `<option value="${escapeHtml(district)}">${escapeHtml(district)}</option>`).join("")}
        </select>
      </label>
      <label>
        Area or upazila
        <input name="area" required minlength="2" maxlength="90" placeholder="Example: Kapasia" />
      </label>
      <label>
        Type
        <select name="outageType" required>
          <option value="loadshedding">Loadshedding</option>
          <option value="maintenance">Maintenance</option>
          <option value="power_on">Power restored</option>
        </select>
      </label>
      <label>
        Started at
        <input name="startedAt" type="datetime-local" required />
      </label>
      <label>
        Duration hours
        <input name="durationHours" type="number" min="0" max="48" step="0.25" value="1" required />
      </label>
      <label>
        Severity
        <select name="severity" required>
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </label>
      <label class="wide">
        Notes
        <textarea name="note" maxlength="400" placeholder="Short local context"></textarea>
      </label>
      <div class="form-actions wide">
        <button class="button primary" type="submit">${icon("Send")}Submit report</button>
        <a class="button secondary" href="#/feed">${icon("RadioTower")}View feed</a>
      </div>
    </form>
  `;
}

export async function solarPage() {
  const estimatesPayload = await apiRequest("/api/solar/estimates");
  const estimates = estimatesPayload.estimates || [];
  const latest = state.lastSolarEstimate || estimates[0] || null;

  return `
    ${pageHeader("Solar Backup Estimator", "OOP calculation engine")}
    <section class="solar-grid">
      <form class="panel form-grid" data-action="calculate-solar">
        <label>
          Battery voltage
          <input name="batteryVoltage" type="number" min="6" max="96" value="12" required />
        </label>
        <label>
          Battery Ah
          <input name="batteryAh" type="number" min="10" max="500" value="120" required />
        </label>
        <label>
          Battery health %
          <input name="batteryHealthPercent" type="number" min="20" max="100" value="85" required />
        </label>
        <label>
          Depth of discharge %
          <input name="depthOfDischargePercent" type="number" min="30" max="90" value="70" required />
        </label>
        <label>
          Inverter efficiency %
          <input name="inverterEfficiencyPercent" type="number" min="50" max="98" value="88" required />
        </label>
        <label>
          Panel watts
          <input name="panelWatts" type="number" min="0" max="10000" value="200" required />
        </label>
        <label>
          Sunlight hours
          <input name="sunlightHours" type="number" min="0" max="12" step="0.25" value="5" required />
        </label>
        <label>
          Fans
          <input name="fanCount" type="number" min="0" max="20" value="2" required />
        </label>
        <label>
          LED lights
          <input name="lightCount" type="number" min="0" max="50" value="4" required />
        </label>
        <label>
          Routers
          <input name="routerCount" type="number" min="0" max="10" value="1" required />
        </label>
        <label>
          Laptops
          <input name="laptopCount" type="number" min="0" max="10" value="1" required />
        </label>
        <label>
          Phone chargers
          <input name="phoneCount" type="number" min="0" max="20" value="2" required />
        </label>
        <label>
          Custom watts
          <input name="customLoadWatts" type="number" min="0" max="5000" value="0" required />
        </label>
        <div class="form-actions wide">
          <button class="button primary" type="submit">${icon("Calculator")}Calculate backup</button>
        </div>
      </form>
      <div id="solar-result-slot">
        ${solarResultCard(latest)}
      </div>
    </section>
    <section class="panel">
      <div class="section-title">
        <h2>Saved estimates</h2>
        <span>${estimates.length} records</span>
      </div>
      ${
        estimates.length
          ? `<div class="estimate-list">
              ${estimates
                .slice(0, 6)
                .map(
                  (estimate) => `
                    <article>
                      <strong>${formatNumber(estimate.result.estimatedBackupHours, " hours")}</strong>
                      <span>${statusBadge(estimate.result.status)} ${formatDate(estimate.createdAt)}</span>
                    </article>
                  `
                )
                .join("")}
            </div>`
          : emptyState("No saved estimates yet.")
      }
    </section>
  `;
}

export async function profilePage() {
  const [outagePayload, estimatesPayload] = await Promise.all([
    getOutages(),
    apiRequest("/api/solar/estimates")
  ]);
  const reports = outagePayload.reports || [];
  const myReports = reports.filter((report) => report.userId === state.user.id);
  const estimates = estimatesPayload.estimates || [];
  const adminReports = state.user.role === "admin" ? reports : [];

  return `
    ${pageHeader("Profile", "Account, history, and moderation")}
    <section class="metric-grid">
      ${metricTile("Role", state.user.role, state.user.email, "ShieldCheck", "blue")}
      ${metricTile("My reports", String(myReports.length), "Outage submissions", "CircleAlert", "amber")}
      ${metricTile("Solar records", String(estimates.length), "Saved calculations", "Sun", "green")}
    </section>
    <section class="panel">
      <div class="section-title">
        <h2>My outage reports</h2>
        <a href="#/report">New report</a>
      </div>
      ${reportTable(myReports)}
    </section>
    ${
      state.user.role === "admin"
        ? `
          <section class="panel">
            <div class="section-title">
              <h2>Admin moderation</h2>
              <span>${adminReports.length} total reports</span>
            </div>
            ${reportTable(adminReports, { admin: true })}
          </section>
        `
        : ""
    }
  `;
}

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(
    label
  )}</option>`;
}
