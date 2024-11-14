import { database } from "./firebase.config.js";
import {
    get,
    ref,
    set,
    push,
    update,
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("taskId");

const taskDetail = document.getElementById("taskDetail");
taskDetail.innerText = "Task details";


// Check if taskId is present
if (taskId) {
  fetchTaskGoals(taskId);
} else {
  console.log("No task ID found in the URL");
}

// Function to fetch goals related to the task
function fetchTaskGoals(taskId) {
  const goalsRef = ref(database, `tasks/${taskId}/goals`);
  get(goalsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const goals = snapshot.val();
      displayGoals(goals);
    } else {
      displayNoGoals();
    }
  }).catch((error) => {
    console.error("Error fetching goals:", error);
  });
}

// Function to display goals on the page
function displayGoals(goals) {
  const goalsContainer = document.getElementById("goalsContainer");
  goalsContainer.innerHTML = "";

  Object.entries(goals).forEach(([goalId, goal]) => {
    const goalElement = document.createElement("div");
    goalElement.className = "goal-item";
    goalElement.innerText = goal.title;
    goalsContainer.appendChild(goalElement);
  });
}

function displayNoGoals() {
  const goalsContainer = document.getElementById("goalsContainer");
  goalsContainer.innerHTML = `
    <p>No goals found for this task.</p>
  `;

  document.getElementById("addGoalButton").addEventListener("click", () => {
    // Code to open a modal or navigate to an add-goal page
    console.log("Add goal button clicked");
  });
}
