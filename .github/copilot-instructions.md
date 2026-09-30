# Copilot instructions for the ISM Cyber Crosswalk

## Repository purpose
This repo is a static, data-driven web app that compares NIST CSF 2.0 subcategories with maritime cyber-risk mappings under the ISM Code and IMO/BIMCO guidance. The data is the source of truth; the browser UI is a thin presentation layer.

## Build, test, and validation
- Install dependencies: `npm install`
- Validate the dataset and schema: `npm run validate`
- Equivalent low-level command: `node scripts/validate-crosswalk.js`
- Run the app locally: `npm run serve` (this starts `python -m http.server 8000`)
- Then open: `http://localhost:8000`

There is no build toolchain, lint task, or Jest/Vitest suite in this repo. The validation script is the required correctness check before submitting changes, and CI runs it in `.github/workflows/validate-crosswalk.yml`.

## Architecture and key files
- `data/crosswalk.json`: authoritative dataset. Each object is a CSF subcategory row with `id`, `function`, `title`, `gap`, `mappings`, and `sourceTrace`.
- `crosswalk.schema.json`: JSON schema that defines valid row and metadata structure.
- `scripts/validate-crosswalk.js`: runtime guardrail that rejects invalid JSON, duplicate IDs, non-standard CSF functions, bad mapping keys, non-boolean `gap` values, and missing source evidence.
- `app.js`: fetches `data/crosswalk.json`, renders filter pills/framework toggles, syncs URL state, and exports filtered rows.
- `index.html` and `styles.css`: page shell and styling for the static site.
- `assets/`: screenshots and static assets for the project.

## Key conventions specific to this repo
- Treat `data/crosswalk.json` as the single source of truth. Prefer narrow, evidence-based row edits over broad refactoring.
- Keep row keys aligned with the framework registry in `meta.frameworks.registry` (`ism`, `msc428`, `mscFalRev3`, `bimco`). Do not invent new framework IDs without updating the registry and the validation logic.
- `function` must be exactly one of: `Govern`, `Identify`, `Protect`, `Detect`, `Respond`, `Recover`.
- Every row must include a valid `sourceTrace` object with `confidence`, `lastReviewed`, and `evidence`. Evidence should cite the exact clause, guidance title, or standard reference being used.
- `gap` is a factual status flag, not a styling preference. Use `true` only when there is no strong mapping to the referenced framework; do not convert a gap row to support without clear evidence.
- Keep `relationship` and `vesselContext` text consistent with the surrounding rows and the underlying source documents. This project is a practitioner reference, not legal or compliance advice.
- When editing mappings, cite the source text or authoritative guidance in the same change. The project explicitly expects traceable mapping updates and a validation pass before PRs.

## Contribution expectations
- Review `README.md` and `CONTRIBUTING.md` before making data changes.
- If the update changes a mapping, include the relevant source clause or guidance and a brief rationale.
- Validate before opening a PR: `npm run validate`
- Keep the dataset consistent with the schema and maintain current source-trace metadata.
