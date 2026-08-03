const palette=['#8b5cf6','#ff4ecd','#ffd43b','#41e5ff','#70f0a8','#ff8e3c'];
const grid=document.querySelector('#gameGrid');
const filters=document.querySelector('#filters');
const search=document.querySelector('#search');
const randomButton=document.querySelector('#randomGame');
let games=[];
let category='All';

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function card(game,index){
  const badges=[game.category,game.status].map(x=>`<span>${escapeHtml(x)}</span>`).join('');
  const action=game.available
    ? `<a class="launch" href="${encodeURI(game.href)}"><span>Launch game</span><span>START ↗</span></a>`
    : `<div class="launch queued" title="This recovered concept is being integrated with the shared arcade system"><span>Integration queued</span><span>◌</span></div>`;
  return `<article class="game-card" style="--glow:${palette[index%palette.length]}">
    <div class="game-icon">${escapeHtml(game.icon)}</div><div class="game-badges">${badges}</div>
    <h3>${escapeHtml(game.title)}</h3><p>${escapeHtml(game.desc)}</p>${action}</article>`;
}

function render(){
  const q=search.value.trim().toLowerCase();
  const visible=games.filter(g=>(category==='All'||g.category===category)&&(!q||`${g.title} ${g.desc} ${g.category}`.toLowerCase().includes(q)));
  grid.innerHTML=visible.length?visible.map(card).join(''):'<p class="empty">No cabinet matches that search. The arcade gremlins deny everything.</p>';
}

function renderFilters(){
  const cats=['All',...new Set(games.map(g=>g.category))];
  filters.innerHTML=cats.map(c=>`<button class="filter ${c===category?'active':''}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');
  filters.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.category;renderFilters();render();}));
}

function renderProfile(){
  const node=document.querySelector('#profileStat');
  if(!node||!window.LarriVerseArcade)return;
  const profile=window.LarriVerseArcade.summary();
  node.innerHTML=`<b>${escapeHtml(profile.avatar)}</b> ${escapeHtml(profile.name)} · Level ${profile.level} · ${profile.kc} KC`;
}

fetch('games/catalog.json').then(r=>{
  if(!r.ok)throw new Error(`Catalog request failed: ${r.status}`);
  return r.json();
}).then(data=>{
  games=data;
  const playable=games.filter(g=>g.available);
  document.querySelector('#gameCount').textContent=games.length;
  document.querySelector('#playableCount').textContent=playable.length;
  renderFilters();render();renderProfile();

  const featured=games.filter(g=>g.featured);let i=0;
  if(featured.length){
    const rotate=()=>{const game=featured[i%featured.length];document.querySelector('#screenIcon').textContent=game.icon;document.querySelector('#screenTitle').textContent=game.title;i+=1;};
    rotate();setInterval(rotate,2600);
  }

  randomButton.disabled=!playable.length;
  randomButton.title=playable.length?'Launch a random playable cabinet':'Playable cabinets are being integrated';
  randomButton.addEventListener('click',()=>{if(playable.length)location.href=playable[Math.floor(Math.random()*playable.length)].href;});
}).catch(error=>{
  console.error(error);
  grid.innerHTML='<p class="empty">The catalog did not load. Serve this folder over HTTP instead of opening the file directly.</p>';
  randomButton.disabled=true;
});

search.addEventListener('input',render);
window.addEventListener('larriverse:profile',renderProfile);
