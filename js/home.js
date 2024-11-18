import { checkLoggedin, currentUserData, getUserProfile, saveUserProfileToDatabase } from "./auth.js";
import { auth, database } from "./firebase.config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  get,
  ref,
  set,
  push,
  update,
  child,
  remove
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { sendNotification } from "./notification.js";
import { joinTeam } from "./team.js";

const participantsSearchInput = document.getElementById("participantsSearch");
const participantsList = document.getElementById("participantsList");

let HomePagetitle = document.getElementById("HomePagetitle");
HomePagetitle.innerText = "Home";

const teamSearchInput = document.getElementById("teamSearchInput");
const teamsList = document.getElementById("teamsList");
teamsList.innerHTML = "";

const dropdownButton = document.getElementById("dropdownDefaultButton");
const dropdownMenu = document.getElementById("dropdown");

const cancelCreateteamBtn = document.getElementById("cancelCreateteamBtn");
document.getElementById("dateOfTheDay").textContent = getToday();
const homeUserName = document.getElementById("homeUsername");

let participant = [];
currentUserData;

const completedTaskCount = document.getElementById("completedTaskCount");
completedTaskCount.innerHTML = 0;

dropdownButton.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

cancelCreateteamBtn.addEventListener("click", () => {
  participant = [];
  closeModal();
});

document.addEventListener("DOMContentLoaded", async () => {
  checkLoggedin();
});

if (teamSearchInput.textContent === null) {
  teamsList.innerHTML = "";
}

const createTeamBtn = document.getElementById("createTeamBtn");
const modal = document.getElementById("createTeamModal");

createTeamBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  checkIfTeamExists();
});

async function setHomeUserName() {
  try {
    const profile = await getUserProfile();
    homeUserName.textContent = profile.displayName  || profile.name;
  } catch (error) {
    console.error("Error setting user name:", error);
    homeUserName.textContent = "Guest";
  }
}

function closeModal() {
  modal.classList.add("hidden");
}

function getToday() {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = new Date();
  const dayName = days[today.getDay()];
  const date = today.getDate();
  const monthName = months[today.getMonth()];

  const formattedDate = `${dayName} ${date} ${monthName}`;
  return formattedDate;
}

participantsSearchInput.addEventListener("input", async () => {
  const searchTerm = participantsSearchInput.value.toLowerCase();

  if (searchTerm) {
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    participantsList.innerHTML = "";
    if (snapshot.exists()) {
      const users = snapshot.val();
      let matchCount = 0;

      Object.keys(users).forEach((userId) => {
        const user = users[userId];
        if (user.uid === currentUserData.userId) return;

        if (
          user.email.toLowerCase().includes(searchTerm) ||
          user.name.toLowerCase().includes(searchTerm)
        ) {
          matchCount++;
          if (matchCount > 5) return;
          const suggestionElement = document.createElement("div");
          suggestionElement.className =
            "participant-suggestion flex gap-2 p-2 hover:bg-gray-100 cursor-pointer";

          suggestionElement.innerHTML = `
            <img loading="lazy" src="${user.photoURL}" alt="${user.name}" class="w-8 h-8 rounded-full">
            <span class="user-name">${user.name}</span>
          `;

          suggestionElement.addEventListener("click", () => {
            addParticipant(user);
            participantsList.innerHTML = "";
          });

          participantsList.appendChild(suggestionElement);
        }
      });

      if (matchCount === 0) {
        const noResultsMessage = document.createElement("div");
        noResultsMessage.className = "p-2 text-gray-500 text-sm";
        noResultsMessage.textContent = "No results found.";
        participantsList.appendChild(noResultsMessage);
      }
    }
  } else {
    participantsList.innerHTML = "";
  }
});

function addParticipant(user) {
  if (participant.includes(user.uid) || user.uid === currentUserData.userId) {
    return;
  }

  const participantsInput = document.getElementById("participantsInput");
  const participantElement = document.createElement("div");
  participantElement.className =
    "participant flex items-center gap-3 p-2 mb-2 border rounded-md";

  participantElement.innerHTML = `
    <img loading="lazy" src="${user.photoURL}" alt="${user.name}" class="w-6 h-6 rounded-full">
    <span>${user.name}</span>
    <i class="remove-participant fa-solid fa-xmark text-red-500 px-2 py-1 cursor-pointer"></i>
  `;

  participant.push(user.uid);

  participantElement
    .querySelector(".remove-participant")
    .addEventListener("click", () => {
      participantElement.remove();
      removeParticipantEmail(user.email);
    });

  participantsInput.appendChild(participantElement);
}

