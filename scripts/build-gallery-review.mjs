import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
const sourceRoot = path.join(root, 'artifacts', 'screenshots');
const outputRoot = path.join(root, 'artifacts', 'gallery-review');
const sourceCommit = process.env.LARRIVERSE_SOURCE_SHA || process.env.GITHUB_SHA || 'local-review-build';
const runId = process.env.LARRIVERSE_RUN_ID || process.env.GITHUB_RUN_ID || null;

const expectedProjects = [
  { id: 'desktop-chromium', cssViewport: '1440x900' },
  { id: 'mobile-chromium', cssViewport: '390x844' }
];
const subjects = [
  { id: 'lobby', title: `${release.title} lobby` },
  ...release.cabinets.map(({ id, title }) => ({ id, title }))
];
const altText = {
  lobby: 'LarriVerse Arcade lobby showing the eight-cabinet collection and shared profile controls.',
  'kidscoin-family': 'KidsCoin Family dashboard explaining fictional family rewards and parent-controlled local progress.',
  'brain-sweat-expanded': 'Brain Sweat Expanded opening screen with reviewed skill worlds, progress cards, and review-first safety messaging.',
  'brain-sweat-life-skills': 'Brain Sweat Life Skills lesson hub showing reviewed worlds, playable question totals, and queued-content protections.',
  'bubble-resonance-phi369': 'Bubble Resonance playfield with colorful hexagonal bubbles, score controls, and the creative-theme boundary.',
  'chill-brain-rewards': 'Chill Brain onboarding card with calm practice choices, optional sound, and gentle session controls.',
  'creature-catcher': 'Creature Catcher opening card inviting the player to begin a short question-and-collection safari.',
  'road-trip-quest': 'Road Trip Quest opening screen with the start button and collect, battle, and conquer campaign theme.',
  'road-trip-quest-gps': 'Road Trip Quest GPS opening screen showing Demo Mode, optional Live Movement, and the passenger-only safety warning.'
};

function fail(message) {
  throw new Error(`Gallery review build failed: ${message}`);
}
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') fail('invalid PNG screenshot');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}
function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\u003c');
}

if (release.version !== '1.0.0' || release.candidate !== 'rc.1') fail('unsupported release candidate');
if (!Array.isArray(release.cabinets) || release.cabinets.length !== 8) fail('release must list eight cabinets');
if (!fs.existsSync(sourceRoot)) fail('artifacts/screenshots is missing; run browser QA first');

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(outputRoot, 'images'), { recursive: true });

const entries = [];
for (const project of expectedProjects) {
  const projectOutput = path.join(outputRoot, 'images', project.id);
  fs.mkdirSync(projectOutput, { recursive: true });
  for (const subject of subjects) {
    const source = path.join(sourceRoot, project.id, `${subject.id}.png`);
    if (!fs.existsSync(source)) fail(`missing ${project.id}/${subject.id}.png`);
    const buffer = fs.readFileSync(source);
    const dimensions = pngDimensions(buffer);
    const relativePath = `images/${project.id}/${subject.id}.png`;
    fs.copyFileSync(source, path.join(outputRoot, relativePath));
    entries.push({
      key: `${project.id}/${subject.id}`,
      project: project.id,
      cssViewport: project.cssViewport,
      subjectId: subject.id,
      title: subject.title,
      path: relativePath,
      sha256: sha256(buffer),
      bytes: buffer.length,
      pixelWidth: dimensions.width,
      pixelHeight: dimensions.height,
      defaultAlt: `${altText[subject.id]} ${project.id === 'desktop-chromium' ? 'Desktop view.' : 'Mobile view.'}`
    });
  }
}
if (entries.length !== 18) fail(`expected 18 screenshots, found ${entries.length}`);

