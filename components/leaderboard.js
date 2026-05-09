export function Leaderboard(teams) {

  const sorted = [...teams].sort((a, b) => b.points - a.points);

  return `
    <section class="leaderboard">
      <h2>🏆 Leaderboard</h2>

      <table>
        <tr>
          <th>Team</th>
          <th>Points</th>
        </tr>

        ${sorted.map(t => `
          <tr>
            <td>${t.name}</td>
            <td>${t.points}</td>
          </tr>
        `).join("")}
      </table>
    </section>
  `;
}