function removeParticipantEmail(email) {
  const participantsInput = document.getElementById("participantsInput");
  const participants = participantsInput.value.split(",");
  const updatedParticipants = participants.filter(
    (participant) => participant.trim() !== email
  );
  participantsInput.value = updatedParticipants.join(",");
}

const createTeamForm = document.getElementById("createTeamForm");

createTeamForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const teamName = document.getElementById("teamName").value;
  const teamDescription = document.getElementById("teamDescription").value;

  const user = auth.currentUser;
  const creatorId = user ? user.uid : null;
  const teamRef = {
    name: teamName,
    description: teamDescription,
    creatorId: creatorId,
  };

  try {
    const newTeamRef = push(ref(database, "teams"));
    const teamId = newTeamRef.key;
    await set(newTeamRef, { ...teamRef, teamId });
    console.log("cdscscs")

    sendInvitations(participant, teamName, teamId, creatorId);
    let userData = {
      ...currentUserData,
      teamId
    }
    saveUserProfileToDatabase(userData)
    closeModal();
    console.log("Team created successfully!");
  } catch (error) {
    console.error("Error creating team: ", error);
  }
});

async function sendInvitations(participants, teamName, teamId, creatorId) {

  for (let userId of participants) {
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const user = userSnapshot.val();

      const messageObj = {
        message: `You've been invited to join the team "${teamName}".`,
        teamId: teamId,
        senderId: creatorId,
        senderImage: currentUserData.photoURL,
      };

      await sendNotification(user.uid, messageObj);
    }
  }
}

teamSearchInput.addEventListener("input", async () => {
  const searchTerm = teamSearchInput.value.toLowerCase();
  if (searchTerm) {
    const teamsRef = ref(database, "teams");
    const snapshot = await get(teamsRef);
    if (searchTerm === "") {
      teamsList.innerHTML = "";
      return;
    }

    teamsList.innerHTML = "";

    if (snapshot.exists()) {
      const teams = snapshot.val();
      Object.keys(teams).forEach((teamId, index) => {
        const team = teams[teamId];
        if (searchTerm === null) {
          return;
        }
        if (team.name.toLowerCase().includes(searchTerm)) {
          const teamElement = document.createElement("div");

          teamElement.className = "w-full flex text-white gap-2 px-4 py-4 ";
          const buttonid = `${teamId}-${index}`;
          teamElement.innerHTML = `
            <div class="flex justify-between w-full items-center rounded-md mb-2">
              <span>${team.name}</span>
              <button class="bg-orange-500 text-white px-4 py-1 rounded-lg" id="${buttonid}">Join</button>
            </div>
          `;
          if (teamSearchInput) {
            teamsList.appendChild(teamElement);
            document.getElementById(buttonid).addEventListener("click", () => {
              joinTeam(teamId);
            });
          } else {
            teamsList.innerHTML = "";
          }
        }
      });
    }
  } else {
    teamsList.innerHTML = "";
  }
});



function fetchUserGoals(timePeriod) {
  const userId = auth.currentUser.uid;
  const goalsRef = ref(database, `goals`);
  const now = new Date();
  const timeLimit = new Date();

  if (timePeriod === "week") {
    timeLimit.setDate(now.getDate() - 7);
  } else if (timePeriod === "month") {
    timeLimit.setMonth(now.getMonth() - 1);
  }

  get(goalsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const allGoals = snapshot.val();
        const filteredGoals = Object.entries(allGoals)
          .filter(
            ([goalId, goal]) =>
              goal.userId === userId && new Date(goal.createdAt) >= timeLimit
          )
          .map(([goalId, goal]) => ({ goalId, ...goal }));

        displayUserGoals(filteredGoals, timePeriod);
      }
    })
    .catch((error) => console.error("Error fetching user goals:", error));
}

function fetchTopGoals() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      const goalsRef = ref(database, `goals`);

      get(goalsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const allGoals = snapshot.val();

            const userGoals = Object.entries(allGoals)
              .filter(([goalId, goal]) => {
                return String(goal.userId) === String(userId);
              })
              .map(([goalId, goal]) => ({ goalId, ...goal }));
            displayTopGoals(userGoals);
            displayTotalGoals(userGoals);
          } else {
            console.log("No goals found in database.");
          }
        })
        .catch((error) => console.error("Error fetching top goals:", error));
    } else {
      console.log("User is not logged in.");
    }
  });
}

async function checkIfTeamExists() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userId = user ? user.uid : null;

      if (userId) {
        const teamsRef = ref(database, "teams");
        const snapshot = await get(teamsRef);

        if (snapshot.exists()) {
          const teams = snapshot.val();
          let userTeam = null;

          for (const teamId in teams) {
            if (teams[teamId].creatorId === userId) {
              userTeam = teams[teamId];
              break;
            }
          }

          if (userTeam) {
            createTeamBtn.classList.add("hidden");
            console.log(userTeam)
            displayTeamIcon(userTeam);
          }
        }
      }
    }
  });
}

