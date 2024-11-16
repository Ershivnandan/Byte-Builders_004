const clientId = "2afb0602e5174cf3bcd145c2c993b6f2";
const clientSecret = "49fb608670d1451b92e7b12b8b707075";

// Get token from Spotify API
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

// Search for songs
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
    return data.tracks.items || [];
  } catch (error) {
    console.error("Error fetching songs:", error.message);
    return [];
  }
}

// Display results
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

// Debounce function to limit API calls
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Play a song
// function playSong(song) {
//   const audioPlayer = document.getElementById("audioPlayer");
//   const currentTrack = document.getElementById("currentTrack");

//   if (!song.preview_url) {
//     alert("No preview available for this song!");
//     return;
//   }

//   audioPlayer.src = song.preview_url;
//   audioPlayer.play();

//   currentTrack.textContent = `Playing: ${song.name} by ${song.artists[0].name}`;
// }

function playSong(song) {
    const audioPlayer = document.getElementById("audioPlayer");
    const currentTrack = document.getElementById("currentTrack");
  
    // Check if the song has a preview URL
    if (!song.preview_url) {
      alert("No preview available for this song!");
      return;
    }
  
    // Set the audio source and play
    audioPlayer.src = song.preview_url;
  
    // Attempt to play the audio
    audioPlayer
      .play()
      .then(() => {
        currentTrack.textContent = `Playing: ${song.name} by ${song.artists[0].name}`;
        audioPlayer.hidden = false; // Ensure the audio player is visible
      })
      .catch((error) => {
        console.error("Error playing audio:", error.message);
        alert("Unable to play the song. Please try again.");
      });
  }
  

// Attach event listener with debouncing
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", () => {
  if (!searchInput.value.trim()) {
    alert("Please enter a song name!");
    return;
  }
  searchAndDisplaySongs(searchInput.value.trim());
});

searchInput.addEventListener(
  "input",
  debounce(() => {
    if (searchInput.value.trim()) searchAndDisplaySongs(searchInput.value.trim());
  }, 500)
);
