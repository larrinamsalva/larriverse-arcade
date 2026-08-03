import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '_site');
const releasePath = path.join(root, 'release.json');
const releaseText = fs.readFileSync(releasePath, 'utf8');
const release = JSON.parse(releaseText);
const files = ['index.html', 'release.json', 'LICENSE'];
const directories = ['assets', 'games', 'qa', 'docs'];
const forbidden = ['.git', '.github', 'node_modules', 'scripts', 'tests', 'artifacts', 'playwright-report', 'test-results'];
const sourceCommit = process.env.GITHUB_SHA || process.env.LARRIVERSE_SOURCE_SHA || 'local-build';
const runningInActions = process.env.GITHUB_ACTIONS === 'true';

if (runningInActions && !/^[a-f0-9]{40}$/i.test(sourceCommit)) {
  throw new Error('GitHub Pages build requires a full source commit SHA');
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of files) {
  const source = path.join(root, name);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(out, name));
}
for (const name of directories) {
  const source = path.join(root, name);
  if (fs.existsSync(source)) fs.cpSync(source, path.join(out, name), { recursive: true });
}

fs.rmSync(path.join(out, 'docs', 'release-approval.json'), { force: true });
fs.writeFileSync(path.join(out, '.nojekyll'), '');

const deployment = {
  schema: 'larriverse-deployment',
  schemaVersion: 1,
  release: release.version,
  candidate: release.candidate,
  releaseState: release.releaseState,
  sourceCommit,
  builtAt: new Date().toISOString(),
  repository: process.env.GITHUB_REPOSITORY || 'larrinamsalva/larriverse-arcade',
  workflowRunId: process.env.GITHUB_RUN_ID || null,
  workflowRunNumber: process.env.GITHUB_RUN_NUMBER || null,
  refName: process.env.GITHUB_REF_NAME || null,
  releaseManifestSha256: crypto.createHash('sha256').update(releaseText).digest('hex'),
  routes: {
    lobby: 'index.html',
    guidedQa: release.deviceQa.route,
    readiness: release.deployment.readinessRoute,
    evidencePreflight: release.deployment.evidencePreflightRoute,
    releaseRoom: release.deployment.releaseRoomRoute,
    finalApproval: release.galleryReview.approvalConsole
  },
  privacy: {
    uploadsData: false,
    requestsLocation: false,
    createsReleaseApproval: false,
    publishesApprovalRecord: false,
    publishesPrivateEvidence: false
  }
};
fs.writeFileSync(path.join(out, 'deployment.json'), `${JSON.stringify(deployment, null, 2)}\n`);

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolute = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});
const published = walk(out).map((absolute) => path.relative(out, absolute).replaceAll(path.sep, '/'));
for (const name of forbidden) {
  if (published.some((file) => file === name || file.startsWith(`${name}/`))) throw new Error(`Forbidden preview path published: ${name}`);
}
for (const required of [
  'index.html',
  'release.json',
  'deployment.json',
  'qa/index.html',
  'qa/readiness.html',
  'qa/evidence-contract.js',
  'qa/evidence-preflight.html',
  'qa/release-room.html',
  'qa/release-approval.html',
  'games/catalog.json'
]) {
  if (!published.includes(required)) throw new Error(`Preview is missing ${required}`);
}
if (published.some((file) => /(^|\/)(\.env|id_rsa|credentials|release-approval\.json)$/i.test(file))) {
  throw new Error('Preview contains a private evidence or credential file');
}

console.log(`GitHub Pages site built with ${published.length} public static files from ${sourceCommit}.`);
