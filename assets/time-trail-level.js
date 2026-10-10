// Time Trail's small offline route puzzle. Keep the route solvable before changing tiles.
export const timeTrail = Object.freeze({
  width: 5,
  start: 20,
  finish: 4,
  rocks: [6, 7, 8, 16, 17, 18],
  flags: [15, 5, 2],
  stepLimit: 12,
});

// Breadth-first search on position + collected flags proves the route is achievable.
// Returns tile indices, including the starting and finishing squares.
export function shortestTrailPath(plan = timeTrail) {
  const { width, start, finish, rocks, flags } = plan;
  const obstacles = new Set(rocks);
  const goalMask = (1 << flags.length) - 1;
  const queue = [{ tile: start, flagsFound: 0, path: [start] }];
  const visited = new Set([`${start}:0`]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (current.tile === finish && current.flagsFound === goalMask) {
      return current.path;
    }
    const row = Math.floor(current.tile / width);
    const col = current.tile % width;
    const choices = [
      row > 0 ? current.tile - width : -1,
      row < width - 1 ? current.tile + width : -1,
      col > 0 ? current.tile - 1 : -1,
      col < width - 1 ? current.tile + 1 : -1,
    ];
    for (const next of choices) {
      if (next < 0 || obstacles.has(next)) continue;
      const flagIndex = flags.indexOf(next);
      const flagsFound = current.flagsFound | (flagIndex < 0 ? 0 : 1 << flagIndex);
      const key = `${next}:${flagsFound}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ tile: next, flagsFound, path: [...current.path, next] });
    }
  }
  return null;
}
