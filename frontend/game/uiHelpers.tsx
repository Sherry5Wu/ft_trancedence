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

export function updateScore(scoreBoard: HTMLElement, score1: number, score2: number, p1Name: string, p2Name: string) {
  if (scoreBoard) {
    scoreBoard.textContent = `${p1Name}: ${score1} | ${p2Name}: ${score2}`;
  }
}
