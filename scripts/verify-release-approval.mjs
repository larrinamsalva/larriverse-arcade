import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
const approvalPath = path.join(root, 'docs', 'release-approval.json');
const requiredDeviceChecks = ['controls', 'accessibility', 'backupRestore', 'privacy', 'sound', 'deviceComfort'];

function fail(message) {
  throw new Error(`Release approval verification failed: ${message}`);
}
function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function verifyQa(report, label, expectedDeviceClass) {
  if (!report?.approved) fail(`${label} is not approved`);
  if (report.deviceClass !== expectedDeviceClass) fail(`${label} must be labeled ${expectedDeviceClass}`);
  if (!report.deviceName || !report.tester || !report.userAgent || !report.exportedAt) fail(`${label} metadata is incomplete`);
  if (report.locationGrantedDuringEvidence !== false) fail(`${label} must not grant location`);
  if (!report.environment || !Number.isFinite(report.environment.viewportWidth) || !Number.isFinite(report.environment.viewportHeight)) fail(`${label} environment is incomplete`);
  if (expectedDeviceClass === 'physical-phone' && !(Number(report.environment.maxTouchPoints) >= 1)) fail(`${label} must show touch capability`);
  for (const key of requiredDeviceChecks) if (report.deviceChecks?.[key] !== true) fail(`${label} is missing device check ${key}`);
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
if (approval.schema !== 'larriverse-release-approval' || approval.schemaVersion !== 1 || approval.qaSchemaVersion !== 2) fail('unsupported approval schema');
if (approval.release !== release.version || approval.candidate !== release.candidate) fail('approval does not match release candidate');
if (!/^[a-f0-9]{40}$/.test(approval.approvedCodeCommit)) fail('approvedCodeCommit must be a full commit SHA');
if (!approval.approver || !approval.approvedAt || !approval.physicalDevice) fail('approver, date, and physical device are required');
if (approval.locationGrantedDuringEvidence !== false) fail('release evidence must not grant location');
const requiredConfirmations = ['physicalPhone', 'gameplay', 'soundTouch', 'accessibility', 'backupPrivacy', 'releaseDecision'];
for (const key of requiredConfirmations) if (approval.confirmations?.[key] !== true) fail(`missing confirmation ${key}`);
for (const key of ['gallery', 'desktop', 'mobile']) {
  if (!/^[a-f0-9]{64}$/.test(approval.evidenceHashes?.[key] || '')) fail(`${key} evidence hash is invalid`);
}
if (approval.evidenceHashes.desktop === approval.evidenceHashes.mobile) fail('desktop and phone evidence files must be different');

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
verifyQa(approval.desktopQa, 'desktop QA', 'desktop');
verifyQa(approval.physicalMobileQa, 'physical mobile QA', 'physical-phone');
if (approval.desktopQa.fileSha256 !== approval.evidenceHashes.desktop) fail('desktop evidence hash does not agree with the final approval');
if (approval.physicalMobileQa.fileSha256 !== approval.evidenceHashes.mobile) fail('phone evidence hash does not agree with the final approval');
if (!approval.physicalMobileQa.device || approval.physicalMobileQa.device !== approval.physicalMobileQa.deviceName) fail('physical mobile report device details do not agree');
if (approval.physicalMobileQa.deviceName !== approval.physicalDevice) fail('physical mobile device does not agree with final approval');

if (approval.handoffBundle !== null && approval.handoffBundle !== undefined) {
  const handoff = approval.handoffBundle;
  if (!/^[a-f0-9]{64}$/.test(handoff.fileSha256 || '')) fail('handoff bundle file hash is invalid');
  if (!handoff.createdAt || !handoff.deployment) fail('handoff bundle metadata is incomplete');
  if (handoff.deployment.schema !== 'larriverse-deployment' || handoff.deployment.schemaVersion !== 1) fail('handoff deployment identity is invalid');
  if (handoff.deployment.release !== release.version || handoff.deployment.candidate !== release.candidate) fail('handoff deployment release does not match');
  if (!/^[a-f0-9]{40}$/.test(handoff.deployment.sourceCommit || '')) fail('handoff deployment source commit is invalid');
  if (!/^[a-f0-9]{64}$/.test(handoff.deployment.releaseManifestSha256 || '')) fail('handoff deployment digest is invalid');
}

console.log(`Release approval verified: ${seenPairs.size} images, 16 device-labeled manual cabinet results, approver ${approval.approver}.`);
