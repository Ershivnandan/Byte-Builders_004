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

let debounceTimeout = null;

function toggleStatus(goalId, currentStatus) {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const nextStatus = (currentStatus + 1) % 3;
    
    updateGoalStatus(goalId, nextStatus);
  }, 300);
}


function updateGoalStatus(goalId, status) {
  const goalRef = ref(database, `goals/${goalId}`);
  

  update(goalRef, { status })
    .then(() => {
      console.log("Goal status updated successfully!");
      fetchTaskGoals(taskId);
    })
    .catch((error) => {
      console.error("Error updating goal status:", error);
    });
}

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


if (taskId) {
  fetchTaskGoals(taskId);
} else {
  console.log("No task ID found in the URL");
}

export function fetchTaskGoals(taskId) {
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


function displayGoals(goals) {
  const goalsContainer = document.getElementById("goalsContainer");
  goalsContainer.innerHTML = "";

  goals.forEach((goal) => {
    const goalElement = document.createElement("tr");
    goalElement.className = " border-b ";

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
      <td class="px-6 py-4 text-center">
        <a href="#" class="font-medium ${goal.status === 0 ? 'text-red-500' : goal.status === 1 ? 'text-blue-500' : 'text-green-500'}">
          ${goal.status === 0 ? 'Todo' : goal.status === 1 ? 'Progress' : 'Completed'}
        </a>
      </td>
      <td class="px-6 py-4 text-sm text-right text-yellow-600 text-center">
        <i class="fa-solid fa-pen-to-square cursor-pointer hover:scale-125 duration-200"></i>
      </td>
      <td class="px-6 py-4 text-sm text-right text-blue-500 text-center">
        <i class="fa-solid fa-box-archive cursor-pointer hover:scale-125 duration-200"></i>
      </td>
      <td class="px-6 py-4 text-sm text-red-500 text-right text-center">
        <i class="fa-solid fa-trash cursor-pointer hover:scale-125 duration-200"></i>
      </td>
    `;

    goalElement.innerHTML = goalDetails;
    goalsContainer.appendChild(goalElement);

  
    const statusLink = goalElement.querySelector("a");
    statusLink.addEventListener("click", (e) => {
      e.preventDefault();
      toggleStatus(goal.goalId, goal.status);
    });

    goalElement.querySelector(".fa-pen-to-square").addEventListener("click", () => {
      openEditGoalModal(goal);
    });

    goalElement.querySelector(".fa-box-archive").addEventListener("click", () => {
      archiveGoal(goal.goalId);
    });

    goalElement.querySelector(".fa-trash").addEventListener("click", () => {
      deleteGoal(goal.goalId);
    });
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

function openEditGoalModal(goal) {
  const modal = document.getElementById("goal-modal");
  modal.classList.remove("hidden");

  document.getElementById("gTitle").value = goal.title;
  document.getElementById("gDescription").value = goal.description;
  document.getElementById("gStartdate").value = goal.startDate;
  document.getElementById("gStarttime").value = goal.startTime;
  document.getElementById("gEnddate").value = goal.endDate;
  document.getElementById("gEndtime").value = goal.endTime;

  document.getElementById("goalForm").onsubmit = (e) => {
    e.preventDefault();
    updateGoal(goal.goalId);
    closeModal();
  };
}

function updateGoal(goalId) {
  const updatedGoalData = {
    title: document.getElementById("gTitle").value,
    description: document.getElementById("gDescription").value,
    startDate: document.getElementById("gStartdate").value,
    startTime: document.getElementById("gStarttime").value,
    endDate: document.getElementById("gEnddate").value,
    endTime: document.getElementById("gEndtime").value,
    status: 1,
  };

  const goalRef = ref(database, `goals/${goalId}`);
  set(goalRef, updatedGoalData)
    .then(() => {
      console.log("Goal updated successfully!");
      fetchTaskGoals(taskId);
    })
    .catch((error) => {
      console.error("Error updating goal:", error);
    });
}

function archiveGoal(goalId) {
  const goalRef = ref(database, `goals/${goalId}`);

  update(goalRef, { isArchive: true })
    .then(() => {
      console.log("Goal archived successfully!");
      fetchTaskGoals(taskId);
    })
    .catch((error) => {
      console.error("Error archiving goal:", error);
    });
}

function deleteGoal(goalId) {
  const goalRef = ref(database, `goals/${goalId}`);

  set(goalRef, null)
    .then(() => {
      console.log("Goal deleted successfully!");
      fetchTaskGoals(taskId);
    })
    .catch((error) => {
      console.error("Error deleting goal:", error);
    });
}


// Function to fetch tasks for the logged-in user
export function fetchUserTasks() {
  const userId = auth.currentUser.uid;
  const tasksRef = ref(database, `tasks`);

  get(tasksRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const tasks = snapshot.val();
        const userTasks = {};

        Object.entries(tasks).forEach(([taskId, task]) => {
          if (task.userId === userId) {
            const taskDate = task.date; // Ensure this is formatted as "YYYY-MM-DD"
            if (!userTasks[taskDate]) userTasks[taskDate] = [];
            userTasks[taskDate].push(task.name); // Assuming task has a name property
          }
        });

        // Pass the user tasks to the calendar.js file
        updateCalendarTasks(userTasks); // You may need to adjust this function in calendar.js
      }
    })
    .catch((error) => {
      console.error("Error fetching user tasks:", error);
    });
}

// Call fetchUserTasks when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (auth.currentUser) {
    fetchUserTasks(); // Fetch tasks for the logged-in user when the page loads
  }
});