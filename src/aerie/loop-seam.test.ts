import { test } from "node:test";
import assert from "node:assert/strict";
import { loopSampleCount, wrapLoopTail } from "./loop-seam.ts";

test("loop length is sample-exact, no +0.25 s pad", () => {
  assert.equal(loopSampleCount(16, 72, 44100), Math.round(16 * (60 / 72) * 44100));
  assert.equal(loopSampleCount(8, 120, 44100), 176400);
  assert.equal(loopSampleCount(7, 97, 44100), Math.round(7 * (60 / 97) * 44100));
});

test("tail wraps additively into head and truncates", () => {
  const loop = 100;
  const data = new Float32Array(loop + 250).fill(0);
  data[loop - 1] = 0.5;
  data[loop] = 0.25; data[loop + 1] = 0.125; data[loop * 2 + 3] = 0.1;
  const out = wrapLoopTail(data, loop);
  assert.equal(out.length, loop);
  assert.equal(out[0], 0.25);
  assert.equal(out[1], 0.125);
  assert.ok(Math.abs(out[3] - 0.1) < 1e-7);
  assert.equal(out[loop - 1], 0.5); // no fade-to-silence at end
});

test("wrapped sustained tone is continuous across seam", () => {
  const sr = 44100, loop = loopSampleCount(4, 90, sr), f = sr / (loop / 40); // integer cycles per loop
  const data = new Float32Array(loop + sr);
  for (let i = 0; i < data.length; i++) data[i] = i < loop ? Math.sin((2 * Math.PI * f * i) / sr) * 0.5 : 0;
  const out = wrapLoopTail(data, loop);
  const jump = Math.abs(out[0] - out[loop - 1]);
  const step = Math.abs(out[1] - out[0]);
  assert.ok(jump <= step * 1.5, `seam jump ${jump} vs step ${step}`);
});
