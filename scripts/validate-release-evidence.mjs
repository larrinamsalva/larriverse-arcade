import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
const assert = (condition, message) => {
  checks += 1;
  if (!condition) throw new Error(`Release evidence validation failed: ${message}`);
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = [
  'scripts/build-gallery-review.mjs',
  'scripts/verify-release-approval.mjs',
  'qa/release-approval.html',
  'qa/release-approval.css',
  'qa/release-approval.js',
  'docs/GALLERY-APPROVAL.md'
];
for (const file of required) assert(exists(file), `missing ${file}`);
for (const file of ['scripts/build-gallery-review.mjs', 'scripts/verify-release-approval.mjs', 'qa/release-approval.js']) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
  assert(true, `${file} syntax must pass`);
}

const build = read('scripts/build-gallery-review.mjs');
const verify = read('scripts/verify-release-approval.mjs');
const approvalHtml = read('qa/release-approval.html');
const approvalCss = read('qa/release-approval.css');
const approvalJs = read('qa/release-approval.js');
const browserWorkflow = read('.github/workflows/browser-qa.yml');
const releaseWorkflow = read('.github/workflows/release.yml');
const docs = read('docs/GALLERY-APPROVAL.md');
const gallery = read('docs/CABINET-GALLERY.md');
const checklist = read('docs/RELEASE-CHECKLIST.md');
const release = json('release.json');
const packageJson = json('package.json');

