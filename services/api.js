// services/api.js

const BASE_URL = "https://api.openligadb.de"; 
// Free football API (no key required for basic usage)

export async function fetchMatches() {
  try {
    const res = await fetch(`${BASE_URL}/getmatchdata/worldcup2026`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error loading matches:", err);
    return [];
  }
}

export async function fetchResults() {
  try {
    const res = await fetch(`${BASE_URL}/getmatchdata/worldcup2026`);
    const data = await res.json();

    // filter finished matches
    return data.filter(m => m.matchIsFinished === true);
  } catch (err) {
    console.error("Error loading results:", err);
    return [];
  }
}

export async function fetchUpcoming() {
  try {
    const res = await fetch(`${BASE_URL}/getmatchdata/worldcup2026`);
    const data = await res.json();

    // filter not started matches
    return data.filter(m => m.matchIsFinished === false);
  } catch (err) {
    console.error("Error loading upcoming:", err);
    return [];
  }
}
