let userPicks = {};

export function Predictions(matches) {
  return `
    <section class="predictions">
      <h2>🧠 Make Your Predictions</h2>

      ${matches.map((m, i) => `
        <div class="match-card">
          <p>${m.home} vs ${m.away}</p>

          <div class="buttons">
            <button onclick="pick('${i}','home')">Home</button>
            <button onclick="pick('${i}','draw')">Draw</button>
            <button onclick="pick('${i}','away')">Away</button>
          </div>
        </div>
      `).join("")}
    </section>
  `;
}

// GLOBAL FUNCTION (simple version)
window.pick = function(matchId, choice) {
  userPicks[matchId] = choice;
  console.log("Prediction saved:", userPicks);
};
