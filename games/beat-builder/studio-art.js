export const BEAT_INSTRUMENTS = Object.freeze([
  { name: 'Kick', file: 'kick-drum.webp' },
  { name: 'Clap', file: 'clapping-hands.webp' },
  { name: 'Hi-hat', file: 'hi-hat.webp' }
]);

export function beatStudioScene() {
  return `<figure class="beat-studio-scene">
    <img src="art/music-studio.webp" width="1200" height="675" alt="Two young musicians explore a sixteen-pad drum machine beside a bass drum and hi-hat cymbals." decoding="async">
    <figcaption>Studio illustration. Build your rhythm with the numbered pads below.</figcaption>
  </figure>`;
}

export function beatInstrumentPicture(row) {
  const instrument = BEAT_INSTRUMENTS[row];
  return `<img class="beat-instrument-picture" src="art/${instrument.file}" width="360" height="360" alt="" aria-hidden="true" decoding="async">`;
}
