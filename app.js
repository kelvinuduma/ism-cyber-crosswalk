const FUNCTIONS = [
  "Govern",
  "Identify",
  "Protect",
  "Detect",
  "Respond",
  "Recover",
];

let allRows = [];
let activeFunction = null;
let gapOnly = false;
let searchTerm = "";

async function init() {
  const res = await fetch("data/crosswalk.json");
  const data = await res.json();

  document.getElementById("version").textContent = data.meta.version;
  document.getElementById("lastVerified").textContent = data.meta.lastVerified;
  document.getElementById("disclaimerText").textContent = data.meta.disclaimer;

  allRows = data.rows;
  renderPills();
  render();

  document.getElementById("searchBox").addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("gapOnly").addEventListener("change", (e) => {
    gapOnly = e.target.checked;
    render();
  });
  document.getElementById("exportCsv").addEventListener("click", exportCsv);
}

function renderPills() {
  const container = document.getElementById("functionPills");
  container.innerHTML = "";

  const allPill = makePill("All", null);
  container.appendChild(allPill);

  FUNCTIONS.forEach((fn) => container.appendChild(makePill(fn, fn)));
}

function makePill(label, value) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pill" + (activeFunction === value ? " active" : "");
  btn.textContent = label;
  btn.addEventListener("click", () => {
    activeFunction = value;
    document
      .querySelectorAll(".pill")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
  if (activeFunction === value) btn.classList.add("active");
  return btn;
}

function filteredRows() {
  return allRows.filter((row) => {
    if (activeFunction && row.function !== activeFunction) return false;
    if (gapOnly && !row.gap) return false;
    if (searchTerm) {
      const haystack = [
        row.id,
        row.title,
        row.function,
        ...(row.ism || []),
        row.msc,
        row.vesselContext,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }
    return true;
  });
}

function render() {
  const rows = filteredRows();
  const tbody = document.getElementById("tableBody");
  document.getElementById("rowCount").textContent =
    `${rows.length} of ${allRows.length} subcategories`;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="loading">No rows match — try clearing filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(
      (row) => `
    <tr>
      <td>
        <div class="csf-id">${escapeHtml(row.id)}</div>
        <div class="csf-title">${escapeHtml(row.title)}</div>
      </td>
      <td><span class="func-badge">${escapeHtml(row.function)}</span></td>
      <td>
        <ul class="ism-list">
          ${(row.ism || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}
        </ul>
        ${row.gap ? '<span class="gap-badge">gap</span>' : ""}
      </td>
      <td>${escapeHtml(row.msc)}</td>
      <td>${escapeHtml(row.vesselContext)}</td>
    </tr>
  `,
    )
    .join("");
}

function exportCsv() {
  const rows = filteredRows();
  const header = [
    "ID",
    "Function",
    "Title",
    "ISM Code mapping",
    "MSC.428(98) / MSC-FAL.1 Circ.3",
    "On the vessel",
    "Gap",
  ];
  const lines = [header.join(",")];

  rows.forEach((row) => {
    const line = [
      row.id,
      row.function,
      row.title,
      (row.ism || []).join(" | "),
      row.msc,
      row.vesselContext,
      row.gap ? "yes" : "no",
    ]
      .map(csvEscape)
      .join(",");
    lines.push(line);
  });

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ism-cyber-crosswalk.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

init();
