export const districts = [
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Barisal",
  "Bhola",
  "Bogura",
  "Brahmanbaria",
  "Chandpur",
  "Chattogram",
  "Cox's Bazar",
  "Cumilla",
  "Dhaka",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gazipur",
  "Gopalganj",
  "Habiganj",
  "Jashore",
  "Khulna",
  "Kushtia",
  "Mymensingh",
  "Noakhali",
  "Rajshahi",
  "Rangpur",
  "Satkhira",
  "Sirajganj",
  "Sylhet",
  "Tangail"
];

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatNumber(value, suffix = "") {
  const number = Number(value || 0);
  return `${number.toLocaleString("en-BD", {
    maximumFractionDigits: 1
  })}${suffix}`;
}

export function hashQuery() {
  const [, queryString = ""] = window.location.hash.split("?");
  return Object.fromEntries(new URLSearchParams(queryString).entries());
}

export function icon(name, size = 18) {
  return `<i data-lucide="${toKebabIconName(name)}" aria-hidden="true" class="icon icon-${size}"></i>`;
}

function toKebabIconName(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

export function routeName() {
  const [path] = window.location.hash.replace(/^#/, "").split("?");
  return path || "/dashboard";
}

export function statusLabel(value) {
  const labels = {
    caution: "Caution",
    critical: "Critical",
    dismissed: "Dismissed",
    no_load: "No load",
    pending: "Pending",
    ready: "Ready",
    resolved: "Resolved",
    verified: "Verified"
  };
  return labels[value] || value;
}

export function typeLabel(value) {
  const labels = {
    loadshedding: "Loadshedding",
    maintenance: "Maintenance",
    power_on: "Power on"
  };
  return labels[value] || value;
}
