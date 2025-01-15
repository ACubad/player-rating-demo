
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD81rZub0pepZWUmyTVjjqIkRLWcp_tZuY",
  authDomain: "player-rankings-ef4fe.firebaseapp.com",
  databaseURL: "https://player-rankings-ef4fe-default-rtdb.firebaseio.com",
  projectId: "player-rankings-ef4fe",
  storageBucket: "player-rankings-ef4fe.firebasestorage.app",
  messagingSenderId: "489943168808",
  appId: "1:489943168808:web:dd39dcd79f34c3a43c021d",
  measurementId: "G-D20XJYTRRW",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// State variables
let primaryFilter = "votes";
let secondaryFilter = "";
let isAscending = true;
let isLocalUpdate = false;

const votedPlayers = JSON.parse(localStorage.getItem("votedPlayers")) || [];


// Array of Player Data
const players = [
  { name: "Player 1", stats: "20 goals, 15 assists", rank: 1, photo: "images/player1.jpg", votes: 0 },
  { name: "Player 2", stats: "18 goals, 10 assists", rank: 2, photo: "images/player2.jpg", votes: 0 },
  { name: "Player 3", stats: "16 goals, 8 assists", rank: 3, photo: "images/player3.jpg", votes: 0 },
  { name: "Player 4", stats: "15 goals, 12 assists", rank: 4, photo: "images/player4.jpg", votes: 0 },
  { name: "Player 5", stats: "14 goals, 11 assists", rank: 5, photo: "images/player5.jpg", votes: 0 },
  { name: "Player 6", stats: "12 goals, 14 assists", rank: 6, photo: "images/player6.jpg", votes: 0 },
  { name: "Player 7", stats: "10 goals, 16 assists", rank: 7, photo: "images/player7.jpg", votes: 0 },
  { name: "Player 8", stats: "9 goals, 13 assists", rank: 8, photo: "images/player8.jpg", votes: 0 },
  { name: "Player 9", stats: "8 goals, 15 assists", rank: 9, photo: "images/player9.jpg", votes: 0 },
  { name: "Player 10", stats: "7 goals, 12 assists", rank: 10, photo: "images/player10.jpg", votes: 0 },
  { name: "Player 11", stats: "6 goals, 10 assists", rank: 11, photo: "images/player11.jpg", votes: 0 },
  { name: "Player 12", stats: "5 goals, 9 assists", rank: 12, photo: "images/player12.jpg", votes: 0 },
  { name: "Player 13", stats: "4 goals, 8 assists", rank: 13, photo: "images/player13.jpg", votes: 0 },
  { name: "Player 14", stats: "3 goals, 6 assists", rank: 14, photo: "images/player14.jpg", votes: 0 },
  { name: "Player 15", stats: "2 goals, 5 assists", rank: 15, photo: "images/player15.jpg", votes: 0 },
  { name: "Player 16", stats: "21 goals, 10 assists", rank: 16, photo: "images/player16.jpg", votes: 0 },
  { name: "Player 17", stats: "19 goals, 12 assists", rank: 17, photo: "images/player17.jpg", votes: 0 },
  { name: "Player 18", stats: "17 goals, 9 assists", rank: 18, photo: "images/player18.jpg", votes: 0 },
];

// DOM Elements
const playerGrid = document.getElementById("player-grid");
const leaderboardGrid = document.getElementById("leaderboard-grid");

// Display players
function displayPlayers() {
  const playerCards = players.map(player => `
    <div class="player-card fade-in">
      <img src="${player.photo}" alt="${player.name}" class="player-photo">
      <div class="player-name">${player.name}</div>
      <div class="player-stats">${player.stats}</div>
      <div class="player-votes">Votes: ${player.votes}</div>
      <button class="vote-button" onclick="voteForPlayer('${player.name}')">Vote</button>
    </div>
  `).join("");

  playerGrid.innerHTML = playerCards;
}

// Improved Vote Function
function voteForPlayer(playerName) {
  const votedPlayers = JSON.parse(localStorage.getItem("votedPlayers")) || [];

  if (votedPlayers.includes(playerName)) {
    alert("You have already voted for this player!");
    return;
  }

  votedPlayers.push(playerName);
  localStorage.setItem("votedPlayers", JSON.stringify(votedPlayers));

  const playerIndex = players.findIndex(player => player.name === playerName);
  if (playerIndex !== -1) {
    players[playerIndex].votes++;
    isLocalUpdate = true; // Avoid redundant Firebase update
    firebase.database().ref(`players/${playerIndex}/votes`).set(players[playerIndex].votes)
      .then(() => {
        console.log(`Vote for ${playerName} synced with Firebase.`);
        displayPlayers();
        highlightPlayerCard(playerName); // Add highlight effect
        updateLeaderboard();
      })
      .catch(error => {
        console.error("Error syncing vote:", error);
        alert("An error occurred while registering your vote.");
      });
  }

  const user = auth.currentUser; // Get the current logged-in user
    if (!user) {
        alert("You must be logged in to vote!");
        return;
    }
    
}


