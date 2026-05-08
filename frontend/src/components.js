import { state } from "./state.js";
import { escapeHtml, formatDate, formatNumber, icon, statusLabel, typeLabel } from "./utils.js";

export function layout(activeRoute, content) {
  const signedIn = Boolean(state.user);
  const navItems = signedIn
    ? [
        ["/dashboard", "LayoutDashboard", "Dashboard"],
        ["/feed", "RadioTower", "Feed"],
        ["/report", "CircleAlert", "Report"],
        ["/solar", "Sun", "Solar"],
        ["/profile", "UserRound", "Profile"]
      ]
    : [
        ["/login", "LogIn", "Login"],
        ["/register", "UserPlus", "Register"],
        ["/feed", "RadioTower", "Public feed"]
      ];

  return `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#/dashboard" aria-label="PowerPulse BD dashboard">
          <span class="brand-mark">${icon("Zap", 22)}</span>
          <span>
            <strong>PowerPulse BD</strong>
            <small>Outage and solar intelligence</small>
          </span>
        </a>
        <nav class="nav-list" aria-label="Primary navigation">
          ${navItems
            .map(
              ([href, navIcon, label]) => `
                <a class="${activeRoute === href ? "active" : ""}" href="#${href}">
                  ${icon(navIcon)}
                  <span>${label}</span>
                </a>
              `
            )
            .join("")}
        </nav>
        <div class="sidebar-footer">
          ${
            signedIn
              ? `
                <span>${escapeHtml(state.user.name)}</span>
                <button class="ghost-button" type="button" data-action="logout">
                  ${icon("LogOut")}
                  Logout
                </button>
              `
              : `
                <span>Demo: demo@powerpulse.bd</span>
                <span>Password: Demo@12345</span>
              `
          }
        </div>
      </aside>
      <main class="main-panel">
        ${content}
      </main>
    </div>
  `;
}

export function pageHeader(title, kicker, actions = "") {
  return `
    <header class="page-header">
      <div>
        <p class="kicker">${escapeHtml(kicker)}</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="page-actions">${actions}</div>
    </header>
  `;
}

export function metricTile(label, value, helper, tileIcon, tone = "blue") {
  return `
    <article class="metric-tile tone-${tone}">
      <span class="metric-icon">${icon(tileIcon)}</span>
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(helper)}</small>
    </article>
  `;
}

export function inlineStat(label, value, helper, tone = "blue") {
  return `
    <div class="inline-stat tone-${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(helper)}</small>
    </div>
  `;
}

export function reportTable(reports, options = {}) {
  if (!reports.length) {
    return emptyState("No reports match this view.");
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Type</th>
            <th>Started</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Reporter</th>
            ${options.admin ? "<th>Moderate</th>" : ""}
          </tr>
        </thead>
        <tbody>
          ${reports
            .map(
              (report) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(report.area)}</strong>
                    <span>${escapeHtml(report.district)}</span>
                  </td>
                  <td>${typeBadge(report.outageType)}</td>
                  <td>${formatDate(report.startedAt)}</td>
                  <td>${formatNumber(report.durationHours, "h")}</td>
                  <td>${statusBadge(report.status)}</td>
                  <td>${escapeHtml(report.reporterName)}</td>
                  ${
                    options.admin
                      ? `
                        <td>
                          <select class="compact-input" data-action="moderate-report" data-id="${escapeHtml(
                            report.id
                          )}">
                            ${["pending", "verified", "resolved", "dismissed"]
                              .map(
                                (status) =>
                                  `<option value="${status}" ${
                                    report.status === status ? "selected" : ""
                                  }>${statusLabel(status)}</option>`
                              )
                              .join("")}
                          </select>
                        </td>
                      `
                      : ""
                  }
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function statusBadge(status) {
  return `<span class="badge status-${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span>`;
}

export function typeBadge(type) {
  return `<span class="badge type-${escapeHtml(type)}">${escapeHtml(typeLabel(type))}</span>`;
}

export function emptyState(message) {
  return `
    <div class="empty-state">
      ${icon("Inbox", 22)}
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

export function solarResultCard(estimate) {
  if (!estimate) {
    return emptyState("No solar estimate yet.");
  }

  const { result, inputs } = estimate;
  const loadItems = result.loadItems || [];
  const advice = result.advice || [];
  return `
    <section class="panel solar-result">
      <div class="result-top">
        <div>
          <p class="kicker">Solar estimate</p>
          <h2>${formatNumber(result.estimatedBackupHours, " hours")} backup</h2>
        </div>
        ${statusBadge(result.status)}
      </div>
      <div class="metric-grid compact">
        ${inlineStat("Total load", `${formatNumber(result.totalLoadWatts)} W`, "All selected appliances", "amber")}
        ${inlineStat("Usable battery", `${formatNumber(result.usableWattHours)} Wh`, `${inputs.batteryVoltage}V, ${inputs.batteryAh}Ah`, "green")}
        ${inlineStat("Solar recharge", `${formatNumber(result.estimatedSolarWattHours)} Wh`, `${formatNumber(result.rechargeCoveragePercent, "%")} coverage`, "teal")}
      </div>
      <div class="load-list">
        <h3>Load breakdown</h3>
        ${
          loadItems.length
            ? loadItems
                .map(
                  (item) => `
                    <span>
                      <strong>${escapeHtml(item.name)}</strong>
                      ${formatNumber(item.watts)} W
                    </span>
                  `
                )
                .join("")
            : "<span>No load selected</span>"
        }
      </div>
      <ul class="advice-list">
        ${advice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}
