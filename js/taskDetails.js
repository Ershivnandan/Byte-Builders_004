import { database } from "./firebase.config.js";
import {
  get,
  ref,
  set,
  push,
  update,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { auth } from "./firebase.config.js";

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("taskId");
const goalForm = document.getElementById("goalForm");

const taskDetail = document.getElementById("taskDetail");
taskDetail.innerText = "Task details";

document.getElementById("createGoalBtn").addEventListener("click", () => {
  document.getElementById("goal-modal").classList.remove("hidden");
});

const modal = document.getElementById("goal-modal");
const closeModalButtons = document.querySelectorAll(
  "[data-modal-hide='goal-modal']"
);

function closeModal() {
  modal.classList.add("hidden");
}

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

// Check if taskId is present
if (taskId) {
  fetchTaskGoals(taskId);
} else {
  console.log("No task ID found in the URL");
}

function fetchTaskGoals(taskId) {
  const goalsRef = ref(database, `goals`);

  get(goalsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const goals = snapshot.val();

        const filteredGoals = Object.entries(goals)
          .filter(([goalId, goal]) => goal.taskId === taskId)
          .map(([goalId, goal]) => ({ goalId, ...goal }));

        if (filteredGoals.length > 0) {
          displayGoals(filteredGoals);
        } else {
          displayNoGoals();
        }
      } else {
        displayNoGoals();
      }
    })
    .catch((error) => {
      console.error("Error fetching goals:", error);
    });
}

// Function to display goals on the page
function displayGoals(goals) {
  const goalsContainer = document.getElementById("goalsContainer");
  goalsContainer.innerHTML = ""; 

  goals.forEach((goal) => {
    const goalElement = document.createElement("tr");
    goalElement.className =
      " border-b ";

    const goalDetails = `
                <th scope="row" class="px-6 py-4 font-medium text-center">
                    ${goal.title}
                </th>
                <td class="px-6 py-4 text-center">
                    ${goal.description}
                </td>
                <td class="px-6 py-4 text-center">
                    ${goal.startDate}
                </td>
                <td class="px-6 py-4 text-center">
                    ${goal.startTime}
                </td>
                <td class="px-6 py-4 text-center">
                    ${goal.endDate}
                </td>
                <td class="px-6 py-4 text-center">
                    ${goal.endTime}
                </td>
                <td class="px-6 py-4 text-right text-center">
                    <a href="#" class="font-medium ${goal.status === 0 ? "text-red-500" : goal.status === 1 ? "text-blue-500" : "text-green-500" }">${goal.status === 0 ? "Todo" : goal.status === 1 ? "Progress" : "Completed" }</a>
                </td>
                <td class="px-6 py-4 text-sm text-right text-yellow-600 text-center">
                   <i class="fa-solid fa-pen-to-square  cursor-pointer hover:scale-125 duration-200"></i>
                </td>
                <td class="px-6 py-4 text-sm text-right text-blue-500 text-center">
                    <i class="fa-solid fa-box-archive cursor-pointer hover:scale-125 duration-200"></i>
                </td>
                <td class="px-6 py-4 text-sm text-red-500 text-right text-center">
                    <i class="fa-solid fa-trash cursor-pointer hover:scale-125 duration-200"></i>
                </td>
          
      `;

    goalElement.innerHTML = goalDetails;

    // Append goal to the container
    goalsContainer.appendChild(goalElement);
  });
}

function displayNoGoals() {
  const goalsContainer = document.getElementById("goalsContainer");
  goalsContainer.innerHTML = `
      <p>No goals found for this task.</p>
    `;
}

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("gTitle").value;
  const description = document.getElementById("gDescription").value;
  const startDate = document.getElementById("gStartdate").value;
  const startTime = document.getElementById("gStarttime").value;
  const endDate = document.getElementById("gEnddate").value;
  const endTime = document.getElementById("gEndtime").value;

  const goalData = {
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    status: 0,
    isArchive: false,
  };

  if (taskId) {
    addGoalToTask(taskId, goalData);
    closeModal();
  } else {
    console.error("No task ID found!");
  }
});

function addGoalToTask(taskId, goalData) {
  const goalRef = ref(database, "goals/" + taskId);
  const userId = auth.currentUser.uid;

  const goalId = push(ref(database, "goals")).key;
  const goalRefForNewGoal = ref(database, `goals/${goalId}`);

  set(goalRefForNewGoal, {
    ...goalData,
    taskId: taskId,
    userId: userId,
    createdAt: new Date().toISOString(),
  })
    .then(() => {
      const taskRef = ref(database, `tasks/${taskId}/goals`);
      const updates = {};
      updates[`/${goalId}`] = true;
      update(taskRef, updates)
        .then(() => {
          console.log("Goal added successfully to task");
          fetchTaskGoals(taskId);
        })
        .catch((error) => {
          console.error("Error updating task with goal:", error);
        });
    })
    .catch((error) => {
      console.error("Error adding goal:", error);
    });
}
