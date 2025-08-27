export function updatePauseOverlay(pauseOverlay: HTMLElement, paused: boolean, awaitingStart: boolean) {
  if (pauseOverlay) {
    pauseOverlay.style.visibility = paused && !awaitingStart ? "visible" : "hidden";
  }
}

export function updateStartPrompt(startPrompt: HTMLElement, awaitingStart: boolean) {
  if (startPrompt) {
    startPrompt.style.visibility = awaitingStart ? "visible" : "hidden";
  }
}
