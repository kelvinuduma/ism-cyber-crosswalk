const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dataPath = path.join(repoRoot, 'data', 'crosswalk.json');
const schemaPath = path.join(repoRoot, 'crosswalk.schema.json');
const validFunctions = ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'];

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

let raw;
try {
  raw = fs.readFileSync(dataPath, 'utf8');
} catch (error) {
  fail(`Unable to read ${dataPath}: ${error.message}`);
}

raw = raw.replace(/^\uFEFF/, '');

let data;
try {
  data = JSON.parse(raw);
} catch (error) {
  fail(`Invalid JSON in ${dataPath}: ${error.message}`);
}

if (!data || typeof data !== 'object') {
fail('Top-level JSON is not an object.');
}

if (!data.meta || !data.meta.frameworks || !Array.isArray(data.meta.frameworks.registry)) {
fail('meta.frameworks.registry is missing or invalid.');
}

const registry = data.meta.frameworks.registry;
const frameworkIds = registry.map((framework) => framework.id).filter(Boolean);
if (!frameworkIds.length) {
fail('No frameworks are defined in the registry.');
}

if (!Array.isArray(data.rows)) {
fail('rows must be an array.');
}

const schemaRows = schema.properties.rows.items.properties;
const seenIds = new Set();
for (const [index, row] of data.rows.entries()) {
if (!row || typeof row !== 'object') {
  fail(`Row ${index} is not an object.`);
}

if (!row.id || typeof row.id !== 'string') {
  fail(`Row ${index} is missing a valid id.`);
}

if (seenIds.has(row.id)) {
  fail(`Duplicate row id found: ${row.id}`);
}
seenIds.add(row.id);

if (!validFunctions.includes(row.function)) {
  fail(`Row ${row.id} has invalid function: ${String(row.function)}`);
}

if (typeof row.title !== 'string' || !row.title.trim()) {
  fail(`Row ${row.id} is missing a valid title.`);
}

if (!row.mappings || typeof row.mappings !== 'object') {
  fail(`Row ${row.id} is missing a valid mappings object.`);
}

const mappingKeys = Object.keys(row.mappings);
const invalidKeys = mappingKeys.filter((key) => !frameworkIds.includes(key));
if (invalidKeys.length) {
  fail(`Row ${row.id} contains invalid mapping keys: ${invalidKeys.join(', ')}`);
}

for (const [frameworkId, mapping] of Object.entries(row.mappings)) {
  if (mapping === null || mapping === undefined) {
    continue;
  }

  if (typeof mapping !== 'object') {
    fail(`Row ${row.id} mapping for ${frameworkId} must be an object or null.`);
  }

  if (
    mapping.references !== undefined &&
    mapping.references !== null &&
    !Array.isArray(mapping.references) &&
    typeof mapping.references !== 'string'
  ) {
    fail(`Row ${row.id} mapping for ${frameworkId} has invalid references type.`);
  }
}

if (typeof row.gap !== 'boolean') {
  fail(`Row ${row.id} has a non-boolean gap field.`);
}

if (!row.sourceTrace || typeof row.sourceTrace !== 'object') {
  fail(`Row ${row.id} is missing row-level sourceTrace metadata.`);
}

const trace = row.sourceTrace;
const allowedConfidence = ['high', 'medium', 'low'];
if (!allowedConfidence.includes(trace.confidence)) {
  fail(`Row ${row.id} has invalid sourceTrace.confidence: ${String(trace.confidence)}`);
}

if (!Array.isArray(trace.evidence) || trace.evidence.length === 0) {
  fail(`Row ${row.id} is missing sourceTrace.evidence.`);
}

if (!trace.lastReviewed || typeof trace.lastReviewed !== 'string') {
  fail(`Row ${row.id} is missing sourceTrace.lastReviewed.`);
}
}

if (schema && schema.properties && schema.properties.rows && schema.properties.rows.items) {
const schemaKeyCount = Object.keys(schema.properties.rows.items.properties).length;
if (schemaKeyCount < 5) {
  fail('Schema file appears incomplete.');
}
}

console.log(`Validation succeeded: ${data.rows.length} rows checked across ${frameworkIds.length} frameworks.`);
