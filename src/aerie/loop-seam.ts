/** Sample count for a loop region: round(beats * (60 / bpm) * sampleRate). No pad. */
export function loopSampleCount(beats: number, bpm: number, sampleRate: number): number {
  return Math.max(1, Math.round(beats * (60 / bpm) * sampleRate));
}

/**
 * Circular seam wrap: add every sample at index >= loopSamples back into the head
 * (index mod loopSamples), then truncate to loopSamples. No fade — sample 0 continues
 * sample N-1 so a looping player has no click/dip at the seam.
 */
export function wrapLoopTail(data: Float32Array<ArrayBuffer>, loopSamples: number): Float32Array<ArrayBuffer> {
  const n = Math.min(loopSamples, data.length);
  const out = data.slice(0, n);
  for (let i = n; i < data.length; i++) out[i % n] += data[i];
  return out;
}

/**
 * Clip fade envelope applied to note velocity during offline render.
 * Loop/region exports (Game-pack beds, stems) skip clip fadeIn/fadeOut so beat 0 is not
 * silenced on every wrap; full-song export and live playback keep the fade.
 */
export function noteFadeGain(fade: number, loopExport: boolean): number {
  return loopExport ? 1 : fade;
}