const manifest = {
  schema: 'larriverse-gallery-review',
  schemaVersion: 1,
  release: release.version,
  candidate: release.candidate,
  sourceCommit,
  workflowRunId: runId,
  generatedAt: new Date().toISOString(),
  humanApprovalRequired: true,
  uploadsData: false,
  grantsLocation: false,
  expectedEntries: 18,
  projects: expectedProjects,
  entries
};
fs.writeFileSync(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LarriVerse Gallery Review</title>
<style>
:root{color-scheme:dark;--bg:#07101d;--panel:#0e1b2c;--line:#29415f;--text:#f4f8ff;--muted:#a8b9cc;--good:#57e3a1;--warn:#ffd166;--bad:#ff6b7d}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#07101d,#091426);color:var(--text);font:16px/1.5 system-ui,sans-serif}button,input,textarea{font:inherit}.shell{max-width:1500px;margin:auto;padding:24px}.hero,.card,.summary{background:var(--panel);border:1px solid var(--line);border-radius:18px}.hero{padding:24px;margin-bottom:18px}.hero h1{margin:.2rem 0}.hero p{color:var(--muted);max-width:80ch}.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:18px 0}.controls label,.checks label{display:grid;gap:6px}.controls input,.card textarea{width:100%;background:#07111f;color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px}.checks{display:grid;gap:8px;padding:16px;background:#091625;border:1px solid var(--line);border-radius:14px}.checks label{display:flex;align-items:flex-start;gap:9px}.summary{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:14px 18px;position:sticky;top:8px;z-index:3}.summary b{font-size:1.1rem}.summary .ready{color:var(--good)}.summary .blocked{color:var(--warn)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}button{border:1px solid var(--line);border-radius:10px;background:#13253a;color:var(--text);padding:10px 14px;cursor:pointer}button.primary{background:#1f7a5a;border-color:#4bd39a}button:disabled{opacity:.45;cursor:not-allowed}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:18px;margin-top:18px}.card{overflow:hidden}.card img{display:block;width:100%;height:auto;background:#000}.card .body{padding:14px}.meta{color:var(--muted);font-size:.9rem;overflow-wrap:anywhere}.decision{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.decision label{border:1px solid var(--line);border-radius:999px;padding:7px 10px}.decision input{margin-right:5px}.card[data-status="approved"]{border-color:var(--good)}.card[data-status="rejected"]{border-color:var(--bad)}.notice{border-left:4px solid var(--warn);padding:10px 14px;background:#2b230f;color:#ffe8a6}.footer{color:var(--muted);padding:24px 0}a{color:#8fc7ff}:focus-visible{outline:3px solid #fff;outline-offset:3px}@media(max-width:520px){.shell{padding:12px}.grid{grid-template-columns:1fr}.summary{position:static}.actions{margin-left:0}}
</style>
</head>
<body>
<main class="shell">
<section class="hero">
<p>LarriVerse Arcade 1.0 · ${release.candidate}</p>
<h1>Offline gallery approval</h1>
<p>Review all 18 Chromium evidence images. This file works locally, makes no network requests, uploads nothing, and cannot publish a release. Automated screenshots are evidence—not human approval.</p>
<p class="notice">Physical-phone gameplay, sound, touch comfort, and instruction clarity remain separate human checks.</p>
<div class="controls"><label>Reviewer name or initials<input id="reviewer" maxlength="60" autocomplete="off"></label><label>Review notes<input id="overallNotes" maxlength="500" autocomplete="off"></label></div>
<div class="checks">
<label><input type="checkbox" data-global="cleanData">No personal names, family notes, private progress, or account data are visible.</label>
<label><input type="checkbox" data-global="locationSafe">No location coordinates, permission prompts, or real nearby-place data are visible.</label>
<label><input type="checkbox" data-global="layoutSafe">Controls and key messages appear readable with no release-blocking clipping.</label>
<label><input type="checkbox" data-global="altTextReviewed">Every approved image has useful, accurate alt text.</label>
<label><input type="checkbox" data-global="humanBoundary">I understand this approves gallery images only; it does not replace physical-device or full gameplay QA.</label>
</div>
</section>
<section class="summary"><b id="counts">0 approved · 0 rejected · 18 pending</b><span id="readiness" class="blocked">Approval incomplete</span><div class="actions"><button id="approveAll">Approve all visible</button><button id="reset">Reset</button><button id="export" class="primary" disabled>Export approval JSON</button></div></section>
<section id="grid" class="grid"></section>
<p class="footer">Source commit: <code>${sourceCommit}</code> · Generated ${manifest.generatedAt}</p>
</main>
<script id="manifest" type="application/json">${safeJson(manifest)}</script>
<script>
(()=>{'use strict';
const manifest=JSON.parse(document.querySelector('#manifest').textContent);const key='larriverse.galleryApproval.'+manifest.sourceCommit;const $=s=>document.querySelector(s);let state=load();
function fresh(){return{reviewer:'',overallNotes:'',checks:{},entries:{},updatedAt:null}}
function load(){try{return{...fresh(),...JSON.parse(localStorage.getItem(key)||'null')}}catch{return fresh()}}
function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(key,JSON.stringify(state))}catch{}update()}
function entryState(id,entry){return state.entries[id]||{status:'pending',alt:entry.defaultAlt,note:''}}
function render(){const grid=$('#grid');grid.innerHTML='';for(const entry of manifest.entries){const current=entryState(entry.key,entry);const card=document.createElement('article');card.className='card';card.dataset.status=current.status;card.innerHTML='<img loading="lazy"><div class="body"><h2></h2><p class="meta"></p><div class="decision"><label><input type="radio" value="approved">Approve</label><label><input type="radio" value="rejected">Reject</label><label><input type="radio" value="pending">Pending</label></div><label>Alt text<textarea rows="3" maxlength="300"></textarea></label><label>Reviewer note<textarea class="note" rows="2" maxlength="400"></textarea></label></div>';card.querySelector('img').src=entry.path;card.querySelector('img').alt=current.alt;card.querySelector('h2').textContent=entry.title+' · '+(entry.project.startsWith('desktop')?'Desktop':'Mobile');card.querySelector('.meta').textContent=entry.cssViewport+' CSS viewport · '+entry.pixelWidth+'×'+entry.pixelHeight+' pixels · SHA-256 '+entry.sha256;card.querySelector('textarea').value=current.alt;card.querySelector('.note').value=current.note;const selected=card.querySelector('input[value="'+current.status+'"]');if(selected)selected.checked=true;card.querySelectorAll('input[type="radio"]').forEach(r=>r.addEventListener('change',()=>{const n=entryState(entry.key,entry);n.status=r.value;state.entries[entry.key]=n;card.dataset.status=r.value;save()}));const areas=card.querySelectorAll('textarea');areas[0].addEventListener('change',()=>{const n=entryState(entry.key,entry);n.alt=areas[0].value.trim().slice(0,300);state.entries[entry.key]=n;card.querySelector('img').alt=n.alt;save()});areas[1].addEventListener('change',()=>{const n=entryState(entry.key,entry);n.note=areas[1].value.trim().slice(0,400);state.entries[entry.key]=n;save()});grid.append(card)}}
function complete(){const entries=manifest.entries.map(e=>entryState(e.key,e));return state.reviewer.trim().length>=2&&Object.values(state.checks).filter(Boolean).length===5&&entries.every(e=>e.status==='approved'&&e.alt.trim().length>=20)}
function update(){const entries=manifest.entries.map(e=>entryState(e.key,e));const approved=entries.filter(e=>e.status==='approved').length,rejected=entries.filter(e=>e.status==='rejected').length,pending=18-approved-rejected;$('#counts').textContent=approved+' approved · '+rejected+' rejected · '+pending+' pending';const ready=complete();$('#readiness').textContent=ready?'Gallery approval ready to export':'Approval incomplete';$('#readiness').className=ready?'ready':'blocked';$('#export').disabled=!ready}
function exportApproval(){if(!complete())return;const approval={schema:'larriverse-gallery-approval',schemaVersion:1,release:manifest.release,candidate:manifest.candidate,sourceCommit:manifest.sourceCommit,workflowRunId:manifest.workflowRunId,manifestGeneratedAt:manifest.generatedAt,reviewer:state.reviewer.trim(),reviewedAt:new Date().toISOString(),overallNotes:state.overallNotes.trim()||null,checks:{...state.checks},entries:manifest.entries.map(e=>({key:e.key,project:e.project,subjectId:e.subjectId,path:e.path,sha256:e.sha256,status:entryState(e.key,e).status,alt:entryState(e.key,e).alt.trim(),note:entryState(e.key,e).note.trim()||null}))};const blob=new Blob([JSON.stringify(approval,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='larriverse-'+manifest.release+'-'+manifest.candidate+'-gallery-approval.json';a.click();URL.revokeObjectURL(url)}
$('#reviewer').value=state.reviewer;$('#overallNotes').value=state.overallNotes;$('#reviewer').addEventListener('change',e=>{state.reviewer=e.target.value.slice(0,60);save()});$('#overallNotes').addEventListener('change',e=>{state.overallNotes=e.target.value.slice(0,500);save()});document.querySelectorAll('[data-global]').forEach(box=>{box.checked=Boolean(state.checks[box.dataset.global]);box.addEventListener('change',()=>{state.checks[box.dataset.global]=box.checked;save()})});$('#approveAll').addEventListener('click',()=>{for(const e of manifest.entries){const n=entryState(e.key,e);n.status='approved';state.entries[e.key]=n}save();render()});$('#reset').addEventListener('click',()=>{if(!confirm('Reset this local gallery review?'))return;state=fresh();try{localStorage.removeItem(key)}catch{}location.reload()});$('#export').addEventListener('click',exportApproval);render();update();
})();
</script>
</body>
</html>`;
fs.writeFileSync(path.join(outputRoot, 'index.html'), html);
fs.writeFileSync(path.join(outputRoot, 'README.txt'), `LarriVerse Arcade ${release.version} ${release.candidate} gallery review\n\nOpen index.html in a modern browser. The page works offline, makes no network requests, and exports a JSON approval record only after all 18 images and five human checks are approved.\n`);
console.log(`Gallery review pack built: ${entries.length} screenshots, source ${sourceCommit}.`);
