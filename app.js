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
let selectedFrameworks = [];

async function init() {
  const res = await fetch("data/crosswalk.json");
  const data = await res.json();

  document.getElementById("version").textContent = data.meta.version;
  document.getElementById("lastVerified").textContent = data.meta.lastVerified;
  document.getElementById("disclaimerText").textContent = data.meta.disclaimer;

  // Normalize frameworks registry for backward compatibility and future UI work
  const frameworks =
    data.meta && data.meta.frameworks && data.meta.frameworks.registry
      ? data.meta.frameworks.registry
      : (data.meta && data.meta.frameworks && data.meta.frameworks.targets) ||
        [];
  // Expose for future UI use
  window.crosswalkFrameworks = frameworks;

  // By default select all target frameworks in the registry
  selectedFrameworks = frameworks
    .filter((f) => f.type === "target")
    .map((f) => f.id);

  allRows = data.rows;
  renderPills();
  renderFrameworkControls();
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

function renderFrameworkControls() {
  const containerId = "frameworkControls";
  let container = document.getElementById(containerId);
  if (!container) {
    // create container next to functionPills
    const controls = document.querySelector(".controls");
    container = document.createElement("div");
    container.id = containerId;
    container.className = "framework-controls";
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", "Select target frameworks");
    // insert before export button
    const exportBtn = document.getElementById("exportCsv");
    controls.insertBefore(container, exportBtn);
  }
  container.innerHTML = "";

  const caption = document.createElement("span");
  caption.className = "framework-controls-label";
  caption.textContent = "Frameworks:";
  container.appendChild(caption);

  (window.crosswalkFrameworks || []).forEach((f) => {
    const label = document.createElement("label");
    label.className = "framework-toggle";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = f.id;
    cb.checked = selectedFrameworks.includes(f.id);
    cb.addEventListener("change", (e) => {
      if (e.target.checked) {
        selectedFrameworks.push(f.id);
      } else {
        selectedFrameworks = selectedFrameworks.filter((id) => id !== f.id);
      }
      render();
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + f.name));
    container.appendChild(label);
  });
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
      const haystackParts = [row.id, row.title, row.function];

      // Legacy fields
      if (row.ism) haystackParts.push(...row.ism);
      if (row.msc) haystackParts.push(row.msc);
      if (row.vesselContext) haystackParts.push(row.vesselContext);

      // New mappings
      if (row.mappings) {
        Object.keys(row.mappings).forEach((k) => {
          const m = row.mappings[k];
          if (!m) return;
          if (m.references) {
            if (Array.isArray(m.references))
              haystackParts.push(...m.references);
            else haystackParts.push(m.references);
          }
          if (m.vesselContext) haystackParts.push(m.vesselContext);
          if (m.relationship) haystackParts.push(m.relationship);
        });
      }

      const haystack = haystackParts.join(" ").toLowerCase();
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

  // Build dynamic header based on selectedFrameworks
  const thead = document.querySelector("#crosswalkTable thead");
  const headerCells = [
    '<th scope="col">NIST CSF 2.0</th>',
    '<th scope="col">Function</th>',
  ];
  (selectedFrameworks || []).forEach((id) => {
    const f = (window.crosswalkFrameworks || []).find((x) => x.id === id);
    headerCells.push(
      `<th scope="col">${escapeHtml(f && f.name ? f.name : id)}</th>`,
    );
  });
  headerCells.push('<th scope="col">On the vessel</th>');
  thead.innerHTML = `<tr>${headerCells.join("")}</tr>`;

  if (!rows.length) {
    const colspan = 2 + (selectedFrameworks || []).length + 1;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="loading">No rows match — try clearing filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map((row) => {
      const cols = [];
      cols.push(`
        <td>
          <div class="csf-id">${escapeHtml(row.id)}</div>
          <div class="csf-title">${escapeHtml(row.title)}</div>
        </td>
      `);
      cols.push(
        `<td><span class="func-badge">${escapeHtml(row.function)}</span></td>`,
      );

      // framework-specific columns
      (selectedFrameworks || []).forEach((id) => {
        const m = row.mappings && row.mappings[id];
        let content = "";
        if (m && m.references) {
          if (Array.isArray(m.references))
            content = `<ul class="ism-list">${m.references.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
          else content = escapeHtml(m.references);
        }
        if (m && m.relationship)
          content += `<div class="mapping-relationship">${escapeHtml(m.relationship)}</div>`;
        if (row.gap && id === "ism")
          content +=
            " " + (row.gap ? '<span class="gap-badge">gap</span>' : "");
        cols.push(`<td>${content}</td>`);
      });

      // vessel context (prefer mapping.ism.vesselContext)
      const vesselCtx =
        (row.mappings && row.mappings.ism && row.mappings.ism.vesselContext) ||
        row.vesselContext ||
        "";
      cols.push(`<td>${escapeHtml(vesselCtx)}</td>`);

      return `<tr>${cols.join("")}</tr>`;
    })
    .join("");
}

function exportCsv() {
  const rows = filteredRows();

  // Header: ID, Function, Title, then framework columns, Vessel context, Gap
  const frameworkNames = (selectedFrameworks || []).map((id) => {
    const f = (window.crosswalkFrameworks || []).find((x) => x.id === id);
    return f ? f.name : id;
  });

  const header = [
    "ID",
    "Function",
    "Title",
    ...frameworkNames,
    "On the vessel",
    "Gap",
  ];
  const lines = [header.map(csvEscape).join(",")];

  rows.forEach((row) => {
    const frameworkCols = (selectedFrameworks || []).map((id) => {
      const m = row.mappings && row.mappings[id];
      if (!m || !m.references) return "";
      if (Array.isArray(m.references)) return m.references.join(" | ");
      return String(m.references);
    });

    const vesselCtx =
      (row.mappings && row.mappings.ism && row.mappings.ism.vesselContext) ||
      row.vesselContext ||
      "";

    const line = [
      row.id,
      row.function,
      row.title,
      ...frameworkCols,
      vesselCtx,
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
