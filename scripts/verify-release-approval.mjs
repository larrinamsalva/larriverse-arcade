import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
const approvalPath = path.join(root, 'docs', 'release-approval.json');

function fail(message) {
  throw new Error(`Release approval verification failed: ${message}`);
}
function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function verifyQa(report, label) {
  if (!report?.approved) fail(`${label} is not approved`);
  if (!report.tester || !report.userAgent || !report.exportedAt) fail(`${label} metadata is incomplete`);
  if (!Array.isArray(report.results) || report.results.length !== 8) fail(`${label} must contain eight results`);
  const expected = new Set(release.cabinets.map((cabinet) => cabinet.id));
  const seen = new Set();
  for (const result of report.results) {
    if (!expected.has(result.id) || seen.has(result.id)) fail(`${label} has an unknown or duplicate cabinet`);
    seen.add(result.id);
    if (result.route !== 'reachable' || result.result !== 'pass') fail(`${label} did not pass ${result.id}`);
  }
}

if (!fs.existsSync(approvalPath)) fail('docs/release-approval.json is missing; human approval is required before tagging');
const approval = JSON.parse(fs.readFileSync(approvalPath, 'utf8'));
if (approval.schema !== 'larriverse-release-approval' || approval.schemaVersion !== 1) fail('unsupported approval schema');
if (approval.release !== release.version || approval.candidate !== release.candidate) fail('approval does not match release candidate');
if (!/^[a-f0-9]{40}$/.test(approval.approvedCodeCommit)) fail('approvedCodeCommit must be a full commit SHA');
if (!approval.approver || !approval.approvedAt || !approval.physicalDevice) fail('approver, date, and physical device are required');
if (approval.locationGrantedDuringEvidence !== false) fail('release evidence must not grant location');
const requiredConfirmations = ['physicalPhone', 'gameplay', 'soundTouch', 'accessibility', 'backupPrivacy', 'releaseDecision'];
for (const key of requiredConfirmations) if (approval.confirmations?.[key] !== true) fail(`missing confirmation ${key}`);

if (!approval.gallery?.approved || !Array.isArray(approval.gallery.entries) || approval.gallery.entries.length !== 18) fail('gallery must approve exactly 18 images');
const subjects = new Set(['lobby', ...release.cabinets.map((cabinet) => cabinet.id)]);
const expectedPairs = new Set();
for (const project of ['desktop-chromium', 'mobile-chromium']) for (const subject of subjects) expectedPairs.add(`${project}/${subject}`);
const seenPairs = new Set();
for (const entry of approval.gallery.entries) {
  const pair = `${entry.project}/${entry.subjectId}`;
  if (!expectedPairs.has(pair) || seenPairs.has(pair)) fail(`unexpected or duplicate gallery entry ${pair}`);
  seenPairs.add(pair);
  const expectedPath = `docs/screenshots/${entry.project}/${entry.subjectId}.png`;
  if (entry.approvedPath !== expectedPath) fail(`${pair} must use ${expectedPath}`);
  if (!/^[a-f0-9]{64}$/.test(entry.sha256)) fail(`${pair} has an invalid SHA-256 digest`);
  if (typeof entry.alt !== 'string' || entry.alt.trim().length < 20) fail(`${pair} needs useful alt text`);
  const absolute = path.join(root, expectedPath);
  if (!fs.existsSync(absolute)) fail(`approved image is missing: ${expectedPath}`);
  if (hashFile(absolute) !== entry.sha256) fail(`approved image hash changed: ${expectedPath}`);
}
if (seenPairs.size !== expectedPairs.size) fail('gallery pair coverage is incomplete');
verifyQa(approval.desktopQa, 'desktop QA');
verifyQa(approval.physicalMobileQa, 'physical mobile QA');
if (!approval.physicalMobileQa.device || approval.physicalMobileQa.device !== approval.physicalDevice) fail('physical mobile device details do not agree');

console.log(`Release approval verified: ${seenPairs.size} images, 16 manual cabinet results, approver ${approval.approver}.`);
