const palette=['#8b5cf6','#ff4ecd','#ffd43b','#41e5ff','#70f0a8','#ff8e3c'];
const grid=document.querySelector('#gameGrid');
const filters=document.querySelector('#filters');
const search=document.querySelector('#search');
const randomButton=document.querySelector('#randomGame');
let games=[];
let category='All';

function card(game,index){
  const badges=[game.category,game.status].map(x=>`<span>${x}</span>`).join('');
  const action=game.available
    ? `<a class="launch" href="${game.href}"><span>Launch game</span><span>START ↗</span></a>`
    : `<div class="launch queued" title="The recovered source is packaged and queued for import"><span>Import queued</span><span>◌</span></div>`;
  return `<article class="game-card" style="--glow:${palette[index%palette.length]}">
    <div class="game-icon">${game.icon}</div><div class="game-badges">${badges}</div>
    <h3>${game.title}</h3><p>${game.desc}</p>${action}</article>`;
}
function render(){
  const q=search.value.trim().toLowerCase();
  const visible=games.filter(g=>(category==='All'||g.category===category)&&(!q||`${g.title} ${g.desc} ${g.category}`.toLowerCase().includes(q)));
  grid.innerHTML=visible.length?visible.map(card).join(''):'<p class="empty">No cabinet matches that search. The arcade gremlins deny everything.</p>';
}
function renderFilters(){
  const cats=['All',...new Set(games.map(g=>g.category))];
  filters.innerHTML=cats.map(c=>`<button class="filter ${c===category?'active':''}" data-category="${c}">${c}</button>`).join('');
  filters.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.category;renderFilters();render();}));
}
fetch('games/catalog.json').then(r=>r.json()).then(data=>{
  games=data;
  document.querySelector('#gameCount').textContent=games.length;
  renderFilters();render();
  const featured=games.filter(g=>g.featured);let i=0;
  if(featured.length){setInterval(()=>{i=(i+1)%featured.length;document.querySelector('#screenIcon').textContent=featured[i].icon;document.querySelector('#screenTitle').textContent=featured[i].title;},2600);}
  const playable=games.filter(g=>g.available);
  randomButton.disabled=!playable.length;
  randomButton.title=playable.length?'Launch a random game':'Game files are packaged and queued for import';
  randomButton.addEventListener('click',()=>{if(playable.length)location.href=playable[Math.floor(Math.random()*playable.length)].href;});
}).catch(()=>{grid.innerHTML='<p class="empty">The catalog did not load. Serve this folder over HTTP instead of opening the file directly.</p>';randomButton.disabled=true;});
search.addEventListener('input',render);
