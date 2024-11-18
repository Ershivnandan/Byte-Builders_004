import { checkLoggedin } from "./auth.js";

const clientId = "2afb0602e5174cf3bcd145c2c993b6f2";
const clientSecret = "49fb608670d1451b92e7b12b8b707075";

// Event listeners for play/pause functionality
let isPlaying = false;
let audioPlayer = document.getElementById("audioPlayer");
let playPauseButton = document.getElementById("playPauseButton");
let playIcon = document.getElementById("playIcon");
let timeline = document.getElementById("timeline");
let volumeControl = document.getElementById("volumeControl");

// Fetch token to authenticate with Spotify API
async function getToken() {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(clientId + ":" + clientSecret)}`,
      },
      body: "grant_type=client_credentials",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get token");
    return data.access_token;
  } catch (error) {
    console.error("Error fetching token:", error.message);
    alert("Failed to connect to Spotify API.");
    return null;
  }
}

// Search for songs based on a query
async function searchSong(query) {
  const token = await getToken();
  if (!token) return [];

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch songs");
    return data.tracks.items || [];
  } catch (error) {
    console.error("Error fetching songs:", error.message);
    return [];
  }
}

// Display songs on the page
async function searchAndDisplaySongs(query) {
  const trackList = document.getElementById("trackList");
  trackList.innerHTML = "<p>Loading...</p>";

  const songs = await searchSong(query);
  if (songs.length === 0) {
    trackList.innerHTML = "<p>No results found.</p>";
    return;
  }

  trackList.innerHTML = "";
  songs.forEach((song) => {
    const trackDiv = document.createElement("div");
    trackDiv.className = "bg-white p-4 rounded-lg shadow-md flex flex-col items-center";

    const trackImage = document.createElement("img");
    trackImage.src = song.album.images[0]?.url || "https://via.placeholder.com/150";
    trackImage.alt = "Album Cover";
    trackImage.className = "w-full h-40 object-cover rounded";

    const trackName = document.createElement("p");
    trackName.className = "mt-2 font-bold text-center";
    trackName.textContent = `${song.name} - ${song.artists[0].name}`;

    const playButton = document.createElement("button");
    playButton.className = "mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded hover:bg-orange-600";
    playButton.textContent = "Play Preview";
    playButton.onclick = () => playSong(song);

    trackDiv.appendChild(trackImage);
    trackDiv.appendChild(trackName);
    trackDiv.appendChild(playButton);

    trackList.appendChild(trackDiv);
  });
}

// Play song preview
function playSong(song) {
  if (!song.preview_url) {
    alert("No preview available for this song!");
    return;
  }

  audioPlayer.src = song.preview_url;

  audioPlayer
    .play()
    .then(() => {
      audioPlayer.hidden = false;
      isPlaying = true;
      playIcon.classList.add("fa-pause");
      playIcon.classList.remove("fa-play");
    })
    .catch((error) => {
      console.error("Error playing audio:", error.message);
    });
}

// Random calm songs query
function loadRandomCalmSongs() {
  searchAndDisplaySongs("calm focus"); 
}



playPauseButton.addEventListener("click", () => {
  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    playIcon.classList.remove("fa-pause");
    playIcon.classList.add("fa-play");
  } else {
    audioPlayer.play();
    isPlaying = true;
    playIcon.classList.remove("fa-play");
    playIcon.classList.add("fa-pause");
  }
});

// Update the timeline while song is playing
audioPlayer.addEventListener("timeupdate", () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  timeline.value = progress;
});

// Allow user to adjust the timeline
timeline.addEventListener("input", () => {
  const seekTo = (timeline.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = seekTo;
});

// Adjust volume
volumeControl.addEventListener("input", () => {
  audioPlayer.volume = volumeControl.value / 100;
});

// Debounced search input
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout); // Clear the previous timeout if there is any
    timeout = setTimeout(() => func.apply(this, args), delay); // Set a new timeout
  };
}

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a song name!");
    return;
  }
  searchAndDisplaySongs(query);
});

searchInput.addEventListener(
  "input",
  debounce(() => {
    const query = searchInput.value.trim();
    if (query) searchAndDisplaySongs(query);
  }, 500)
);

checkLoggedin();
window.addEventListener("load", loadRandomCalmSongs);
