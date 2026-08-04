(() => {
  'use strict';

  const nativeFetch = window.fetch.bind(window);
  const PACK_URL = new URL('family-question-pack-2.json', location.href).href;
  let handled = false;

  function mergeQuestions(manifest, pack) {
    const lessons = (manifest.lessons || []).map(lesson => {
      const additions = pack.questionsByLesson?.[lesson.id] || [];
      const ids = new Set();
      const questions = [...(lesson.questions || []), ...additions].filter(question => {
        if (!question?.id || ids.has(question.id)) return false;
        ids.add(question.id);
        return true;
      });
      return { ...lesson, questions };
    });
    const totalQuestions = lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);
    window.KidsCoinFamilyData = Object.freeze({
      version: 2,
      packId: pack.packId,
      lessons: lessons.length,
      questions: totalQuestions
    });
    return {
      ...manifest,
      schemaVersion: Math.max(Number(manifest.schemaVersion) || 1, 2),
      questionPacks: [...(manifest.questionPacks || []), pack.packId],
      lessons
    };
  }

  window.fetch = async function kidsCoinFamilyFetch(input, init) {
    const requestUrl = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (handled || !requestUrl.pathname.endsWith('/games/kidscoin-family/family.json')) return nativeFetch(input, init);
    handled = true;

    const [baseResponse, packResponse] = await Promise.all([
      nativeFetch(input, init),
      nativeFetch(PACK_URL, { cache: 'no-store' })
    ]);
    if (!baseResponse.ok) return baseResponse;
    if (!packResponse.ok) throw new Error(`KidsCoin question expansion could not load (${packResponse.status})`);

    const [manifest, pack] = await Promise.all([baseResponse.clone().json(), packResponse.json()]);
    const merged = mergeQuestions(manifest, pack);
    const headers = new Headers(baseResponse.headers);
    headers.set('content-type', 'application/json; charset=utf-8');
    window.fetch = nativeFetch;
    return new Response(JSON.stringify(merged), {
      status: baseResponse.status,
      statusText: baseResponse.statusText,
      headers
    });
  };
})();