assert(build.includes("schema: 'larriverse-gallery-review'"), 'gallery manifest schema missing');
assert(build.includes('expectedEntries: 18'), 'gallery builder must declare 18 entries');
assert(build.includes("crypto.createHash('sha256')"), 'gallery builder must hash images');
assert(build.includes('readUInt32BE(16)') && build.includes('readUInt32BE(20)'), 'gallery builder must record PNG dimensions');
assert(build.includes("['desktop-chromium'") || build.includes("id: 'desktop-chromium'"), 'desktop project missing');
assert(build.includes("id: 'mobile-chromium'"), 'mobile project missing');
assert(build.includes('subjectId: subject.id'), 'gallery entries must retain subject IDs');
assert(build.includes('humanApprovalRequired: true'), 'gallery manifest must require human approval');
assert(build.includes('uploadsData: false') && build.includes('grantsLocation: false'), 'gallery manifest privacy flags missing');
assert(build.includes("schema:'larriverse-gallery-approval'"), 'offline page must export gallery approval schema');
assert(build.includes("e.status==='approved'"), 'offline page must require every image approval');
assert(build.includes('Every approved image has useful, accurate alt text'), 'alt-text human check missing');
assert(!/https?:\/\//i.test(build), 'offline review builder must not embed external URLs');

assert(approvalHtml.includes('Release approval console'), 'approval console heading missing');
assert(approvalHtml.includes('Physical-phone QA report'), 'physical-phone evidence input missing');
assert(approvalHtml.includes('uploads nothing'), 'approval privacy statement missing');
assert(approvalHtml.includes('data-check="physicalPhone"'), 'physical-phone confirmation missing');
assert(approvalHtml.includes('data-check="releaseDecision"'), 'final release decision missing');
assert(approvalHtml.includes('role="status"'), 'approval status must be announced');
assert(approvalCss.includes(':focus-visible'), 'approval console needs visible keyboard focus');
assert(approvalCss.includes('@media(max-width:760px)'), 'approval console needs mobile layout');
assert(approvalJs.includes("const MANIFEST_URL = '../release.json'"), 'approval console must use local release manifest');
assert(approvalJs.includes("schema !== 'larriverse-gallery-approval'"), 'gallery schema validation missing');
assert(approvalJs.includes("schema !== 'larriverse-release-qa'"), 'QA schema validation missing');
assert(approvalJs.includes("schema: 'larriverse-release-approval'"), 'final approval schema missing');
assert(approvalJs.includes('approvedPath: `docs/screenshots/'), 'approved target path missing');
assert(approvalJs.includes("crypto.subtle.digest('SHA-256'"), 'imported evidence hashes missing');
assert(approvalJs.includes("result.result !== 'pass'"), 'QA reports must require pass results');
assert(approvalJs.includes("result.route !== 'reachable'"), 'QA reports must require reachable routes');
assert(!/sendBeacon|XMLHttpRequest|WebSocket|geolocation|watchPosition/i.test(approvalJs), 'approval console must not upload or request location');
assert(!/https?:\/\//i.test(approvalHtml + approvalCss + approvalJs), 'approval console must not load external resources');

assert(verify.includes("docs', 'release-approval.json'"), 'verifier must require committed approval record');
assert(verify.includes('human approval is required before tagging'), 'missing human gate error');
assert(verify.includes('gallery.entries.length !== 18'), 'verifier must require 18 images');
assert(verify.includes('docs/screenshots/${entry.project}/${entry.subjectId}.png'), 'verifier must enforce screenshot paths');
assert(verify.includes('hashFile(absolute) !== entry.sha256'), 'verifier must recompute image hashes');
assert(verify.includes("['physicalPhone', 'gameplay', 'soundTouch', 'accessibility', 'backupPrivacy', 'releaseDecision']"), 'verifier must require six confirmations');
assert(verify.includes("verifyQa(approval.desktopQa"), 'desktop QA verification missing');
assert(verify.includes("verifyQa(approval.physicalMobileQa"), 'physical mobile QA verification missing');
assert(verify.includes('locationGrantedDuringEvidence !== false'), 'location evidence boundary missing');

assert(browserWorkflow.includes('node scripts/build-gallery-review.mjs'), 'browser workflow must build review pack');
assert(browserWorkflow.includes('LARRIVERSE_SOURCE_SHA'), 'browser workflow must identify source commit');
assert(browserWorkflow.includes('larriverse-gallery-review-${{ github.run_number }}'), 'separate gallery artifact missing');
assert(browserWorkflow.includes('artifacts/gallery-review/'), 'gallery artifact path missing');
assert(browserWorkflow.includes('retention-days: 30'), 'gallery artifact retention must be 30 days');
assert(releaseWorkflow.includes('fetch-depth: 0'), 'release checkout must include ancestry');
assert(releaseWorkflow.includes('npm run verify:release-approval'), 'release workflow must verify human approval');
assert(releaseWorkflow.includes('git merge-base --is-ancestor'), 'release workflow must verify approved commit ancestry');
assert(releaseWorkflow.indexOf('npm run verify:release-approval') < releaseWorkflow.indexOf('gh release create'), 'approval verification must precede release');
assert(packageJson.scripts.validate.includes('validate-release-evidence.mjs'), 'normal validation must include evidence contract');
assert(packageJson.scripts['verify:release-approval'] === 'node scripts/verify-release-approval.mjs', 'approval verification script missing');

assert(release.galleryReview?.schema === 'larriverse-gallery-review', 'release galleryReview schema missing');
assert(release.galleryReview?.expectedImages === 18, 'release must expect 18 gallery images');
assert(release.galleryReview?.humanApprovalRequired === true, 'release must require gallery approval');
assert(release.galleryReview?.uploadsData === false, 'gallery review must not upload data');
assert(release.galleryReview?.approvalConsole === 'qa/release-approval.html', 'approval console path mismatch');
assert(release.galleryReview?.approvalRecord === 'docs/release-approval.json', 'approval record path mismatch');
assert(release.galleryReview?.approvedImagesRoot === 'docs/screenshots', 'approved image root mismatch');
assert(docs.includes('physical phone') && docs.includes('18 exact approved images'), 'approval documentation must preserve human gate');
assert(docs.includes('uploads nothing'), 'approval documentation must state privacy boundary');
assert(gallery.includes('candidate evidence') && gallery.includes('human approval'), 'gallery document must describe candidate evidence');
assert(checklist.includes('offline gallery review') && checklist.includes('final approval JSON'), 'release checklist must include approval workflow');

console.log(`Release evidence validation passed ${checks} checks.`);
