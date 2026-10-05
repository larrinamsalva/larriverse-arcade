// This is a read-only view of existing local play counters, not a learner assessment.
export function discoverGames(catalog, profile = {}) {
  const games = catalog.filter(game => game.available);
  const played = game => Number(profile.games?.[game.id]?.sessions) > 0;
  const recent = games.filter(played).sort((a, b) => {
    const time = game => Date.parse(profile.games?.[game.id]?.lastPlayedAt) || 0;
    return time(b) - time(a) || a.title.localeCompare(b.title);
  }).slice(0, 3);
  const topic = recent[0]?.topic;
  const recommended = (topic ? games.filter(game => game.topic === topic && !recent.includes(game)) : [])
    .concat(games.filter(game => !recent.includes(game)))
    .filter((game, index, list) => list.indexOf(game) === index).slice(0, 3);
  const unvisited = games.filter(game => !played(game) && !recommended.includes(game)).slice(0, 3);
  return {
    recent,
    recommended,
    unvisited,
    recommendationReason: topic
      ? `You might enjoy more ${topic.toLowerCase()} adventures, a topic you have explored here.`
      : 'You might enjoy these different skills. Choose whatever catches your curiosity.'
  };
}
