import { matches } from "../data/matches.js";
import { getMatchResult } from "../utils/matchEngine.js";

export function Matches() {
  return `
    <section class="matches">
      <h2>⚽ Live Matches</h2>

      <div class="match-list">
        ${matches.map(match => `
          <div class="match-card">
            <h3>${match.teamA} vs ${match.teamB}</h3>

            <p>
              Score: ${match.scoreA ?? "-"} - ${match.scoreB ?? "-"}
            </p>

            <p>Status: ${match.status}</p>

            <p>
              Result: ${getMatchResult(match)}
            </p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}
