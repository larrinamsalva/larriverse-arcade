(() => {
  'use strict';
  const nativeFetch = window.fetch.bind(window);
  const sourceIcons = { caregiving: '❤️', retail: '🛒', community: '🤝', cooking: '🍳' };
  const sourceOrder = ['plumbing', 'checkbook', 'voltage', 'caregiving', 'retail', 'welding', 'roofing', 'hvac', 'landscaping', 'community', 'emergency', 'cooking', 'farming', 'coding'];

  window.fetch = async (resource, options) => {
    const target = typeof resource === 'string' ? resource : resource?.url || '';
    if (!/(^|\/)activities\.json(?:[?#]|$)/.test(target)) return nativeFetch(resource, options);

    const coreResponse = await nativeFetch(resource, options);
    if (!coreResponse.ok) return coreResponse;
    const core = await coreResponse.json();
    if (!Array.isArray(core.worldFiles)) {
      return new Response(JSON.stringify(core), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    const lists = await Promise.all(core.worldFiles.map(async file => {
      const response = await nativeFetch(file);
      if (!response.ok) throw new Error(`Could not load ${file} (${response.status})`);
      return response.json();
    }));
    const worlds = lists.flat()
      .map(world => ({ ...world, icon: world.icon || sourceIcons[world.id] || '🧰' }))
      .sort((a, b) => sourceOrder.indexOf(a.id) - sourceOrder.indexOf(b.id));
    return new Response(JSON.stringify({ ...core, worlds }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
})();
