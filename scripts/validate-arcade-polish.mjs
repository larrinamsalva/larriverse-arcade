import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const checks = [];
const failures = [];
const check = (condition, message) => (condition ? checks : failures).push(message);
const read = relative => readFile(path.join(root, relative), 'utf8');
const exists = async relative => {
  try { await access(path.join(root, relative)); return true; }
  catch { return false; }
};

const [index, css, app, sdk, packageText, catalogText, release, gallery] = await Promise.all([
  read('index.html'),
  read('assets/arcade.css'),
  read('assets/arcade.js'),
  read('assets/arcade-sdk.js'),
  read('package.json'),
  read('games/catalog.json'),
  read('docs/RELEASE-CHECKLIST.md'),
  read('docs/CABINET-GALLERY.md')
]);

const pkg = JSON.parse(packageText);
const catalog = JSON.parse(catalogText);
const playable = catalog.filter(game => game.available);

check(pkg.version === '1.0.0', 'package declares LarriVerse Arcade 1.0.0');
check(pkg.scripts?.validate?.includes('validate-arcade-polish.mjs'), 'main validation command includes arcade polish audit');
check(Array.isArray(catalog) && catalog.length === 8, 'catalog contains exactly eight recovered browser concepts');
check(playable.length === 8, 'all eight recovered browser concepts are playable');
check(new Set(catalog.map(game => game.id)).size === 8, 'all cabinet ids are unique');
check(catalog.every(game => game.featured === true), 'all playable cabinets participate in the featured rotation');

check(index.includes('class="skip-link"'), 'lobby includes a keyboard skip link');
check(index.includes('id="controlCenter"'), 'lobby includes the shared control center');
check(index.includes('class="mobile-dock"'), 'lobby includes mobile shortcut navigation');
check(index.includes('id="release"'), 'lobby includes a release-readiness section');
check(index.includes('<b id="playableCount">8</b> live cabinets'), 'static lobby fallback reports eight live cabinets');
check(index.includes('data-open-control'), 'settings and save tools have visible open controls');
check(index.includes('id="reducedMotion"'), 'control center exposes reduced motion');
check(index.includes('id="highContrast"'), 'control center exposes high contrast');
check(index.includes('id="largeText"'), 'control center exposes larger text');
check(index.includes('id="exportSaves"'), 'control center exposes backup download');
check(index.includes('id="importSaves"'), 'control center exposes backup restore');
check(index.includes('id="clearSaves"'), 'control center exposes progress erasure');
check(index.includes('aria-live="polite"'), 'control center announces save status');
check(index.indexOf('assets/arcade-sdk.js') < index.indexOf('assets/arcade.js'), 'lobby loads shared SDK before lobby engine');

check(css.includes(':focus-visible'), 'lobby defines visible keyboard focus');
check(css.includes('.mobile-dock'), 'lobby styles mobile navigation');
check(css.includes('@media(prefers-reduced-motion:reduce)'), 'lobby honors system reduced-motion preference');
check(css.includes('html.larriverse-high-contrast'), 'lobby responds to shared high-contrast class');
check(css.includes('.control-center::backdrop'), 'control center has a modal backdrop');
check(css.includes('@media(max-width:700px)'), 'lobby includes narrow-screen layout rules');

check(sdk.includes('const VERSION = 3'), 'shared SDK is upgraded to version 3');
check(sdk.includes("const SETTINGS_KEY = 'larriverse.arcade.settings.v1'"), 'shared settings use a dedicated device-local record');
check(sdk.includes("const DATA_PREFIX = 'larriverse.'"), 'backup scope is limited to LarriVerse records');
check(sdk.includes("const BACKUP_SCHEMA = 'larriverse-save-backup'"), 'backups declare a stable schema');
check(sdk.includes('MAX_BACKUP_BYTES = 1_500_000'), 'backup size is bounded');
check(sdk.includes('MAX_RECORDS = 64'), 'backup record count is bounded');
check(sdk.includes('function setSettings'), 'SDK exposes shared setting updates');
check(sdk.includes('function applySettings'), 'SDK applies settings to every cabinet document');
check(sdk.includes('larriverse-reduced-motion'), 'SDK applies reduced-motion class');
check(sdk.includes('larriverse-high-contrast'), 'SDK applies high-contrast class');
check(sdk.includes('larriverse-large-text'), 'SDK applies larger-text class');
check(sdk.includes('function exportData'), 'SDK exports LarriVerse records');
check(sdk.includes('function importData'), 'SDK imports schema-checked backups');
check(sdk.includes('function parseBackup'), 'SDK validates backups before import');
check(sdk.includes('key.startsWith(DATA_PREFIX)'), 'export enumerates only LarriVerse-prefixed records');
check(sdk.includes('/^larriverse\\.'), 'import rejects keys outside the LarriVerse prefix');
check(sdk.includes('JSON.parse(value)'), 'every imported record must contain valid JSON');
check(sdk.includes('const before = exportData()'), 'import snapshots current records for rollback');
check(sdk.includes('for (const [key, value] of Object.entries(before.records))'), 'failed import restores the previous records');
check(sdk.includes('function clearData'), 'SDK exposes explicit LarriVerse data erasure');
check(!sdk.includes('eval('), 'SDK does not evaluate imported code');
check(!sdk.includes('new Function'), 'SDK does not construct functions from backup text');

check(app.includes('function downloadBackup'), 'lobby can download a backup file');
check(app.includes('function restoreBackup'), 'lobby can restore a selected backup');
check(app.includes("new Blob([text], { type: 'application/json' })"), 'backup download uses a local JSON blob');
check(app.includes('sdk.importData(text, { replace: true })'), 'restore delegates to SDK validation');
check(app.includes('window.confirm'), 'destructive erasure requires confirmation');
check(app.includes("event.key === '/'"), 'slash shortcut focuses cabinet search');
check(app.includes('aria-pressed'), 'category filters expose pressed state');
check(app.includes('restartFeatureRotation'), 'featured rotation can react to comfort settings');
check(app.includes('sdk?.settings?.().reducedMotion'), 'featured rotation stops for reduced motion');
check(!app.includes('eval('), 'lobby engine does not evaluate backup content');

const cabinetTitles = catalog.map(game => game.title);
for (const title of cabinetTitles) {
  check(release.includes(title), `release checklist names ${title}`);
  check(gallery.includes(title), `gallery manifest names ${title}`);
}
check(release.includes('No location coordinates appear in exported Road Trip GPS data.'), 'release checklist includes location-backup inspection');
check(release.includes('GitHub Actions confirms structural'), 'release checklist distinguishes automation from play testing');
check(gallery.includes('Road Trip Quest GPS must be captured in Demo Mode'), 'gallery rules protect location privacy');
check(await exists('docs/RELEASE-CHECKLIST.md'), 'release checklist file exists');
check(await exists('docs/CABINET-GALLERY.md'), 'cabinet gallery manifest exists');

for (const file of ['assets/arcade-sdk.js', 'assets/arcade.js', 'scripts/validate-arcade-polish.mjs']) {
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  check(syntax.status === 0, `${file} passes node --check`);
}

if (failures.length) {
  console.error(`Arcade polish validation failed (${failures.length} failures):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Arcade polish validation passed (${checks.length} checks).`);
