export function getMatchResult(match) {
  if (match.status !== "finished") return "Not Finished";

  if (match.scoreA > match.scoreB) return match.teamA;
  if (match.scoreB > match.scoreA) return match.teamB;

  return "Draw";
}
