const drawings = {
  drop: '<path d="M50 10C37 33 20 47 20 64a30 30 0 0 0 60 0C80 47 63 33 50 10" fill="#55c6ea"/><path d="M34 60q-5 17 13 21" fill="none" stroke="#c3f2ff" stroke-width="7" stroke-linecap="round"/>',
  seed: '<path d="M50 88V45" stroke="#438e60" stroke-width="8" stroke-linecap="round"/><path d="M48 52C12 56 12 20 18 19c33-2 40 17 30 33M52 41C80 46 93 19 87 13c-25-4-40 9-35 28" fill="#80cb76"/>',
  tree: '<rect x="43" y="52" width="15" height="39" rx="6" fill="#bb8759"/><path d="M23 62a20 20 0 0 1-4-34 24 24 0 0 1 45-9 22 22 0 0 1 18 38q-28 19-59 5" fill="#79c99b"/><circle cx="41" cy="33" r="14" fill="#a7e0ab"/>',
  wood: '<rect x="12" y="25" width="75" height="52" rx="13" fill="#bf8758"/><path d="M20 39h51M17 56h45M39 69h39" stroke="#e7bb83" stroke-width="5" stroke-linecap="round"/><circle cx="76" cy="52" r="17" fill="#f6c98b"/><circle cx="76" cy="52" r="9" fill="none" stroke="#b78254" stroke-width="3"/>',
  book: '<path d="M12 21q22-6 38 5 18-11 38-5v59q-22-5-38 4-19-10-38-4z" fill="#ad96ed"/><path d="M50 26v58M22 36h18M22 49h17M62 36h15M62 49h15" stroke="#fff5dc" stroke-width="5" stroke-linecap="round"/>',
  bread: '<path d="M20 37C9 13 38 8 50 16c19-9 42 1 31 22v43H20z" fill="#edb46e" stroke="#c48b50" stroke-width="4"/><path d="M32 42q-5-22 18-17 22-5 17 17v26H32z" fill="#ffe2a9"/>',
  beans: '<ellipse cx="50" cy="68" rx="37" ry="17" fill="#a7b9ed"/><path d="M13 51h74q-3 31-37 31T13 51" fill="#c5d7fa"/><g fill="#ba7771"><ellipse cx="34" cy="45" rx="13" ry="8" transform="rotate(-20 34 45)"/><ellipse cx="63" cy="46" rx="14" ry="8" transform="rotate(15 63 46)"/><ellipse cx="50" cy="33" rx="13" ry="8" transform="rotate(-30 50 33)"/></g>',
  apple: '<path d="M50 25c-30-21-52 14-31 48 14 22 24 9 31 10 9-1 19 11 31-10 24-38 0-67-31-48" fill="#f37e77"/><path d="M50 26V10M53 18q19-19 29-6-8 15-27 11" stroke="#4e9d69" stroke-width="6" stroke-linecap="round" fill="#82c879"/><path d="M30 39q-9 5-8 17" stroke="#ffd6b4" stroke-width="7" stroke-linecap="round"/>',
  carrot: '<path d="M44 32L24 91q47-29 50-51z" fill="#ffac59" stroke="#e59040" stroke-width="3"/><path d="M51 34L40 9M57 33L63 8M62 36L84 20" stroke="#72b56f" stroke-width="8" stroke-linecap="round"/><path d="M42 51l12 6M35 69l8 4" stroke="#e38340" stroke-width="4"/>',
  hut: '<rect x="22" y="41" width="60" height="47" rx="9" fill="#f4c08e"/><path d="M10 44L51 10 92 44z" fill="#ab92df"/><rect x="43" y="57" width="19" height="31" rx="6" fill="#947eac"/><rect x="27" y="53" width="12" height="14" rx="3" fill="#bdedec"/>',
  lighthouse: '<path d="M30 86l7-57h26l8 57z" fill="#fff4db"/><path d="M34 53h33v13H32z" fill="#f39484"/><rect x="34" y="15" width="32" height="22" rx="5" fill="#79c7df"/><path d="M27 15L50 3 73 15z" fill="#ad91d7"/><path d="M18 87h64" stroke="#889eb0" stroke-width="8" stroke-linecap="round"/>',
  market: '<rect x="18" y="38" width="64" height="50" rx="6" fill="#edcba0"/><path d="M9 39l11-22h60l11 22z" fill="#ff9b8b"/><path d="M24 17l-5 22M43 17v22M62 17l5 22M81 17l10 22" stroke="#fff2d6" stroke-width="10"/><rect x="26" y="55" width="49" height="20" rx="4" fill="#c09372"/>',
  ramp: '<path d="M12 80h77V30L12 70z" fill="#ad9ad7"/><path d="M15 67L85 27M15 48L85 8M18 47v20M81 12v18" fill="none" stroke="#c6a17d" stroke-width="6" stroke-linecap="round"/>',
  bench: '<path d="M15 35h70v22H15zM10 62h80v10H10z" fill="#d4a579"/><path d="M22 72v16M77 72v16" stroke="#827d99" stroke-width="8" stroke-linecap="round"/><path d="M18 45h64" stroke="#efd0a7" stroke-width="4"/>',
  pencil: '<path d="M24 82L70 13 85 25 39 92z" fill="#ffcd68"/><path d="M70 13l5-8q8-3 15 9l-5 11z" fill="#f7a29c"/><path d="M24 82l15 10-20 4z" fill="#c9a07b"/><path d="M19 96l3-9 6 6z" fill="#595570"/>',
  boat: '<path d="M9 63h82L75 87H28z" fill="#e69772"/><path d="M49 16v50" stroke="#8f869a" stroke-width="5"/><path d="M44 17L18 58h26z" fill="#fff3cf"/><path d="M54 24l27 30H54z" fill="#b7a5ee"/><path d="M10 92q13-7 25 0t25 0 25 0" stroke="#6bc9d6" stroke-width="5" fill="none"/>',
  robot: '<rect x="18" y="24" width="64" height="53" rx="20" fill="#b7b2f4"/><rect x="27" y="35" width="46" height="24" rx="10" fill="#dff4ee"/><circle cx="39" cy="46" r="4" fill="#5f647d"/><circle cx="60" cy="46" r="4" fill="#5f647d"/><path d="M40 65q10 7 20 0M50 24V12" stroke="#6c6994" stroke-width="4" fill="none"/><circle cx="50" cy="10" r="5" fill="#ffd371"/><circle cx="27" cy="81" r="9" fill="#777b9b"/><circle cx="73" cy="81" r="9" fill="#777b9b"/>',
  coin: '<circle cx="50" cy="50" r="35" fill="#ffd46f" stroke="#e5b25b" stroke-width="6"/><path d="M50 25l7 16 18 3-14 13 3 18-14-9-16 9 3-18-12-13 18-3z" fill="#ffedb5"/>',
  key: '<circle cx="35" cy="35" r="20" fill="none" stroke="#ffd37c" stroke-width="12"/><path d="M48 50l34 33M66 67l12-12M76 77l12-12" stroke="#ffd37c" stroke-width="12" stroke-linecap="round"/>',
  music: '<path d="M38 73V25l40-9v48M38 36l40-9" stroke="#ae93e7" stroke-width="8" fill="none"/><ellipse cx="27" cy="76" rx="15" ry="11" fill="#e4a0ca"/><ellipse cx="67" cy="68" rx="15" ry="11" fill="#e4a0ca"/>',
  sun: '<g stroke="#f8c66b" stroke-width="6" stroke-linecap="round"><path d="M50 7v10M50 83v10M7 50h10M83 50h10M19 19l8 8M73 73l8 8M19 81l8-8M73 27l8-8"/></g><circle cx="50" cy="50" r="25" fill="#ffda81"/>',
};
export const iconDrawing = name => drawings[name] || drawings.seed;
export const iconSvg = (name, className = "object-icon") => `<svg class="${className}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${iconDrawing(name)}</svg>`;
const themes = {
  budget: ["coin", "boat", "tree"], messages: ["key", "hut", "robot"], conversation: ["tree", "bench", "book"], news: ["book", "market", "key"],
  repair: ["wood", "robot", "hut"], route: ["tree", "lighthouse", "boat"], garden: ["carrot", "seed", "tree"], energy: ["sun", "hut", "seed"],
  sorting: ["book", "seed", "wood"], robot: ["robot", "hut", "key"], market: ["market", "apple", "coin"], music: ["music", "music", "music"],
  bridge: ["wood", "boat", "tree"], pipes: ["drop", "hut", "drop"], harbor: ["boat", "lighthouse", "boat"], pantry: ["bread", "apple", "carrot"],
  compass: ["lighthouse", "tree", "boat"], cipher: ["key", "hut", "key"], trade: ["market", "coin", "apple"], town: ["tree", "hut", "ramp"],
};
export function mountScene(world) {
  const scene = document.createElement("div");
  scene.className = "world-scene";
  scene.setAttribute("aria-hidden", "true");
  const items = themes[world.mode] || themes.town;
  scene.innerHTML = `<svg viewBox="0 0 800 180" focusable="false"><rect width="800" height="180" rx="22" fill="#e4f2f5"/><circle cx="676" cy="40" r="25" fill="#ffe3a3"/><g class="scene-cloud" fill="#fffaf0"><ellipse cx="130" cy="37" rx="45" ry="13"/><circle cx="119" cy="27" r="18"/><circle cx="143" cy="29" r="14"/></g><path d="M0 110Q160 36 300 117T800 95V180H0" fill="#bce0ba"/><path d="M0 149Q190 95 357 144T800 133V180H0" fill="#96cab2"/><path d="M0 170Q255 134 490 167T800 162V180H0" fill="#7bcfd1"/>${items.map((item,index) => `<g class="scene-object" style="--delay:${index}s" transform="translate(${220 + index * 155} 57) scale(.92)">${iconDrawing(item)}</g>`).join("")}<g class="scene-friend" transform="translate(68 109)"><path d="M0 27Q-2-12 22-12T45 27q-22 15-45 0" fill="#c6b0ed"/><circle cx="14" cy="10" r="3" fill="#5a556f"/><circle cx="31" cy="10" r="3" fill="#5a556f"/><path d="M18 19q6 5 11 0" stroke="#5a556f" stroke-width="2" fill="none"/></g><g class="scene-friend" style="--delay:1s" transform="translate(710 112)"><path d="M0 25Q-2-12 22-12T45 25q-22 15-45 0" fill="#ffd18a"/><circle cx="14" cy="10" r="3" fill="#5a556f"/><circle cx="31" cy="10" r="3" fill="#5a556f"/><path d="M18 19q6 5 11 0" stroke="#5a556f" stroke-width="2" fill="none"/></g></svg>`;
  document.querySelector(".play-card").prepend(scene);
}
