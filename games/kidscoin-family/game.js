(() => {
  'use strict';

  const ID = 'kidscoin-family';
  const KEY = 'larriverse.kidscoinFamily.v1';
  const $ = selector => document.querySelector(selector);
  const uid = () => crypto.randomUUID?.() || String(Date.now() + Math.random());
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const shuffle = list => [...list].sort(() => Math.random() - 0.5);

  const day = () => {
    const date = new Date();
    if (date.getHours() < 6) date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
  };
  const previousDay = key => {
    const date = new Date(`${key}T12:00:00`);
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
  };

  const profile = (name = 'Explorer', avatar = '🦁', id = uid()) => ({
    id,
    name,
    avatar,
    balance: 0,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastDay: null,
    graceDays: 0,
    claimed: [],
    lessons: [],
    lessonProgress: {},
    tx: [],
    notes: []
  });

  const fresh = () => ({
    version: 2,
    profiles: [profile('Explorer', '🦁', 'explorer-1')],
    active: 'explorer-1',
    approvals: [],
    redemptions: [],
    customTasks: [],
    customRewards: [],
    taskAssignments: {},
    pin: null,
    notifications: []
  });

  let manifest;
  let state = load();
  let tab = 'home';
  let parentTab = 'approvals';
  let activeLessonRound = null;

  function normalizeProfile(source) {
    const clean = {
      ...profile(source?.name, source?.avatar, source?.id),
      ...(source || {})
    };
    clean.tx = Array.isArray(source?.tx) ? source.tx : [];
    clean.notes = Array.isArray(source?.notes) ? source.notes : [];
    clean.lessons = Array.isArray(source?.lessons) ? source.lessons : [];
    clean.claimed = Array.isArray(source?.claimed) ? source.claimed : [];
    clean.lessonProgress = source?.lessonProgress && typeof source.lessonProgress === 'object'
      ? source.lessonProgress
      : {};
    return clean;
  }

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (!parsed?.profiles?.length) return fresh();
      return {
        ...fresh(),
        ...parsed,
        version: 2,
        profiles: parsed.profiles.map(normalizeProfile),
        approvals: Array.isArray(parsed.approvals) ? parsed.approvals : [],
        redemptions: Array.isArray(parsed.redemptions) ? parsed.redemptions : [],
        customTasks: Array.isArray(parsed.customTasks) ? parsed.customTasks : [],
        customRewards: Array.isArray(parsed.customRewards) ? parsed.customRewards : [],
        taskAssignments: parsed.taskAssignments && typeof parsed.taskAssignments === 'object'
          ? parsed.taskAssignments
          : {},
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
      };
    } catch {
      return fresh();
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function activeProfile() {
    let current = state.profiles.find(item => item.id === state.active);
    if (!current) {
      current = state.profiles[0];
      state.active = current.id;
      save();
    }
    return current;
  }

  function allTasks() {
    return [...manifest.tasks, ...state.customTasks];
  }

  function allRewards() {
    return [...manifest.rewards, ...state.customRewards];
  }

  function ensureAssignments() {
    const validProfiles = new Set(state.profiles.map(item => item.id));
    for (const task of allTasks()) {
      const current = state.taskAssignments[task.id];
      if (current === 'all' || validProfiles.has(current)) continue;
      state.taskAssignments[task.id] = 'all';
    }
    save();
  }

  function assignmentFor(taskId) {
    return state.taskAssignments[taskId] || 'all';
  }

  function tasksFor(profileId) {
    return allTasks().filter(task => {
      const assignment = assignmentFor(task.id);
      return assignment === 'all' || assignment === profileId;
    });
  }

  function addTransaction(profileState, type, amount, label, icon = '🪙') {
    profileState.tx.unshift({
      id: uid(),
      type,
      amount,
      label,
      icon,
      at: new Date().toISOString()
    });
    profileState.tx = profileState.tx.slice(0, 100);
  }

  function notification(message, icon = '🔔') {
    state.notifications.unshift({ id: uid(), message, icon, at: new Date().toISOString() });
    state.notifications = state.notifications.slice(0, 50);
  }

  function multiplier(profileState) {
    return [...manifest.milestones].reverse().find(item => profileState.streak >= item.days)?.multiplier || 1;
  }

  function updateStreak(profileState) {
    const today = day();
    if (profileState.lastDay === today) return;
    const yesterday = previousDay(today);
    if (!profileState.lastDay) profileState.streak = 1;
    else if (profileState.lastDay === yesterday) profileState.streak += 1;
    else if (profileState.graceDays > 0) {
      profileState.graceDays -= 1;
      profileState.streak += 1;
      notification(`${profileState.name}'s grace day protected the streak.`, '🧊');
    } else profileState.streak = 1;

    profileState.lastDay = today;
    profileState.bestStreak = Math.max(profileState.bestStreak || 0, profileState.streak);

    const milestone = manifest.milestones.find(item =>
      item.days === profileState.streak && !profileState.claimed.includes(item.days)
    );
    if (milestone) {
      profileState.claimed.push(milestone.days);
      profileState.balance += milestone.bonusKc;
      profileState.xp += milestone.bonusXp;
      addTransaction(profileState, 'earn', milestone.bonusKc, milestone.title, milestone.icon);
      notification(`${profileState.name} unlocked ${milestone.title}.`, milestone.icon);
    }
  }

  function earn(profileState, kc, xp, label, icon, metrics = {}) {
    profileState.balance += kc;
    profileState.xp += xp;
    addTransaction(profileState, 'earn', kc, label, icon);
    updateStreak(profileState);
    window.LarriVerseArcade?.award?.(ID, {
      xp,
      kc: Math.min(9, kc),
      score: xp,
      completed: true,
      metrics
    });
    save();
  }

  function pendingCount(profileId) {
    return state.approvals.filter(item => item.profileId === profileId && item.status === 'pending').length
      + state.redemptions.filter(item => item.profileId === profileId && item.status === 'pending').length;
  }

  function level(profileState) {
    return Math.max(1, Math.floor(Math.sqrt(Math.max(0, profileState.xp) / 36)) + 1);
  }

  async function init() {
    const response = await fetch('family.json');
    if (!response.ok) throw new Error(`Could not load family data (${response.status})`);
    manifest = await response.json();
    ensureAssignments();
    bind();
    render();
  }

  function bind() {
    $('#profileButton').onclick = showProfiles;
    $('#parentButton').onclick = showParentGate;
    $('#closePin').onclick = () => $('#parentGate').close();
    $('#pinForm').onsubmit = submitPin;
    $('#closeParent').onclick = () => $('#parentDialog').close();
    $('#closeLesson').onclick = () => {
      activeLessonRound = null;
      $('#lessonDialog').close();
    };
    $('#lessonNext').onclick = nextLessonQuestion;
    $('#resultClose').onclick = () => $('#resultDialog').close();

    document.querySelectorAll('[data-tab]').forEach(button => {
      button.onclick = () => {
        tab = button.dataset.tab;
        render();
      };
    });
    document.querySelectorAll('[data-parent-tab]').forEach(button => {
      button.onclick = () => {
        parentTab = button.dataset.parentTab;
        renderParent();
      };
    });
    window.addEventListener('larriverse:profile', renderSummary);
  }

  function renderSummary() {
    const profileState = activeProfile();
    const arcade = window.LarriVerseArcade?.summary?.() || { kc: 0 };
    $('#activeAvatar').textContent = profileState.avatar;
    $('#activeName').textContent = profileState.name;
    $('#activeLevel').textContent = `Level ${level(profileState)} · best streak ${profileState.bestStreak || 0}`;
    $('#familyBalance').textContent = Math.floor(profileState.balance);
    $('#streakValue').textContent = profileState.streak || 0;
    $('#pendingValue').textContent = pendingCount(profileState.id);
    $('#sharedValue').textContent = Math.floor(arcade.kc || 0);
    $('#profileButton').textContent = `${profileState.avatar} ${profileState.name} ▾`;
  }

  function render() {
    document.querySelectorAll('[data-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });
    const views = {
      home: renderHome,
      tasks: renderTasks,
      learn: renderLearn,
      ledger: renderLedger,
      rewards: renderRewards,
      notes: renderNotes
    };
    (views[tab] || renderHome)();
    renderSummary();
  }

  function renderHome() {
    const profileState = activeProfile();
    const nextMilestone = manifest.milestones.find(item => profileState.streak < item.days);
    const pending = [...state.approvals, ...state.redemptions]
      .filter(item => item.profileId === profileState.id && item.status === 'pending');
    const assignedCount = tasksFor(profileState.id).length;
    const totalQuestions = manifest.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);

    $('#view').innerHTML = `
      <div class="dashboard-grid">
        <article class="card">
          <p class="eyebrow">Open learning · assigned chores</p>
          <h2>${esc(profileState.name)}'s family dashboard</h2>
          <p>Learning is always unlocked. Parent Mode is used to assign chores, approve earned Family KC, and approve reward requests.</p>
          <div class="grid">
            <div class="ledger-card">
              <small>Lesson mastery</small>
              <h3>${profileState.lessons.length}/${manifest.lessons.length}</h3>
              <div class="progress-track"><div class="progress-fill" style="width:${Math.round(profileState.lessons.length / manifest.lessons.length * 100)}%"></div></div>
              <p>${totalQuestions} questions in the family learning bank.</p>
            </div>
            <div class="ledger-card">
              <small>Assigned chores</small>
              <h3>${assignedCount}</h3>
              <p>All chores begin shared; parents can assign them to one explorer.</p>
            </div>
          </div>
          <div class="admin-actions">
            <button class="card-button" id="learnJump">Start an unlocked lesson</button>
            <button class="card-button" id="earnJump">View assigned chores</button>
          </div>
        </article>
        <aside class="card">
          <p class="eyebrow">Next milestone</p>
          ${nextMilestone ? `
            <div class="big-icon">${nextMilestone.icon}</div>
            <h2>${esc(nextMilestone.title)}</h2>
            <p>${nextMilestone.days - profileState.streak} more active day${nextMilestone.days - profileState.streak === 1 ? '' : 's'} · +${nextMilestone.bonusKc} Family KC</p>
          ` : `
            <div class="big-icon">🏆</div>
            <h2>All milestones reached</h2>
          `}
          <p class="eyebrow">Waiting on parent</p>
          ${pending.length ? pending.slice(0, 3).map(item => `
            <div class="tx">
              <span>${item.kind === 'reward' ? '🎁' : '✅'}</span>
              <div><b>${esc(item.label)}</b><small>Pending approval</small></div>
              <span class="pill pending">waiting</span>
            </div>
          `).join('') : '<p class="muted">Nothing waiting right now.</p>'}
        </aside>
      </div>
    `;
    $('#learnJump').onclick = () => { tab = 'learn'; render(); };
    $('#earnJump').onclick = () => { tab = 'tasks'; render(); };
  }

  function renderTasks() {
    const profileState = activeProfile();
    const assigned = tasksFor(profileState.id);
    const waiting = new Set(state.approvals
      .filter(item => item.profileId === profileState.id && item.status === 'pending')
      .map(item => item.taskId));

    if (!assigned.length) {
      $('#view').innerHTML = `
        <div class="empty">
          <h2>No chores assigned yet</h2>
          <p>A parent can assign a shared chore or a chore just for ${esc(profileState.name)} in Parent Mode.</p>
        </div>
      `;
      return;
    }

    $('#view').innerHTML = `
      <div class="section-head">
        <div>
          <p class="eyebrow">Assigned by family</p>
          <h2>${esc(profileState.name)}'s chores</h2>
          <p>Mark a chore done, then a parent approves the Family KC reward.</p>
        </div>
      </div>
      ${manifest.categories.map(category => {
        const items = assigned.filter(task => task.category === category.id);
        if (!items.length) return '';
        return `
          <section>
            <div class="category-head"><h3>${category.icon} ${esc(category.title)}</h3><p>${esc(category.subtitle)}</p></div>
            <div class="grid">
              ${items.map(task => `
                <article class="task-card">
                  <div class="card-top">
                    <span class="big-icon">${task.icon}</span>
                    <span class="pill">${task.difficulty} · ${task.kc} KC</span>
                  </div>
                  <h3>${esc(task.title)}</h3>
                  <p>${esc(task.description)}</p>
                  <button class="card-button" data-task="${task.id}" ${waiting.has(task.id) ? 'disabled' : ''}>
                    ${waiting.has(task.id) ? 'Waiting on parent' : 'Mark done'}
                  </button>
                </article>
              `).join('')}
            </div>
          </section>
        `;
      }).join('')}
    `;
    $('#view').querySelectorAll('[data-task]').forEach(button => {
      button.onclick = () => requestTask(button.dataset.task);
    });
  }

  function requestTask(id) {
    const profileState = activeProfile();
    const task = tasksFor(profileState.id).find(item => item.id === id);
    if (!task || state.approvals.some(item =>
      item.profileId === profileState.id && item.taskId === id && item.status === 'pending'
    )) return;

    state.approvals.unshift({
      id: uid(),
      kind: 'task',
      taskId: id,
      profileId: profileState.id,
      label: task.title,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    notification(`${profileState.name} marked ${task.title} done.`, task.icon);
    save();
    showResult('⏳', 'Sent to Parent Mode', `${task.title} is waiting for a parent to approve the Family KC reward.`);
    render();
  }

  function lessonProgress(profileState, lessonId) {
    if (!profileState.lessonProgress[lessonId]) {
      profileState.lessonProgress[lessonId] = {
        seen: [],
        rounds: 0,
        best: 0,
        mastered: profileState.lessons.includes(lessonId)
      };
    }
    return profileState.lessonProgress[lessonId];
  }

  function drawLessonQuestions(profileState, lesson, count = 3) {
    const progress = lessonProgress(profileState, lesson.id);
    let available = lesson.questions.filter(question => !progress.seen.includes(question.id));
    if (available.length < count) {
      progress.seen = [];
      available = [...lesson.questions];
    }
    const selected = shuffle(available).slice(0, count);
    progress.seen.push(...selected.map(question => question.id));
    save();
    return selected;
  }

  function renderLearn() {
    const profileState = activeProfile();
    const totalQuestions = manifest.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);
    $('#view').innerHTML = `
      <div class="section-head">
        <div>
          <p class="eyebrow">Always unlocked</p>
          <h2>${manifest.lessons.length} lessons · ${totalQuestions} questions</h2>
          <p>Each round draws three questions without repeating until its lesson bank cycles.</p>
        </div>
      </div>
      <div class="grid">
        ${manifest.lessons.map(lesson => {
          const progress = lessonProgress(profileState, lesson.id);
          const mastered = profileState.lessons.includes(lesson.id);
          return `
            <article class="lesson-card">
              <div class="card-top">
                <span class="big-icon">${lesson.icon}</span>
                <span class="pill ${mastered ? 'done' : ''}">
                  ${mastered ? `mastered · best ${progress.best}/3` : `${lesson.questions.length} questions`}
                </span>
              </div>
              <h3>${esc(lesson.title)}</h3>
              <p>${esc(lesson.summary)}</p>
              <button class="card-button" data-lesson="${lesson.id}">
                ${mastered ? 'Practice another round' : 'Start 3-question round'}
              </button>
            </article>
          `;
        }).join('')}
      </div>
    `;
    $('#view').querySelectorAll('[data-lesson]').forEach(button => {
      button.onclick = () => startLesson(button.dataset.lesson);
    });
  }

  function startLesson(id) {
    const lesson = manifest.lessons.find(item => item.id === id);
    if (!lesson) return;
    const profileState = activeProfile();
    activeLessonRound = {
      lesson,
      questions: drawLessonQuestions(profileState, lesson, 3),
      index: 0,
      correct: 0,
      answered: false
    };
    $('#lessonTitle').textContent = `${lesson.icon} ${lesson.title}`;
    $('#lessonSummary').textContent = `${lesson.summary} Three questions per round; two correct answers masters the lesson.`;
    showLessonQuestion();
    $('#lessonDialog').showModal();
  }

  function showLessonQuestion() {
    const round = activeLessonRound;
    if (!round) return;
    const question = round.questions[round.index];
    round.answered = false;
    $('#lessonQuestion').textContent = `Question ${round.index + 1} of ${round.questions.length}: ${question.prompt}`;
    $('#lessonFeedback').textContent = '';
    $('#lessonNext').hidden = true;
    $('#lessonNext').textContent = round.index === round.questions.length - 1 ? 'Finish round' : 'Next question';
    $('#lessonOptions').innerHTML = question.options.map((option, index) =>
      `<button data-answer="${index}">${esc(option)}</button>`
    ).join('');
    $('#lessonOptions').querySelectorAll('button').forEach(button => {
      button.onclick = () => answerLessonQuestion(Number(button.dataset.answer));
    });
  }

  function answerLessonQuestion(answerIndex) {
    const round = activeLessonRound;
    if (!round || round.answered) return;
    round.answered = true;
    const question = round.questions[round.index];
    const buttons = [...$('#lessonOptions').querySelectorAll('button')];
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === question.answer) button.classList.add('correct');
      if (index === answerIndex && answerIndex !== question.answer) button.classList.add('wrong');
    });
    const correct = answerIndex === question.answer;
    if (correct) round.correct += 1;
    $('#lessonFeedback').textContent = `${correct ? 'Correct.' : `Not quite — ${question.options[question.answer]} is correct.`} ${question.explanation}`;
    $('#lessonNext').hidden = false;
  }

  function nextLessonQuestion() {
    const round = activeLessonRound;
    if (!round || !round.answered) return;
    if (round.index < round.questions.length - 1) {
      round.index += 1;
      showLessonQuestion();
      return;
    }
    finishLessonRound();
  }

  function finishLessonRound() {
    const round = activeLessonRound;
    if (!round) return;
    const profileState = activeProfile();
    const progress = lessonProgress(profileState, round.lesson.id);
    const passed = round.correct >= 2;
    const firstMastery = passed && !profileState.lessons.includes(round.lesson.id);
    progress.rounds += 1;
    progress.best = Math.max(progress.best || 0, round.correct);
    progress.mastered = progress.mastered || passed;

    if (firstMastery) {
      profileState.lessons.push(round.lesson.id);
      earn(profileState, round.lesson.kc, round.lesson.xp, round.lesson.title, round.lesson.icon, {
        lessonsCompleted: 1,
        correctAnswers: round.correct,
        questionsAnswered: round.questions.length
      });
    } else {
      save();
    }

    $('#lessonDialog').close();
    activeLessonRound = null;
    if (passed) {
      showResult(
        '🌟',
        firstMastery ? 'Lesson mastered' : 'Practice complete',
        firstMastery
          ? `${round.correct}/3 correct — +${round.lesson.kc} Family KC and +${round.lesson.xp} XP.`
          : `${round.correct}/3 correct. This lesson was already mastered, so the round stays reward-free practice.`
      );
    } else {
      showResult('🌱', 'Keep growing', `${round.correct}/3 correct. Try another unlocked round to master this lesson.`);
    }
    render();
  }

  function renderLedger() {
    const profileState = activeProfile();
    const earned = profileState.tx.filter(item => item.type === 'earn').reduce((sum, item) => sum + item.amount, 0);
    const spent = profileState.tx.filter(item => item.type === 'spend').reduce((sum, item) => sum + item.amount, 0);
    $('#view').innerHTML = `
      <div class="grid">
        <article class="ledger-card"><small>Current balance</small><h2>${Math.floor(profileState.balance)} Family KC</h2><p>Fictional points with no cash value.</p></article>
        <article class="ledger-card"><small>Total earned</small><h2>${earned} KC</h2></article>
        <article class="ledger-card"><small>Total redeemed</small><h2>${spent} KC</h2></article>
      </div>
      <div class="section-head"><div><p class="eyebrow">Device-local history</p><h2>Family ledger</h2></div></div>
      <article class="card">
        ${profileState.tx.length ? profileState.tx.map(item => `
          <div class="tx">
            <span>${item.icon}</span>
            <div><b>${esc(item.label)}</b><small>${new Date(item.at).toLocaleString()}</small></div>
            <b class="${item.type}">${item.type === 'earn' ? '+' : '-'}${item.amount}</b>
          </div>
        `).join('') : '<div class="empty">No ledger entries yet.</div>'}
      </article>
    `;
  }

  function renderRewards() {
    const profileState = activeProfile();
    const waiting = new Set(state.redemptions
      .filter(item => item.profileId === profileState.id && item.status === 'pending')
      .map(item => item.rewardId));
    $('#view').innerHTML = `
      <div class="section-head">
        <div>
          <p class="eyebrow">Open shelf · parent-approved redemption</p>
          <h2>Family reward shelf</h2>
          <p>Every reward can be viewed. A parent makes the final decision and no real money changes hands.</p>
        </div>
      </div>
      <div class="grid">
        ${allRewards().map(reward => `
          <article class="reward-card">
            <div class="card-top">
              <span class="big-icon">${reward.icon}</span>
              <span class="pill">${reward.cost} KC</span>
            </div>
            <h3>${esc(reward.title)}</h3>
            <p>${esc(reward.description)}</p>
            <button class="card-button" data-reward="${reward.id}" ${waiting.has(reward.id) || profileState.balance < reward.cost ? 'disabled' : ''}>
              ${waiting.has(reward.id)
                ? 'Waiting on parent'
                : profileState.balance < reward.cost
                  ? `Need ${reward.cost - profileState.balance} more KC`
                  : 'Request reward'}
            </button>
          </article>
        `).join('')}
      </div>
    `;
    $('#view').querySelectorAll('[data-reward]').forEach(button => {
      button.onclick = () => requestReward(button.dataset.reward);
    });
  }

  function requestReward(id) {
    const profileState = activeProfile();
    const reward = allRewards().find(item => item.id === id);
    if (!reward || profileState.balance < reward.cost) return;
    state.redemptions.unshift({
      id: uid(),
      kind: 'reward',
      rewardId: id,
      profileId: profileState.id,
      label: reward.title,
      cost: reward.cost,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    notification(`${profileState.name} requested ${reward.title}.`, reward.icon);
    save();
    showResult('🎁', 'Reward request sent', `${reward.title} is waiting for parent approval. No Family KC has been deducted.`);
    render();
  }

  function renderNotes() {
    const profileState = activeProfile();
    const presets = [
      'I finished something! ✅',
      'Thank you! 💛',
      'Can we talk about my reward goal? 🎯',
      'I need help with a task. 🙋'
    ];
    $('#view').innerHTML = `
      <div class="dashboard-grid">
        <article class="card">
          <p class="eyebrow">Family-only notes</p>
          <h2>Send a preset note</h2>
          <p>These messages never leave this browser.</p>
          ${presets.map((text, index) => `<button class="card-button" data-note="${index}">${text}</button>`).join('')}
        </article>
        <article class="card">
          <p class="eyebrow">Conversation</p>
          ${profileState.notes.length ? profileState.notes.map(note => `
            <div class="note-bubble ${note.from}">
              <b>${note.from === 'parent' ? 'Parent' : esc(profileState.name)}</b>
              <p>${esc(note.text)}</p>
              <small>${new Date(note.at).toLocaleString()}</small>
            </div>
          `).join('') : '<div class="empty">No notes yet.</div>'}
        </article>
      </div>
    `;
    $('#view').querySelectorAll('[data-note]').forEach(button => {
      button.onclick = () => {
        profileState.notes.unshift({
          from: 'child',
          text: presets[Number(button.dataset.note)],
          at: new Date().toISOString()
        });
        notification(`${profileState.name} sent a family note.`, '💬');
        save();
        renderNotes();
      };
    });
  }

  function showProfiles() {
    $('#profileList').innerHTML = state.profiles.map(profileState => `
      <button class="profile-choice" data-profile="${profileState.id}">
        <span>${profileState.avatar}</span>
        <div><b>${esc(profileState.name)}</b><small>${Math.floor(profileState.balance)} Family KC · ${profileState.streak || 0}-day rhythm</small></div>
      </button>
    `).join('');
    $('#profileList').querySelectorAll('[data-profile]').forEach(button => {
      button.onclick = () => {
        state.active = button.dataset.profile;
        save();
        $('#profileDialog').close();
        render();
      };
    });
    $('#profileDialog').showModal();
  }

  async function hashPin(pin) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
    return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function showParentGate() {
    $('#pinInput').value = '';
    $('#pinError').textContent = '';
    $('#pinTitle').textContent = state.pin ? 'Enter parent PIN' : 'Create parent PIN';
    $('#pinHelp').textContent = state.pin
      ? manifest.boundaries.pinNote
      : 'Choose four digits. Parent Mode assigns chores and approves rewards; learning stays unlocked.';
    $('#parentGate').showModal();
    setTimeout(() => $('#pinInput').focus(), 50);
  }

  async function submitPin(event) {
    event.preventDefault();
    const pin = $('#pinInput').value.trim();
    if (!/^\d{4}$/.test(pin)) {
      $('#pinError').textContent = 'Enter exactly four digits.';
      return;
    }
    const hashed = await hashPin(pin);
    if (!state.pin) {
      state.pin = hashed;
      save();
    } else if (state.pin !== hashed) {
      $('#pinError').textContent = 'That PIN does not match this browser.';
      return;
    }
    $('#parentGate').close();
    parentTab = 'approvals';
    renderParent();
    $('#parentDialog').showModal();
  }

  function renderParent() {
    document.querySelectorAll('[data-parent-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.parentTab === parentTab);
    });
    const views = {
      approvals: renderApprovals,
      profiles: renderProfileAdmin,
      tasks: renderTaskAdmin,
      rewards: renderRewardAdmin,
      bonus: renderBonusAdmin,
      privacy: renderPrivacyAdmin
    };
    (views[parentTab] || renderApprovals)();
  }

  function renderApprovals() {
    const taskRequests = state.approvals.filter(item => item.status === 'pending');
    const rewardRequests = state.redemptions.filter(item => item.status === 'pending');
    const row = item => {
      const profileState = state.profiles.find(profileItem => profileItem.id === item.profileId);
      return `
        <div class="admin-row">
          <span>${item.kind === 'reward' ? '🎁' : '✅'}</span>
          <div>
            <b>${esc(item.label)}</b>
            <p class="muted">${esc(profileState?.name || 'Explorer')} · ${new Date(item.requestedAt).toLocaleString()}${item.cost ? ` · ${item.cost} KC` : ''}</p>
          </div>
          <div class="admin-actions">
            <button class="approve" data-approve="${item.id}" data-kind="${item.kind}">Approve</button>
            <button class="reject" data-reject="${item.id}" data-kind="${item.kind}">Reject</button>
          </div>
        </div>
      `;
    };
    $('#parentView').innerHTML = `
      <p class="eyebrow">Pending decisions</p>
      <h3>Completed chores</h3>
      <article class="card">${taskRequests.length ? taskRequests.map(row).join('') : '<div class="empty">No chore requests.</div>'}</article>
      <h3>Reward requests</h3>
      <article class="card">${rewardRequests.length ? rewardRequests.map(row).join('') : '<div class="empty">No reward requests.</div>'}</article>
    `;
    $('#parentView').querySelectorAll('[data-approve]').forEach(button => {
      button.onclick = () => decide(button.dataset.kind, button.dataset.approve, true);
    });
    $('#parentView').querySelectorAll('[data-reject]').forEach(button => {
      button.onclick = () => decide(button.dataset.kind, button.dataset.reject, false);
    });
  }

  function decide(kind, id, approved) {
    const list = kind === 'reward' ? state.redemptions : state.approvals;
    const request = list.find(item => item.id === id);
    if (!request || request.status !== 'pending') return;
    const profileState = state.profiles.find(item => item.id === request.profileId);
    request.status = approved ? 'approved' : 'rejected';
    request.decidedAt = new Date().toISOString();

    if (approved && kind === 'task') {
      const task = allTasks().find(item => item.id === request.taskId);
      if (!task || !profileState) return;
      const kc = Math.max(3, Math.floor(task.kc * multiplier(profileState)));
      earn(profileState, kc, task.xp, task.title, task.icon, {
        tasksApproved: 1,
        familyKcEarned: kc
      });
      notification(`${profileState.name} earned ${kc} Family KC for ${task.title}.`, task.icon);
    }

    if (approved && kind === 'reward') {
      const reward = allRewards().find(item => item.id === request.rewardId);
      if (!reward || !profileState || profileState.balance < reward.cost) {
        request.status = 'rejected';
        request.reason = 'Balance changed before approval.';
      } else {
        profileState.balance -= reward.cost;
        addTransaction(profileState, 'spend', reward.cost, reward.title, reward.icon);
        notification(`${profileState.name}'s reward was approved: ${reward.title}.`, reward.icon);
        window.LarriVerseArcade?.award?.(ID, {
          xp: 6,
          kc: 0,
          score: reward.cost,
          completed: false,
          metrics: { rewardsApproved: 1, familyKcRedeemed: reward.cost }
        });
      }
    }

    if (!approved) notification(`${request.label} was not approved this time.`, '↩️');
    save();
    renderParent();
    render();
  }

  function renderProfileAdmin() {
    $('#parentView').innerHTML = `
      <p class="eyebrow">Local family profiles</p>
      <article class="card">
        ${state.profiles.map(profileState => `
          <div class="admin-row">
            <span>${profileState.avatar}</span>
            <div><b>${esc(profileState.name)}</b><p class="muted">${Math.floor(profileState.balance)} KC · ${profileState.graceDays || 0} grace days</p></div>
            <div class="admin-actions">
              <button data-use="${profileState.id}">Activate</button>
              ${state.profiles.length > 1 ? `<button class="reject" data-delete="${profileState.id}">Delete</button>` : ''}
            </div>
          </div>
        `).join('')}
      </article>
      <h3>Add explorer</h3>
      <form id="addProfile" class="card form-grid">
        <div class="field"><label>Name or nickname</label><input id="newName" maxlength="24" required></div>
        <div class="field"><label>Avatar</label><select id="newAvatar">${manifest.avatars.map(avatar => `<option>${avatar}</option>`).join('')}</select></div>
        <button class="primary">Add device-local profile</button>
      </form>
    `;
    $('#addProfile').onsubmit = event => {
      event.preventDefault();
      const name = $('#newName').value.trim();
      if (!name || state.profiles.length >= 6) return;
      const newProfile = profile(name, $('#newAvatar').value);
      state.profiles.push(newProfile);
      state.active = newProfile.id;
      save();
      renderParent();
      render();
    };
    $('#parentView').querySelectorAll('[data-use]').forEach(button => {
      button.onclick = () => {
        state.active = button.dataset.use;
        save();
        renderParent();
        render();
      };
    });
    $('#parentView').querySelectorAll('[data-delete]').forEach(button => {
      button.onclick = () => {
        const deleted = button.dataset.delete;
        state.profiles = state.profiles.filter(item => item.id !== deleted);
        for (const [taskId, assignment] of Object.entries(state.taskAssignments)) {
          if (assignment === deleted) state.taskAssignments[taskId] = 'all';
        }
        if (!state.profiles.some(item => item.id === state.active)) state.active = state.profiles[0].id;
        save();
        renderParent();
        render();
      };
    });
  }

  function assignmentOptions(selected) {
    return [
      `<option value="all" ${selected === 'all' ? 'selected' : ''}>All explorers</option>`,
      ...state.profiles.map(profileState =>
        `<option value="${profileState.id}" ${selected === profileState.id ? 'selected' : ''}>${esc(profileState.name)}</option>`
      )
    ].join('');
  }

  function renderTaskAdmin() {
    $('#parentView').innerHTML = `
      <p class="eyebrow">Assign chores instead of locking the app</p>
      <h3>Chore library</h3>
      <p class="muted">All chores begin assigned to every explorer. Choose one explorer to make a chore private to that child.</p>
      <article class="card">
        ${allTasks().map(task => `
          <div class="admin-row">
            <span>${task.icon}</span>
            <div><b>${esc(task.title)}</b><p class="muted">${task.kc} KC · ${esc(task.category)}</p></div>
            <div class="field">
              <label for="assign-${task.id}">Assigned to</label>
              <select id="assign-${task.id}" data-assignment="${task.id}">${assignmentOptions(assignmentFor(task.id))}</select>
            </div>
          </div>
        `).join('')}
      </article>
      <h3>Add custom chore</h3>
      <form id="customTaskForm" class="card form-grid">
        <div class="field"><label>Title</label><input id="customTaskTitle" maxlength="50" required></div>
        <div class="field"><label>Category</label><select id="customTaskCategory">${manifest.categories.map(category => `<option value="${category.id}">${category.title}</option>`).join('')}</select></div>
        <div class="field"><label>Reward</label><select id="customTaskValue"><option value="3">3 KC</option><option value="6">6 KC</option><option value="9">9 KC</option></select></div>
        <div class="field"><label>Assigned to</label><select id="customTaskAssignment">${assignmentOptions('all')}</select></div>
        <div class="field"><label>Icon</label><input id="customTaskIcon" maxlength="4" value="⭐"></div>
        <button class="primary">Add and assign chore</button>
      </form>
    `;

    $('#parentView').querySelectorAll('[data-assignment]').forEach(select => {
      select.onchange = () => {
        state.taskAssignments[select.dataset.assignment] = select.value;
        save();
        render();
      };
    });

    $('#customTaskForm').onsubmit = event => {
      event.preventDefault();
      const title = $('#customTaskTitle').value.trim();
      const value = Number($('#customTaskValue').value);
      if (!title || ![3, 6, 9].includes(value)) return;
      const task = {
        id: `custom-task-${Date.now()}`,
        category: $('#customTaskCategory').value,
        icon: $('#customTaskIcon').value || '⭐',
        title,
        description: 'Parent-created family chore.',
        difficulty: value === 9 ? 'hard' : value === 6 ? 'medium' : 'easy',
        kc: value,
        xp: value * 2
      };
      state.customTasks.push(task);
      state.taskAssignments[task.id] = $('#customTaskAssignment').value;
      save();
      renderParent();
      render();
    };
  }

  function renderRewardAdmin() {
    $('#parentView').innerHTML = `
      <p class="eyebrow">Open reward shelf</p>
      <h3>Available rewards</h3>
      <p class="muted">Explorers may browse every reward. Parent approval remains required before Family KC is redeemed.</p>
      <article class="card">
        ${allRewards().map(reward => `
          <div class="admin-row">
            <span>${reward.icon}</span>
            <div><b>${esc(reward.title)}</b><p class="muted">${reward.cost} KC · ${esc(reward.category)}</p></div>
            <span class="pill">visible</span>
          </div>
        `).join('')}
      </article>
      <h3>Add custom reward</h3>
      <form id="customRewardForm" class="card form-grid">
        <div class="field"><label>Title</label><input id="customRewardTitle" maxlength="50" required></div>
        <div class="field"><label>Cost</label><input id="customRewardCost" type="number" min="3" max="999" step="3" value="27"></div>
        <div class="field"><label>Icon</label><input id="customRewardIcon" maxlength="4" value="🎁"></div>
        <button class="primary">Add custom reward</button>
      </form>
    `;
    $('#customRewardForm').onsubmit = event => {
      event.preventDefault();
      const title = $('#customRewardTitle').value.trim();
      const cost = Number($('#customRewardCost').value);
      if (!title || !Number.isInteger(cost) || cost < 3 || cost % 3 !== 0) return;
      state.customRewards.push({
        id: `custom-reward-${Date.now()}`,
        icon: $('#customRewardIcon').value || '🎁',
        title,
        description: 'Parent-created family reward.',
        cost,
        category: 'custom'
      });
      save();
      renderParent();
      render();
    };
  }

  function renderBonusAdmin() {
    $('#parentView').innerHTML = `
      <p class="eyebrow">Parent-issued support</p>
      <div class="grid">
        ${state.profiles.map(profileState => `
          <article class="card">
            <div class="big-icon">${profileState.avatar}</div>
            <h3>${esc(profileState.name)}</h3>
            <p>${Math.floor(profileState.balance)} KC · ${profileState.graceDays || 0} grace days</p>
            <div class="admin-actions">
              <button data-bonus="${profileState.id}" data-value="3">+3 KC</button>
              <button data-bonus="${profileState.id}" data-value="6">+6 KC</button>
              <button data-bonus="${profileState.id}" data-value="9">+9 KC</button>
              <button data-grace="${profileState.id}">+ Grace day</button>
            </div>
          </article>
        `).join('')}
      </div>
      <h3>Send a private family note</h3>
      <form id="parentNote" class="card form-grid">
        <div class="field"><label>Explorer</label><select id="noteProfile">${state.profiles.map(profileState => `<option value="${profileState.id}">${esc(profileState.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Message</label><input id="noteText" maxlength="120" required></div>
        <button class="primary">Send device-local note</button>
      </form>
    `;
    $('#parentView').querySelectorAll('[data-bonus]').forEach(button => {
      button.onclick = () => {
        const profileState = state.profiles.find(item => item.id === button.dataset.bonus);
        const amount = Number(button.dataset.value);
        earn(profileState, amount, amount * 2, 'Parent bonus', '🌟', {
          parentBonuses: 1,
          familyKcEarned: amount
        });
        notification(`${profileState.name} received a ${amount} KC parent bonus.`, '🌟');
        save();
        renderParent();
        render();
      };
    });
    $('#parentView').querySelectorAll('[data-grace]').forEach(button => {
      button.onclick = () => {
        const profileState = state.profiles.find(item => item.id === button.dataset.grace);
        profileState.graceDays = Math.min(9, (profileState.graceDays || 0) + 1);
        notification(`${profileState.name} received a grace day.`, '🧊');
        save();
        renderParent();
        render();
      };
    });
    $('#parentNote').onsubmit = event => {
      event.preventDefault();
      const profileState = state.profiles.find(item => item.id === $('#noteProfile').value);
      const text = $('#noteText').value.trim();
      if (!profileState || !text) return;
      profileState.notes.unshift({ from: 'parent', text, at: new Date().toISOString() });
      notification(`Parent sent ${profileState.name} a private family note.`, '💬');
      save();
      $('#noteText').value = '';
      renderParent();
      if (profileState.id === activeProfile().id && tab === 'notes') renderNotes();
    };
  }

  function renderPrivacyAdmin() {
    $('#parentView').innerHTML = `
      <p class="eyebrow">Data and safety boundary</p>
      <div class="grid">
        <article class="card"><h3>Learning stays open</h3><p>Explorers can use every lesson without the parent PIN. Parent Mode is for assignments, approvals, profiles, bonuses and private settings.</p></article>
        <article class="card"><h3>Stored here</h3><p>Nicknames, avatars, Family KC, task assignments, approvals, rewards, notes and settings are stored in this browser's localStorage.</p></article>
        <article class="card"><h3>Not included</h3><p>No real money, cryptocurrency, blockchain, market price, staking, ads, gambling, public profiles, cloud accounts or outside messaging.</p></article>
        <article class="card"><h3>Parent PIN limits</h3><p>The PIN prevents casual taps. Browser developer tools may still clear or inspect local data.</p></article>
      </div>
      <div class="admin-actions">
        <button id="changePin">Change parent PIN</button>
        <button class="reject" id="resetData">Erase KidsCoin family data</button>
      </div>
    `;
    $('#changePin').onclick = () => {
      state.pin = null;
      save();
      $('#parentDialog').close();
      showParentGate();
    };
    $('#resetData').onclick = () => {
      if (!confirm('Erase all KidsCoin Family data from this browser?')) return;
      localStorage.removeItem(KEY);
      state = fresh();
      ensureAssignments();
      save();
      $('#parentDialog').close();
      render();
    };
  }

  function showResult(icon, title, text) {
    $('#resultIcon').textContent = icon;
    $('#resultTitle').textContent = title;
    $('#resultText').textContent = text;
    $('#resultDialog').showModal();
  }

  init().catch(error => {
    document.body.innerHTML = `
      <main>
        <section class="boundary">
          <span>🌧️</span>
          <div>
            <strong>KidsCoin Family could not load.</strong>
            <p>${esc(error.message)}</p>
            <p><a href="../../index.html">Return to the arcade</a></p>
          </div>
        </section>
      </main>
    `;
  });
})();