async function displayTeamIcon(team) {
  const teamIconContainer = document.getElementById("teamIconContainer");

  const teamRef = ref(database, `teams/${team.teamId}`);
  const teamData = await get(teamRef);
  console.log(teamData.val())
  // Create the main team icon element
  const teamIcon = document.createElement("div");
  teamIcon.className = "relative flex items-center cursor-pointer ";

  teamIcon.innerHTML = `
      <div class="bg-gray-900 text-white w-10 h-10 flex justify-center items-center rounded-full">
        <i class="fas fa-users"></i>
      </div>
      <div class="absolute w-48 bg-gray-900 top-0 right-0 mt-8 text-white p-2 rounded-lg shadow-lg hidden" id="teamDropdown">
        <ul class="space-y-4 px-2 bg-gray-900" id="teamParticipantsList"></ul>
      </div>
    `;

  teamIconContainer.innerHTML = "";
  teamIconContainer.appendChild(teamIcon);

  const participantsList = team.participants;
  const users = await Promise.all(
    participantsList.map(async (userId) => {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      return userSnapshot.exists() ? userSnapshot.val() : null;
    })
  );

  const teamParticipantsList = document.getElementById("teamParticipantsList");
  if (teamParticipantsList) {
    users.forEach((user) => {
      if (user) {
        const participantItem = document.createElement("li");
        participantItem.className = "flex items-center gap-2 p-1";

        participantItem.innerHTML = `
          <img src="${user.photoURL}" alt="${user.name}" class="w-6 h-6 rounded-full">
          <span class="line-clamp-1 text-sm">${user.name}</span>
        `;
        teamParticipantsList.appendChild(participantItem);
      }
    });
  }

  teamIcon.addEventListener("click", () => {
    const dropdownMenu = document.getElementById("teamDropdown");
    if (dropdownMenu) {
      dropdownMenu.classList.toggle("hidden");
    }
  });
}

function displayTopGoals(userGoals) {
  const topGoals = userGoals
    .sort((a, b) => Number(b.status) - Number(a.status))
    .slice(0, 5);
  const topGoalsContainer = document.getElementById("topGoalsContainer");
  topGoalsContainer.innerHTML = "";

  topGoals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center border border-gray-600 py-2 rounded-lg hover:scale-105 duration-200 px-2 cursor-pointer";
    const listId = `goal-${index}-list`;
    li.id = listId;
    li.innerHTML = `
        <i class="fa-solid fa-circle-check ${
          goal.status === 0
            ? "text-gray-500"
            : goal.status === 1
            ? "text-orange-500"
            : "text-green-500"
        } me-2"></i>
        ${goal.title} 
    `;

    topGoalsContainer.appendChild(li);

    document.getElementById(listId).addEventListener("click", () => {
      window.location.href = `taskdetail.html?taskId=${goal.taskId}`;
    });
  });
}

function displayTotalGoals(userGoals) {
  completedTaskCount.innerHTML = 0;

  const completedGoals = userGoals.filter((goal) => goal.status === 2);

  completedTaskCount.innerHTML = completedGoals.length;
}

async function fetchAndDisplayGoals(filter) {
  try {
    const goalsRef = ref(database, "goals");
    const snapshot = await get(goalsRef);

    if (snapshot.exists()) {
      const goals = snapshot.val();
      const filteredGoals = Object.values(goals).filter((goal) => {
        const goalDate = new Date(goal.createdAt);
        const now = new Date();

        if (filter === "week") {
          const startOfWeek = new Date(
            now.setDate(now.getDate() - now.getDay())
          );
          return goalDate >= startOfWeek && goalDate <= new Date();
        } else if (filter === "month") {
          return (
            goalDate.getFullYear() === now.getFullYear() &&
            goalDate.getMonth() === now.getMonth()
          );
        }
        return false;
      });

      displayTopGoals(filteredGoals);
      return;
    } else {
      return "<p>No goals available.</p>";
    }
  } catch (error) {
    console.error("Error fetching goals:", error);
  }
}

document.querySelectorAll("#dropdown ul li a").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const filter = event.target.textContent.toLowerCase().includes("week")
      ? "week"
      : "month";

    const prefix = `
      <svg
        class="w-2.5 h-2.5 ms-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 10 6"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 4 4 4-4"
        />
      </svg>
    `;
    dropdownButton.innerHTML = event.target.textContent + prefix;

    fetchAndDisplayGoals(filter);

    dropdownMenu.classList.add("hidden");
  });
});


checkIfTeamExists();
setHomeUserName();
fetchTopGoals();
