(() => {
  'use strict';

  const GAME_ID = 'brain-sweat-life-skills';
  const SAVE_KEY = 'larriverse.brainSweatLifeSkills.v1';
  const $ = selector => document.querySelector(selector);
  let content = null;
  let save = loadSave();
  let filter = 'all';
  let query = '';
  let active = null;
  let questionIndex = 0;
  let correct = 0;
  let answered = false;

  function freshSave() {
    return { version: 1, lessons: {}, masteredWorlds: [], totalAnswers: 0, totalCorrect: 0, lastLessonId: null };
  }

  function loadSave() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return raw && typeof raw === 'object' ? { ...freshSave(), ...raw, lessons: raw.lessons || {} } : freshSave();
    } catch {
      return freshSave();
    }
  }

  function persist() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }

  function arcadeProfile() {
    return window.LarriVerseArcade?.summary?.() || { avatar: '🌟', level: 1, kc: 0 };
  }

  function updateProfile() {
    const profile = arcadeProfile();
    $('#profileAvatar').textContent = profile.avatar || '🌟';
    $('#profileLevel').textContent = `Lv ${profile.level || 1}`;
    $('#profileKc').textContent = `${profile.kc || 0} KC`;
  }

  function allLessons() {
    return content.worlds.flatMap(world => world.lessons.map(lesson => ({ world, lesson })));
  }

  function reviewedLessons() {
    return allLessons().filter(item => item.lesson.status === 'reviewed');
  }

  function lessonRecord(id) {
    return save.lessons[id] || { attempts: 0, bestScore: 0, completed: false, correct: 0, answered: 0 };
  }

  function updateStats() {
    const ready = reviewedLessons();
    const records = ready.map(({ lesson }) => lessonRecord(lesson.id));
    const completed = records.filter(record => record.completed).length;
    const answeredCount = records.reduce((sum, record) => sum + (record.answered || 0), 0);
    const right = records.reduce((sum, record) => sum + (record.correct || 0), 0);
    $('#reviewedCount').textContent = ready.length;
    $('#completedCount').textContent = completed;
    $('#questionCount').textContent = ready.reduce((sum, item) => sum + item.lesson.questions.length, 0);
    $('#accuracyStat').textContent = answeredCount ? `${Math.round(right / answeredCount * 100)}%` : '—';
  }

  function render() {
    const worlds = content.worlds.map(world => {
      const visible = world.lessons.filter(lesson => {
        const matchesFilter = filter === 'all' || lesson.status === filter;
        const haystack = `${world.title} ${lesson.title} ${lesson.subtitle}`.toLowerCase();
        return matchesFilter && (!query || haystack.includes(query));
      });
      if (!visible.length) return '';

      const readyCount = world.lessons.filter(lesson => lesson.status === 'reviewed').length;
      const lessonCards = visible.map(lesson => {
        const ready = lesson.status === 'reviewed';
        const record = lessonRecord(lesson.id);
        const mastery = record.bestScore || 0;
        const state = ready
          ? `<b>${record.completed ? 'Mastered' : 'Start'}</b><small>${record.attempts ? `Best ${mastery}%` : `${lesson.questions.length} questions`}</small>`
          : `<b>Review queued</b><small>${escapeHtml(lesson.reviewNote)}</small>`;
        return `<button class="lesson ${ready ? 'ready' : 'locked'}" ${ready ? `data-lesson="${lesson.id}"` : 'disabled'} style="--world:${world.color};--mastery:${mastery}%">
          <span class="lesson-icon">${lesson.icon}</span>
          <span><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.subtitle)}</p>${ready ? `<span class="mastery"><i></i></span>` : ''}</span>
          <span class="lesson-state">${state}</span>
        </button>`;
      }).join('');

      return `<article class="world-card" style="--world:${world.color}">
        <header class="world-head"><span>${world.icon}</span><div><h2>${escapeHtml(world.title)}</h2><p>${escapeHtml(world.note)}</p></div><span class="world-count">${readyCount}/4 ready</span></header>
        <div class="lesson-list">${lessonCards}</div>
      </article>`;
    }).filter(Boolean);

    $('#worldGrid').innerHTML = worlds.length ? worlds.join('') : '<p class="empty">No lesson matches that search.</p>';
    document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => startLesson(button.dataset.lesson)));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function findLesson(id) {
    return allLessons().find(item => item.lesson.id === id);
  }

  function startLesson(id) {
    const found = findLesson(id);
    if (!found || found.lesson.status !== 'reviewed') return;
    active = found;
    questionIndex = 0;
    correct = 0;
    answered = false;
    save.lastLessonId = id;
    persist();
    $('#lessonWorld').textContent = found.world.title;
    $('#lessonTitle').textContent = `${found.lesson.icon} ${found.lesson.title}`;
    $('#lessonDialog').showModal();
    renderQuestion();
  }

  function renderQuestion() {
    const questions = active.lesson.questions;
    const q = questions[questionIndex];
    answered = false;
    $('#lessonProgress').textContent = `${questionIndex + 1} / ${questions.length}`;
    $('#progressFill').style.width = `${questionIndex / questions.length * 100}%`;
    $('#questionNumber').textContent = `Question ${questionIndex + 1}`;
    $('#questionText').textContent = q.prompt;
    $('#lessonScore').textContent = `${correct} correct`;
    $('#feedback').textContent = '';
    $('#nextQuestion').hidden = true;
    $('#answerGrid').innerHTML = '';
    q.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option;
      button.addEventListener('click', () => chooseAnswer(index, button));
      $('#answerGrid').append(button);
    });
  }

  function chooseAnswer(index, button) {
    if (answered) return;
    answered = true;
    const q = active.lesson.questions[questionIndex];
    const buttons = [...$('#answerGrid').children];
    buttons.forEach((item, answerIndex) => {
      item.disabled = true;
      if (answerIndex === q.answer) item.classList.add('correct');
    });
    if (index === q.answer) {
      correct += 1;
      button.classList.add('correct');
      $('#feedback').textContent = 'Correct — that knowledge is yours now. 🌟';
      $('#feedback').style.color = 'var(--green)';
    } else {
      button.classList.add('wrong');
      $('#feedback').textContent = `Not this time. Answer: ${q.options[q.answer]}`;
      $('#feedback').style.color = 'var(--red)';
    }
    $('#lessonScore').textContent = `${correct} correct`;
    $('#nextQuestion').hidden = false;
    $('#nextQuestion').textContent = questionIndex === active.lesson.questions.length - 1 ? 'Finish lesson' : 'Next question';
  }

  function nextQuestion() {
    if (!answered) return;
    questionIndex += 1;
    if (questionIndex >= active.lesson.questions.length) finishLesson();
    else renderQuestion();
  }

  function finishLesson() {
    const total = active.lesson.questions.length;
    const percent = Math.round(correct / total * 100);
    const passed = percent >= content.rewardModel.passPercent;
    const before = lessonRecord(active.lesson.id);
    const firstCompletion = passed && !before.completed;
    const nextRecord = {
      attempts: before.attempts + 1,
      bestScore: Math.max(before.bestScore || 0, percent),
      completed: before.completed || passed,
      correct: (before.correct || 0) + correct,
      answered: (before.answered || 0) + total,
      lastPlayedAt: new Date().toISOString()
    };
    save.lessons[active.lesson.id] = nextRecord;
    save.totalAnswers += total;
    save.totalCorrect += correct;

    const reviewedInWorld = active.world.lessons.filter(lesson => lesson.status === 'reviewed');
    const worldNowMastered = reviewedInWorld.length > 0 && reviewedInWorld.every(lesson => (save.lessons[lesson.id] || {}).completed);
    const firstWorldMastery = worldNowMastered && !save.masteredWorlds.includes(active.world.id);
    if (firstWorldMastery) save.masteredWorlds.push(active.world.id);
    persist();

    const kc = correct * content.rewardModel.correctKc + (passed ? content.rewardModel.passBonusKc : 0);
    const xp = correct * content.rewardModel.correctXp;
    const metrics = {
      questionsAnswered: total,
      correctAnswers: correct,
      lessonsCompleted: firstCompletion ? 1 : 0,
      worldsMastered: firstWorldMastery ? 1 : 0
    };
    const award = window.LarriVerseArcade?.award?.(GAME_ID, { xp, kc, score: percent, completed: passed, metrics });

    $('#lessonDialog').close();
    $('#resultIcon').textContent = percent >= 90 ? '🏆' : passed ? '🎉' : '📚';
    $('#resultTitle').textContent = percent >= 90 ? 'Sovereign Mastery!' : passed ? 'Lesson passed!' : 'Knowledge takes practice.';
    $('#resultSummary').textContent = `${correct} of ${total} correct · ${percent}%${firstWorldMastery ? ` · ${active.world.title} mastered` : ''}`;
    $('#resultKc').textContent = `+${kc + (award?.milestoneBonus || 0)} KC`;
    $('#resultXp').textContent = `+${xp} XP`;
    $('#resultStats').innerHTML = `
      <div><b>${percent}%</b><span>score</span></div>
      <div><b>${nextRecord.bestScore}%</b><span>personal best</span></div>
      <div><b>${save.masteredWorlds.length}</b><span>worlds mastered</span></div>`;
    updateStats();
    updateProfile();
    render();
    $('#resultDialog').showModal();
  }

  async function init() {
    try {
      const response = await fetch('content-manifest.json');
      if (!response.ok) throw new Error(`content manifest returned ${response.status}`);
      const manifest = await response.json();
      const worldResponses = await Promise.all(manifest.worldFiles.map(path => fetch(path)));
      if (worldResponses.some(item => !item.ok)) throw new Error('one or more world files failed to load');
      const worlds = await Promise.all(worldResponses.map(item => item.json()));
      content = { ...manifest, worlds };
      const source = content.source;
      $('#sourceSummary').textContent = `${source.worldCount} worlds · ${source.lessonCount} lessons · ${source.readableQuestionCount} readable source questions. ${source.malformedQuestionCount} malformed source question remains excluded and documented.`;
      updateProfile();
      updateStats();
      render();
      window.addEventListener('larriverse:profile', updateProfile);
    } catch (error) {
      console.error(error);
      $('#worldGrid').innerHTML = '<p class="empty">The lesson library did not load. Serve the repository over HTTP and try again.</p>';
    }
  }

  $('#filters').addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    document.querySelectorAll('#filters button').forEach(item => item.classList.toggle('active', item === button));
    render();
  });
  $('#search').addEventListener('input', event => { query = event.target.value.trim().toLowerCase(); render(); });
  $('#nextQuestion').addEventListener('click', nextQuestion);
  $('#randomButton').addEventListener('click', () => {
    const lessons = reviewedLessons();
    if (lessons.length) startLesson(lessons[Math.floor(Math.random() * lessons.length)].lesson.id);
  });
  $('#continueButton').addEventListener('click', () => {
    const id = save.lastLessonId && findLesson(save.lastLessonId)?.lesson.status === 'reviewed'
      ? save.lastLessonId
      : reviewedLessons()[0]?.lesson.id;
    if (id) startLesson(id);
  });
  $('#resultHome').addEventListener('click', () => $('#resultDialog').close());
  $('#resultAgain').addEventListener('click', () => { $('#resultDialog').close(); startLesson(active.lesson.id); });
  $('#lessonDialog').addEventListener('close', () => { answered = false; });

  init();
})();