// Update leaderboard
function updateLeaderboard() {
  const topPlayers = [...players].sort((a, b) => b.votes - a.votes).slice(0, 3);

  const leaderboardCards = topPlayers.map(player => `
    <div class="leaderboard-card">
      <img src="${player.photo}" alt="${player.name}" class="player-photo">
      <div class="player-name">${player.name}</div>
      <div class="player-stats">${player.stats}</div>
      <div class="player-votes">Votes: ${player.votes}</div>
    </div>
  `).join("");

  leaderboardGrid.innerHTML = leaderboardCards;
}

// Reset Votes (Improved)
function resetVotes() {
  const confirmReset = confirm("Are you sure you want to reset all votes?");
  if (confirmReset) {
    // Reset all player votes to 0
    players.forEach(player => {
      player.votes = 0;
    });

    // Clear votedPlayers in localStorage
    localStorage.setItem("votedPlayers", JSON.stringify([]));

    // Sync reset votes with Firebase
    isLocalUpdate = true; // Avoid triggering Firebase listener
    firebase.database().ref('players').set(players)
      .then(() => {
        console.log("Votes reset and synced with Firebase.");
        displayPlayers();
        updateLeaderboard();
        alert("Votes have been reset. You can vote again!");
      })
      .catch(error => {
        console.error("Error resetting votes in Firebase:", error);
        alert("An error occurred while resetting votes.");
      });
  }
}


// Sort players
function sortPlayers(primary, secondary, ascending) {
  players.sort((a, b) => {
    const primaryComparison = compareByCriteria(a, b, primary, ascending);
    return primaryComparison !== 0 ? primaryComparison : compareByCriteria(a, b, secondary, ascending);
  });

  displayPlayers();
  updateLeaderboard();
}

// Compare players by criteria
function compareByCriteria(a, b, criteria, ascending) {
  let valueA, valueB;

  if (criteria === "votes") {
    valueA = a.votes;
    valueB = b.votes;
  } else if (criteria === "rank") {
    valueA = a.rank;
    valueB = b.rank;
  } else if (criteria === "goals") {
    valueA = parseInt(a.stats.split(" goals")[0]);
    valueB = parseInt(b.stats.split(" goals")[0]);
  }

  return ascending ? valueA - valueB : valueB - valueA;
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.querySelectorAll(".player-card, .leaderboard, button").forEach(el => el.classList.toggle("dark-mode"));
}

// Load dark mode preference
function loadDarkModePreference() {
  if (localStorage.getItem("darkMode") === "enabled") toggleDarkMode();
}

// Highlight Player Card
function highlightPlayerCard(playerName) {
  const cards = document.querySelectorAll(".player-card");
  cards.forEach(card => {
    const name = card.querySelector(".player-name").textContent;
    if (name === playerName) {
      card.classList.add("highlight");
      setTimeout(() => card.classList.remove("highlight"), 500); // Remove after 500ms
    }
  });
}

// Fetch players from Firebase
function fetchPlayersFromFirebase() {
  firebase.database().ref('players').once('value')
    .then(snapshot => {
      const fetchedPlayers = snapshot.val();
      if (fetchedPlayers) {
        players.length = 0;
        players.push(...fetchedPlayers);
        displayPlayers();
        updateLeaderboard();
      }
    })
    .catch(error => console.error("Error fetching players:", error));
}

// Event Listeners
document.getElementById("reset-button").addEventListener("click", resetVotes);
document.getElementById("sort-toggle").addEventListener("click", () => {
  isAscending = !isAscending;
  document.getElementById("sort-toggle").textContent = isAscending ? "Ascending" : "Descending";
  sortPlayers(primaryFilter, secondaryFilter, isAscending);
});
document.getElementById("dark-mode-toggle").addEventListener("click", toggleDarkMode);
document.getElementById("filter-dropdown-primary").addEventListener("change", e => {
  primaryFilter = e.target.value;
  sortPlayers(primaryFilter, secondaryFilter, isAscending);
});
document.getElementById("filter-dropdown-secondary").addEventListener("change", e => {
  secondaryFilter = e.target.value;
  sortPlayers(primaryFilter, secondaryFilter, isAscending);
});

// Realtime Firebase Listener (Improved)
firebase.database().ref('players').on('value', snapshot => {
  if (!isLocalUpdate) {
    const updatedPlayers = snapshot.val();
    if (updatedPlayers) {
      players.length = 0; // Clear existing players
      players.push(...updatedPlayers); // Update players array
      displayPlayers(); // Re-render players
      updateLeaderboard(); // Update leaderboard
    }
  }
  isLocalUpdate = false; // Reset flag
});

// Initialize
firebase.database().ref('players').once('value')
  .then(snapshot => {
    if (snapshot.exists()) {
      fetchPlayersFromFirebase();
    } else {
      firebase.database().ref('players').set(players)
        .then(() => console.log("Initial players uploaded to Firebase"))
        .catch(error => console.error("Error uploading players:", error));
    }
  })
  .catch(error => console.error("Error checking Firebase data:", error));

loadDarkModePreference();







