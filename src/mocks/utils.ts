export async function randomWaiting(time: number, threshold = 0.5) {
  if (Math.random() > threshold) {
    await new Promise((res) => setTimeout(res, time));
  }
}
