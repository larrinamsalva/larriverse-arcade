// Ambient chapter settings are independent of the bubble grid and shot outcome.
export const BUBBLE_SCENES = Object.freeze([
  { id: 'coastal-cove', file: 'coastal-cove.webp', name: 'Sunlit Cove', alt: 'Sunlit coastal cove with rocky cliffs, flowers, and turquoise water.' },
  { id: 'moonlit-garden', file: 'moonlit-garden.webp', name: 'Moonlit Garden', alt: 'Stone path through a flowering garden beneath a violet evening sky.' },
  { id: 'aurora-valley', file: 'aurora-valley.webp', name: 'Aurora Valley', alt: 'Pine-framed mountain valley beneath green aurora in a deep blue sky.' },
  { id: 'starlit-observatory', file: 'starlit-observatory.webp', name: 'Starlit Observatory', alt: 'Hilltop observatory and telescope overlooking distant town lights under the stars.' }
]);

export function sceneForLevel(level) {
  return BUBBLE_SCENES[Math.min(BUBBLE_SCENES.length - 1, Math.max(0, Math.floor((level - 1) / 20)))];
}
