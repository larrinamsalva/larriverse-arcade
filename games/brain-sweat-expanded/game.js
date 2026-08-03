(() => {
  'use strict';

  const GAME_ID = 'brain-sweat-expanded';
  const SAVE_KEY = 'larriverse.brainSweatExpanded.v1';
  const TODAY = () => new Date().toISOString().slice(0, 10);
  const $ = selector => document.querySelector(selector);
  const fresh = () => ({
    guideId: 'rufus',
    completed: {},
    worldMasteryAwarded: [],
    questDates: {},
    practiceDates: [],
    attempts: {},
    lastWorldId: null,
    lastTierId: null
  });

  let manifest = null;
  let state = loadState();
  let filter = 'all';
  let query = '';
  let activeWorld = null;
  let activeTier = null;
  let activeIndex = 0;
  let selectedTools = [];
  let ledgerBalance = 0;
  let challengeSolved = false;

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      return {
        ...fresh(),
        ...raw,
        completed: raw.completed && typeof raw.completed === 'object' ? raw.completed : {},
        attempts: raw.attempts && typeof raw.attempts === 'object' ? raw.attempts : {},
        worldMasteryAwarded: Array.isArray(raw.worldMasteryAwarded) ? raw.worldMasteryAwarded : [],
        practiceDates: Array.isArray(raw.practiceDates) ? raw.practiceDates : [],
        questDates: raw.questDates && typeof raw.questDates === 'object' ? raw.questDates : {}
      };
    } catch {
      return fresh();
    }
  }

  function saveState() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function profile() {
    return window.LarriVerseArcade?.summary?.() || { avatar: '🌟', level: 1, kc: 0 };
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function tierItems(tier) {
    return tier.scenarios || tier.transactions || [];
  }

  function reviewedTiers(world) {
    return world.tiers.filter(tier => tier.status === 'reviewed');
  }

  function playableCount(world) {
    return reviewedTiers(world).reduce((sum, tier) => sum + tierItems(tier).length, 0);
  }

  function completedIdsForWorld(world) {
    const ids = new Set();
    reviewedTiers(world).forEach(tier => tierItems(tier).forEach(item => ids.add(item.id)));
    return [...ids].filter(id => state.completed[id]).length;
  }

  function worldPercent(world) {
    const total = playableCount(world);
    return total ? Math.round(completedIdsForWorld(world) / total * 100) : 0;
  }

  function init() {
    return fetch('activities.json')
      .then(response => {
        if (!response.ok) throw new Error(`Could not load activity map (${response.status})`);
        return response.json();
      })
      .then(data => {
        manifest = data;
        bindControls();
        renderAll();
      });
  }

  function bindControls() {
    $('#search').addEventListener('input', event => {
      query = event.target.value.trim().toLowerCase();
      renderWorlds();
    });
    $('#filters').addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      filter = button.dataset.filter;
      $('#filters').querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
      renderWorlds();
    });
    $('#continueButton').addEventListener('click', continuePractice);
    $('#surpriseButton').addEventListener('click', surpriseChallenge);
    $('#reportButton').addEventListener('click', openReport);
    $('#closeWorld').addEventListener('click', closeWorld);
    $('#previousChallenge').addEventListener('click', () => moveChallenge(-1));
    $('#nextChallenge').addEventListener('click', () => moveChallenge(1));
    $('#resultWorlds').addEventListener('click', () => {
      $('#resultDialog').close();
      closeWorld();
    });
    $('#resultNext').addEventListener('click', () => {
      $('#resultDialog').close();
      moveChallenge(1);
    });
    window.addEventListener('larriverse:profile', renderProfile);
  }

  function renderAll() {
    renderProfile();
    renderStats();
    renderGuides();
    renderQuests();
    renderWorlds();
    $('#sourceSummary').textContent = `${manifest.source.skillWorldCount} worlds · ${manifest.source.activityCount} source activities · ${manifest.integration.playableActivityCount} reviewed now`;
  }

  function renderProfile() {
    const p = profile();
    $('#sharedAvatar').textContent = p.avatar || '🌟';
    $('#sharedLevel').textContent = `Level ${p.level || 1}`;
    $('#sharedKc').textContent = `${p.kc || 0} KC`;
  }

  function renderStats() {
    $('#readyWorlds').textContent = manifest.integration.playableWorldCount;
    $('#readyActivities').textContent = manifest.integration.playableActivityCount;
    $('#completedActivities').textContent = Object.keys(state.completed).filter(id => state.completed[id]).length;
    $('#dayRhythm').textContent = calculateRhythm();
  }

  function calculateRhythm() {
    const dates = [...new Set(state.practiceDates)].sort().reverse();
    if (!dates.length) return 0;
    let cursor = new Date(`${TODAY()}T12:00:00Z`);
    const today = dates.includes(TODAY());
    if (!today) cursor.setUTCDate(cursor.getUTCDate() - 1);
    let count = 0;
    for (const date of dates) {
      const expected = cursor.toISOString().slice(0, 10);
      if (date !== expected) continue;
      count += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return count;
  }

  function renderGuides() {
    $('#guideRow').innerHTML = manifest.guides.map(guide => `
      <button class="guide-card ${guide.id === state.guideId ? 'selected' : ''}" data-guide="${guide.id}">
        <span>${guide.icon}</span><div><b>${esc(guide.name)}</b><small>${esc(guide.role)}</small></div>
      </button>`).join('');
    $('#guideRow').querySelectorAll('[data-guide]').forEach(button => button.addEventListener('click', () => {
      state.guideId = button.dataset.guide;
      saveState();
      renderGuides();
    }));
  }

  function questDone(quest) {
    return state.questDates[quest.id] === TODAY();
  }

  function renderQuests() {
    $('#questDate').textContent = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date());
    $('#questGrid').innerHTML = manifest.dailyQuests.map(quest => `
      <article class="quest-card ${questDone(quest) ? 'done' : ''}">
        <b>${questDone(quest) ? '✓ ' : ''}${esc(quest.label)}</b>
        <small>${questDone(quest) ? 'Completed today' : `+${quest.reward.kc} KC · +${quest.reward.xp} XP`}</small>
      </article>`).join('');
  }

  function worldStatus(world) {
    const ready = world.tiers.some(tier => tier.status === 'reviewed');
    const queued = world.tiers.some(tier => tier.status === 'review-queued');
    return { ready, queued };
  }

  function renderWorlds() {
    const worlds = manifest.worlds.filter(world => {
      const status = worldStatus(world);
      if (filter === 'reviewed' && !status.ready) return false;
      if (filter === 'review-queued' && !status.queued) return false;
      const haystack = `${world.title} ${world.mode} ${world.guideTip}`.toLowerCase();
      return !query || haystack.includes(query);
    });

    $('#worldGrid').innerHTML = worlds.length ? worlds.map(world => {
      const status = worldStatus(world);
      const ready = playableCount(world);
      const completed = completedIdsForWorld(world);
      const percent = worldPercent(world);
      const description = status.ready
        ? `${ready} reviewed ${ready === 1 ? 'activity' : 'activities'} ready. ${status.queued ? 'Higher tiers remain review queued.' : 'All source tiers are represented.'}`
        : world.tiers.find(tier => tier.reviewNote)?.reviewNote || 'Qualified review required.';
      return `<article class="world-card" style="--accent:${world.color}">
        <div class="world-top"><div class="world-icon">${world.icon}</div><span class="status-pill ${status.ready ? 'ready' : 'queued'}">${status.ready ? 'Ready' : 'Review queued'}</span></div>
        <h3>${esc(world.title)}</h3>
        <p>${esc(description)}</p>
        <div class="world-meta"><span>${world.sourceCount} source items</span><span>${completed}/${ready || 0} practiced</span></div>
        <div class="world-progress"><div style="width:${percent}%"></div></div>
        <button class="${status.ready ? 'primary' : 'secondary'}" data-world="${world.id}">${status.ready ? (completed ? 'Continue world' : 'Open world') : 'View review gate'}</button>
      </article>`;
    }).join('') : '<p class="loading">No worlds match that search.</p>';

    $('#worldGrid').querySelectorAll('[data-world]').forEach(button => button.addEventListener('click', () => openWorld(button.dataset.world)));
  }

  function continuePractice() {
    const preferred = manifest.worlds.find(world => world.id === state.lastWorldId && playableCount(world))
      || manifest.worlds.find(world => playableCount(world) && worldPercent(world) < 100)
      || manifest.worlds.find(world => playableCount(world));
    if (preferred) openWorld(preferred.id, state.lastTierId);
  }

  function surpriseChallenge() {
    const choices = [];
    manifest.worlds.forEach(world => reviewedTiers(world).forEach(tier => {
      tierItems(tier).forEach((item, index) => choices.push({ world, tier, item, index }));
    }));
    if (!choices.length) return;
    const pick = choices[Math.floor(Math.random() * choices.length)];
    openWorld(pick.world.id, pick.tier.id, pick.index);
  }

  function openWorld(worldId, tierId, index = 0) {
    activeWorld = manifest.worlds.find(world => world.id === worldId);
    if (!activeWorld) return;
    activeTier = activeWorld.tiers.find(tier => tier.id === tierId)
      || activeWorld.tiers.find(tier => tier.status === 'reviewed')
      || activeWorld.tiers[0];
    activeIndex = Math.max(0, index);
    state.lastWorldId = activeWorld.id;
    state.lastTierId = activeTier.id;
    saveState();
    renderWorldDialog();
    $('#worldDialog').showModal();
  }

  function closeWorld() {
    if ($('#worldDialog').open) $('#worldDialog').close();
    activeWorld = null;
    activeTier = null;
    renderAll();
  }

  function renderWorldDialog() {
    const guide = manifest.guides.find(item => item.id === state.guideId) || manifest.guides[0];
    $('#worldTitle').textContent = `${activeWorld.icon} ${activeWorld.title}`;
    $('#worldMode').textContent = activeWorld.mode.replace('-', ' ');
    $('#guideIcon').textContent = guide.icon;
    $('#guideName').textContent = `${guide.name} says`;
    $('#tierTabs').innerHTML = activeWorld.tiers.map(tier => `
      <button class="${tier.id === activeTier.id ? 'active' : ''}" data-tier="${tier.id}">${tier.title}${tier.status === 'review-queued' ? ' 🔒' : ''}</button>`).join('');
    $('#tierTabs').querySelectorAll('[data-tier]').forEach(button => button.addEventListener('click', () => {
      activeTier = activeWorld.tiers.find(tier => tier.id === button.dataset.tier);
      activeIndex = 0;
      state.lastTierId = activeTier.id;
      saveState();
      renderWorldDialog();
    }));

    const items = tierItems(activeTier);
    const complete = items.filter(item => state.completed[item.id]).length;
    $('#worldProgress').textContent = activeTier.status === 'reviewed' ? `${complete} / ${items.length}` : `${activeTier.sourceCount} source items`;
    $('#previousChallenge').disabled = activeTier.status !== 'reviewed' || items.length < 2;
    $('#nextChallenge').disabled = activeTier.status !== 'reviewed' || items.length < 2;

    if (activeTier.status !== 'reviewed') {
      $('#challengePanel').hidden = true;
      $('#lockedPanel').hidden = false;
      $('#lockedPanel').innerHTML = `<div class="lock-icon">🔒</div><h3>${esc(activeTier.title)} is review queued</h3><p>${esc(activeTier.reviewNote)}</p><p><b>${activeTier.sourceCount}</b> source activities remain represented in the audit, but no actionable instructions are published here.</p>`;
      return;
    }

    $('#lockedPanel').hidden = true;
    $('#challengePanel').hidden = false;
    if (activeIndex >= items.length) activeIndex = 0;
    challengeSolved = false;
    selectedTools = [];
    const item = items[activeIndex];
    $('#scenarioNumber').textContent = `${activeTier.title} · ${activeIndex + 1} of ${items.length}`;
    $('#rewardBadge').textContent = `+${activeTier.reward.kc} KC · +${activeTier.reward.xp} XP`;
    $('#scenarioTitle').textContent = item.title || item.description;
    $('#scenarioDescription').textContent = item.description;
    $('#scenarioHint').textContent = item.hint || activeWorld.guideTip;
    $('#feedback').textContent = state.completed[item.id] ? '✓ Practiced before — repeat rewards are smaller.' : '';
    if (activeWorld.mode === 'tool-sequence') renderToolChallenge(item);
    else if (activeWorld.mode === 'choice') renderChoiceChallenge(item);
    else if (activeWorld.mode === 'ledger') renderLedgerChallenge(item);
  }

  function moveChallenge(delta) {
    if (!activeTier || activeTier.status !== 'reviewed') return;
    const items = tierItems(activeTier);
    activeIndex = (activeIndex + delta + items.length) % items.length;
    renderWorldDialog();
  }

  function renderToolChallenge(item) {
    const tools = activeWorld.tools || [];
    $('#challengeBody').innerHTML = `<div class="tool-grid">${tools.map(tool => `<button class="tool-button" data-tool="${tool.id}"><span>${tool.icon}</span><b>${esc(tool.name)}</b></button>`).join('')}</div>`;
    $('#challengeBody').querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => chooseTool(item, button.dataset.tool, button)));
  }

  function chooseTool(item, toolId, button) {
    if (challengeSolved) return;
    const expected = item.requiredTools[selectedTools.length];
    state.attempts[item.id] = (state.attempts[item.id] || 0) + 1;
    if (toolId !== expected) {
      button.classList.add('wrong');
      $('#feedback').textContent = 'Try a different tool first. This is a source-order puzzle, not real-world repair permission.';
      setTimeout(() => button.classList.remove('wrong'), 450);
      saveState();
      return;
    }
    selectedTools.push(toolId);
    button.classList.add('used');
    button.disabled = true;
    $('#feedback').textContent = `Step ${selectedTools.length} of ${item.requiredTools.length} matched.`;
    saveState();
    if (selectedTools.length === item.requiredTools.length) solveChallenge(item);
  }

  function renderChoiceChallenge(item) {
    $('#challengeBody').innerHTML = `<div class="answer-grid">${item.actions.map(action => `<button class="answer-button" data-action="${action.id}"><span>${action.icon}</span><b>${esc(action.label)}</b></button>`).join('')}</div>`;
    $('#challengeBody').querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => chooseAction(item, button.dataset.action, button)));
  }

  function chooseAction(item, actionId, button) {
    if (challengeSolved) return;
    state.attempts[item.id] = (state.attempts[item.id] || 0) + 1;
    if (actionId !== item.correct) {
      button.classList.add('wrong');
      $('#feedback').textContent = 'That does not match the recovered scenario’s marked answer. Try again.';
      saveState();
      return;
    }
    button.classList.add('correct');
    $('#challengeBody').querySelectorAll('button').forEach(itemButton => { itemButton.disabled = true; });
    solveChallenge(item);
  }

  function renderLedgerChallenge(item) {
    if (activeIndex === 0 || !Number.isFinite(ledgerBalance)) ledgerBalance = activeTier.startBalance;
    $('#scenarioTitle').textContent = item.description;
    $('#scenarioDescription').textContent = 'Classify this source transaction, then update the simulated balance.';
    $('#scenarioHint').textContent = activeWorld.guideTip;
    $('#challengeBody').innerHTML = `<div class="ledger-card"><span>Transaction amount</span><strong>$${item.amount}</strong><div class="ledger-balance"><span>Starting balance</span><b>$${ledgerBalance}</b></div><div class="ledger-grid"><button class="ledger-button" data-ledger="deposit">＋ Deposit</button><button class="ledger-button" data-ledger="withdrawal">－ Withdrawal</button></div></div>`;
    $('#challengeBody').querySelectorAll('[data-ledger]').forEach(button => button.addEventListener('click', () => chooseLedger(item, button.dataset.ledger, button)));
  }

  function chooseLedger(item, type, button) {
    if (challengeSolved) return;
    state.attempts[item.id] = (state.attempts[item.id] || 0) + 1;
    if (type !== item.type) {
      button.classList.add('wrong');
      $('#feedback').textContent = 'Check whether money enters or leaves the account.';
      saveState();
      return;
    }
    button.classList.add('correct');
    ledgerBalance = type === 'deposit' ? ledgerBalance + item.amount : Math.max(0, ledgerBalance - item.amount);
    $('#feedback').textContent = `Correct. New simulated balance: $${ledgerBalance}.`;
    solveChallenge(item);
  }

  function solveChallenge(item) {
    if (challengeSolved) return;
    challengeSolved = true;
    const firstTime = !state.completed[item.id];
    state.completed[item.id] = true;
    if (!state.practiceDates.includes(TODAY())) state.practiceDates.push(TODAY());
    saveState();

    const baseKc = firstTime ? activeTier.reward.kc : 1;
    const baseXp = firstTime ? activeTier.reward.xp : 3;
    const award = window.LarriVerseArcade?.award?.(GAME_ID, {
      kc: baseKc,
      xp: baseXp,
      score: activeTier.id === 'adv' ? 90 : activeTier.id === 'int' ? 75 : 65,
      completed: true,
      metrics: {
        activitiesCompleted: firstTime ? 1 : 0,
        practiceRuns: 1,
        reviewedWorldsVisited: 1
      }
    });

    const unlocks = [];
    const quest = manifest.dailyQuests.find(itemQuest => itemQuest.worldId === activeWorld.id && !questDone(itemQuest));
    if (quest) {
      state.questDates[quest.id] = TODAY();
      window.LarriVerseArcade?.award?.(GAME_ID, {
        kc: quest.reward.kc,
        xp: quest.reward.xp,
        completed: false,
        metrics: { dailyQuestsCompleted: 1 }
      });
      unlocks.push(`Daily quest complete: ${quest.label}`);
    }

    const total = playableCount(activeWorld);
    const complete = completedIdsForWorld(activeWorld);
    if (total && complete === total && !state.worldMasteryAwarded.includes(activeWorld.id)) {
      state.worldMasteryAwarded.push(activeWorld.id);
      window.LarriVerseArcade?.award?.(GAME_ID, {
        kc: 9,
        xp: 36,
        completed: true,
        metrics: { reviewedWorldsCompleted: 1 }
      });
      unlocks.push(`${activeWorld.title} reviewed-world completion bonus`);
    }
    saveState();

    $('#resultIcon').textContent = activeWorld.icon;
    $('#resultTitle').textContent = firstTime ? 'New activity practiced!' : 'Practice reinforced!';
    $('#resultText').textContent = firstTime
      ? `${item.title || item.description} is now recorded in your device-local skill tree.`
      : 'Repeating a challenge still counts as practice, with a smaller arcade reward.';
    $('#resultKc').textContent = `+${baseKc} KC`;
    $('#resultXp').textContent = `+${baseXp} XP`;
    $('#resultUnlocks').innerHTML = [...unlocks, ...(award?.unlocked || [])].map(text => `<div>✦ ${esc(text)}</div>`).join('');
    renderAll();
    setTimeout(() => $('#resultDialog').showModal(), 180);
  }

  function openReport() {
    $('#reportGrid').innerHTML = manifest.worlds.map(world => {
      const ready = playableCount(world);
      const completed = completedIdsForWorld(world);
      const percent = worldPercent(world);
      return `<article class="report-row"><div class="report-row-top"><b>${world.icon} ${esc(world.title)}</b><span>${ready ? `${percent}%` : 'Locked'}</span></div><small>${completed}/${ready} reviewed activities practiced · ${world.sourceCount} source items represented</small><div class="world-progress"><div style="width:${percent}%;background:${world.color}"></div></div></article>`;
    }).join('');
    $('#auditBox').innerHTML = `<b>Recovered source audit</b><ul>
      <li>${manifest.source.skillWorldCount} skill worlds: ${manifest.source.toolWorldCount} tool-sequence worlds, ${manifest.source.actionWorldCount} action-choice worlds, one checkbook simulation, and one voltage circuit world.</li>
      <li>${manifest.source.activityCount} total source activities: ${manifest.source.checkbookTransactionCount} checkbook transactions and ${manifest.source.voltageCircuitCount} circuit challenges included in that count.</li>
      <li>${manifest.source.guideCount} guides and ${manifest.source.dailyQuestCount} daily quest slots preserved as design roots.</li>
      <li>${manifest.integration.playableActivityCount} activities are published in this reviewed release. Review-queued tiers contain counts and explanations but no actionable payload.</li>
      <li>Source terminology is preserved; LarriVerse rewards are scaled to fictional 3·6·9 KC rather than copying the prototype’s larger static KZC numbers.</li>
    </ul>`;
    $('#reportDialog').showModal();
  }

  init().catch(error => {
    document.body.innerHTML = `<main><section class="notice-card"><span>🧰</span><div><strong>Brain Sweat Expanded could not load.</strong><p>${esc(error.message)}</p><p><a class="back-link" href="../../index.html">Return to the arcade</a></p></div></section></main>`;
  });
})();
