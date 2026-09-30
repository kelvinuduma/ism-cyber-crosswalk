# Contributing to the ISM Code ↔ NIST CSF 2.0 Crosswalk

Thanks for helping improve the crosswalk.

## How to contribute

We welcome corrections, additions, and clarifications to the dataset. The project is a practitioner reference, so every change should be grounded in the source text or an authoritative supporting document.

## Before you open a PR

1. Verify the data remains valid:
   ```bash
   npm run validate
   ```
2. Confirm the row includes a clear source trace via `sourceTrace.evidence`.
3. Cite the exact clause, guidance section, or standard reference in the update.
4. Keep the relationship/gap status evidence-based.
5. Avoid forcing a strong mapping if the evidence is partial.

## Recommended update format

When editing `data/crosswalk.json`, keep the row structure consistent with the existing format:

- `id`: stable CSF subcategory ID
- `function`: one of Govern / Identify / Protect / Detect / Respond / Recover
- `title`: plain-English subcategory title
- `mappings`: framework-specific references
- `relationship`: supports / partial / etc.
- `gap`: boolean flag
- `sourceTrace`: evidence metadata with confidence and references

## PR expectations

Please include:

- the exact source document or clause being cited
- a short rationale for the mapping change
- any practical vessel example, if relevant
- the validation command output (or a note that validation passed)

## Review standard

A row is only a valid update if it is:

- traceable to the source text
- internally consistent with the surrounding dataset
- clearly labeled as a support, partial fit, or gap
- checked with `npm run validate`
