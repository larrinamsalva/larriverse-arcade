(() => {
  'use strict';

  const nativeFetch = window.fetch.bind(window);
  const PACK_URLS = [
    new URL('family-question-pack-2.json', location.href).href,
    new URL('family-question-pack-3.json', location.href).href
  ];
  let handled = false;

  function mergeQuestions(manifest, packs) {
    const lessons = (manifest.lessons || []).map(lesson => {
      const additions = packs.flatMap(pack => pack.questionsByLesson?.[lesson.id] || []);
      const ids = new Set();
      const questions = [...(lesson.questions || []), ...additions].filter(question => {
        if (!question?.id || ids.has(question.id)) return false;
        ids.add(question.id);
        return true;
      });
      return { ...lesson, questions };
    });
    const totalQuestions = lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);
    const packIds = packs.map(pack => pack.packId);
    window.KidsCoinFamilyData = Object.freeze({
      version: 3,
      packIds,
      lessons: lessons.length,
      questions: totalQuestions
    });
    return {
      ...manifest,
      schemaVersion: Math.max(Number(manifest.schemaVersion) || 1, 2),
      questionPacks: [...new Set([...(manifest.questionPacks || []), ...packIds])],
      lessons
    };
  }

  window.fetch = async function kidsCoinFamilyFetch(input, init) {
    const requestUrl = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (handled || !requestUrl.pathname.endsWith('/games/kidscoin-family/family.json')) return nativeFetch(input, init);
    handled = true;

    const [baseResponse, ...packResponses] = await Promise.all([
      nativeFetch(input, init),
      ...PACK_URLS.map(url => nativeFetch(url, { cache: 'no-store' }))
    ]);
    if (!baseResponse.ok) return baseResponse;
    const failedPack = packResponses.find(response => !response.ok);
    if (failedPack) throw new Error(`KidsCoin question expansion could not load (${failedPack.status})`);

    const [manifest, ...packs] = await Promise.all([
      baseResponse.clone().json(),
      ...packResponses.map(response => response.json())
    ]);
    const merged = mergeQuestions(manifest, packs);
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
