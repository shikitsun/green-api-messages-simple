let isDisabledDelay = false;

export function disableDelay() {
  isDisabledDelay = true;
}

export async function randomWaiting(time: number, threshold = 0.5) {
  const delay = isDisabledDelay ? 0 : time;

  if (delay > 0 && Math.random() > threshold) {
    await new Promise((res) => setTimeout(res, delay));
  }
}
