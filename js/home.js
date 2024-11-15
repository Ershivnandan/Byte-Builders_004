import { checkLoggedin, getUserProfile } from "./auth.js";
import { auth, database } from "./firebase.config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  get,
  ref,
  set,
  push,
  update,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

let HomePagetitle = document.getElementById("HomePagetitle");
HomePagetitle.innerText = "Home";

const dropdownButton = document.getElementById("dropdownDefaultButton");
const dropdownMenu = document.getElementById("dropdown");

const cancelCreateteamBtn = document.getElementById("cancelCreateteamBtn");
document.getElementById("dateOfTheDay").textContent = getToday();
const homeUserName =  document.getElementById("homeUsername").textContent = getUserProfile().displayName;

const completedTaskCount = document.getElementById("completedTaskCount");
completedTaskCount.innerHTML = 0;

dropdownButton.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

cancelCreateteamBtn.addEventListener("click", () => {
  closeModal();
});

document.addEventListener("DOMContentLoaded", () => {
  checkLoggedin();
});

const createTeamBtn = document.getElementById("createTeamBtn");
const modal = document.getElementById("createTeamModal");

createTeamBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

function closeModal() {
  modal.classList.add("hidden");
}

function getToday(){
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

   
    const today = new Date();
    const dayName = days[today.getDay()]; 
    const date = today.getDate(); 
    const monthName = months[today.getMonth()];

    
    const formattedDate = `${dayName} ${date} ${monthName}`;
    return formattedDate
}

const createTeamForm = document.getElementById("createTeamForm");
createTeamForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teamName = document.getElementById("teamName").value;
  const teamDescription = document.getElementById("teamDescription").value;
  const participantsInput = document.getElementById("participants").value;
  const participants = participantsInput
    .split(",")
    .map((email) => email.trim());

  const user = auth.currentUser;
  const creatorId = user ? user.uid : null;

  const teamRef = {
    name: teamName,
    description: teamDescription,
    participants: participants,
    creatorId: creatorId,
  };

  try {
    const newTeamRef = push(ref(database, "teams"));
    await set(newTeamRef, teamRef);

    closeModal();
    console.log("Team created successfully!");
  } catch (error) {
    console.error("Error creating team: ", error);
  }
});

const teamSearchInput = document.getElementById("teamSearchInput");
const teamsList = document.getElementById("teamsList");

teamSearchInput.addEventListener("input", async () => {
  const searchTerm = teamSearchInput.value.toLowerCase();
  if (searchTerm) {
    const teamsRef = ref(database, "teams");
    const snapshot = await get(teamsRef);

    teamsList.innerHTML = "";

    if (snapshot.exists()) {
      const teams = snapshot.val();
      Object.keys(teams).forEach((teamId, index) => {
        const team = teams[teamId];
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
          teamsList.appendChild(teamElement);
          document.getElementById(buttonid).addEventListener("click", () => {
            joinTeam(teamId);
          });
        }
      });
    }
  } else {
    teamsList.innerHTML = "";
  }
});

async function joinTeam(teamId) {
  const user = auth.currentUser;
  const userId = user ? user.uid : null;
  const userdata = await getUserProfile();
  const userEmail = userdata.email;

  if (userId && userEmail) {
    const teamRef = ref(database, `teams/${teamId}/participants`);

    try {
      const snapshot = await get(teamRef);
      let participants = snapshot.exists() ? snapshot.val() : {};

      const nextIndex = Object.keys(participants).length;

      const isAlreadyAdded = Object.values(participants).includes(userEmail);
      if (isAlreadyAdded) {
        alert("You are already part of this team.");
        return;
      }

      await update(teamRef, {
        [nextIndex]: userEmail,
      });

      alert("Joined the team successfully!");
    } catch (error) {
      console.error("Error joining team: ", error);
      alert("Failed to join the team. Please try again later.");
    }
  } else {
    alert("Please login to join a team.");
  }
}

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
                displayTeamIcon(userTeam);
            }
        }
      }
    }
  });
}

function displayTeamIcon(team) {
  const teamIconContainer = document.getElementById("teamIconContainer");

  const teamIcon = document.createElement("div");
  teamIcon.className = "relative flex items-center cursor-pointer ";

  teamIcon.innerHTML = `
      <div class="bg-gray-900 text-white w-10 h-10 flex justify-center items-center rounded-full">
        <i class="fas fa-users"></i>
      </div>
      <div class="absolute bg-gray-900 top-0 right-0 mt-8 text-white p-2 rounded-lg shadow-lg hidden" id="teamDropdown">
        <ul class="space-y-4 px-2 bg-gray-900">
          ${team.participants.map((email) => `<li>${email}</li>`).join("")}
        </ul>
      </div>
    `;

  teamIcon.addEventListener("click", () => {
    const dropdownMenu = document.getElementById("teamDropdown");
    dropdownMenu.classList.toggle("hidden");
  });

  teamIconContainer.innerHTML = "";
  teamIconContainer.appendChild(teamIcon);
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
      "flex items-center border border-gray-600 py-2 rounded-lg hover:scale-105 duration-200 px-2";

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
  });
}

function displayTotalGoals(userGoals) {
  completedTaskCount.innerHTML = 0;

  const completedGoals = userGoals.filter((goal) => goal.status === 2);

  completedTaskCount.innerHTML = completedGoals.length;
}

checkIfTeamExists();
fetchTopGoals();
