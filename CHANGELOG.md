# Changelog

All notable changes to the **ISM Code ↔ NIST CSF 2.0 Crosswalk** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-30

### Added
- **BIMCO Guidelines (5th Edition, Nov 2024)**: Integrated mappings across all 21 NIST CSF 2.0 subcategories referencing industry guidance from BIMCO, ICS, INTERCARGO, INTERTANKO, and OCIMF.
- **Automated Schema Validation**: Machine-readable JSON schema (`crosswalk.schema.json`) and node validation script (`scripts/validate-crosswalk.js`) enforcing dataset structure, unique IDs, valid CSF functions, and non-empty mapping metadata.
- **GitHub Actions CI**: Automated validation pipeline executing on push and pull requests to protect dataset integrity.
- **URL State Synchronization**: Dynamic URL query parameter persistence (`?q=...&function=...&gaps=...`) for shareable filtering views.
- **UI Methodology & Legend**: Dedicated visual mapping legend and methodology section explaining alignment criteria and gap identification.
- **Granular CSV Export**: Updated export schema clearly distinguishing primary regulatory references from interpretive mappings.
- **Citation Metadata**: Added `CITATION.cff` and README citation instructions for researchers, auditors, and practitioners.

### Changed
- Standardized row metadata to include explicit `sourceTrace` references.
- Clarified that gap rows reflect missing or indirect maritime instrument coverage rather than compliance failures.

---

## [0.1.0] - 2026-08-20

### Added
- Initial practitioner mapping of 21 NIST CSF 2.0 subcategories across all six functions (Govern, Identify, Protect, Detect, Respond, Recover).
- Core target frameworks:
  - IMO ISM Code (Res. A.741(18), as amended) Safety Management System sections
  - IMO Resolution MSC.428(98) cyber risk mandates
  - IMO MSC-FAL.1/Circ.3/Rev.3 (April 2025) operational guidance
- Single-page interactive user interface with real-time filtering, search, and CSV export.
- Plain-English vessel operational context ("what this looks like on the vessel") for each mapped control.
- Explicit gap flagging for subcategories without direct ISM Code equivalents.
