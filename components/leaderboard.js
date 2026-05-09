import { leaderboardData } from "../data/leaderboard.js";

export function Leaderboard() {
  const sorted = leaderboardData.sort((a, b) => b.points - a.points);

  return `
    <section class="leaderboard">
      <h2>🏆 WorldCup Rankings</h2>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Points</th>
            <th>Wins</th>
            <th>Losses</th>
          </tr>
        </thead>

        <tbody>
          ${sorted.map((player, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${player.username}</td>
              <td>${player.points}</td>
              <td>${player.wins}</td>
              <td>${player.losses}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}
