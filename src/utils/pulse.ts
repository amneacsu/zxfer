export const PULSE = {
  SYNC_1: 667,
  SYNC_2: 735,
  BIT_0: 855,
  BIT_1: 1710,
  PILOT: 2168,
};

const pulseLengths = Object.values(PULSE);

export const samplesToStates = (samples: number) => {
  return 3546900 / sampleRate * samples;
};

const nearestV = (value: number, breakpoints: number[], speed = 1) => {
  const lAdjustedForSpeed = breakpoints.map((l) => l * speed);
  const diffs = lAdjustedForSpeed.map((l) => Math.abs(l - value));
  const min = Math.min(...diffs);
  const minIdx = diffs.indexOf(min);
  return lAdjustedForSpeed[minIdx];
};

export const nearest = (state: string, tStates: number, speed = 1) => {
  if (tStates <= 400) return 0;
  if (tStates >= 4000) return 0;

  let likelyPulses: number[] = pulseLengths;

  switch (state) {
    case 'WAITPILOT': likelyPulses = [PULSE.PILOT]; break;
    case 'PILOT': likelyPulses = [PULSE.PILOT, PULSE.SYNC_1, PULSE.SYNC_2]; break;
    case 'PROG': likelyPulses = [PULSE.BIT_0, PULSE.BIT_1]; break;
    default: break;
  }

  return nearestV(tStates, likelyPulses, speed);
};
