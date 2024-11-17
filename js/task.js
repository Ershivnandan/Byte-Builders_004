import { checkLoggedin } from "./auth.js";
import { database } from "./firebase.config.js";
import { auth } from "./firebase.config.js";

import {
  get,
  ref,
  set,
  push,
  update,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getTasksByUser } from "./team.js";
const modal = document.getElementById("static-modal");

document.querySelectorAll("[data-modal-hide]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});
const TaskPagetitle = document.getElementById("TaskPagetitle");
TaskPagetitle.innerText = "Task";

let userTasks;
checkLoggedin();

document.getElementById("createTaskBtn").addEventListener("click", () => {
  document.getElementById("static-modal").classList.remove("hidden");
});

// Hide modal on cancel or close button click
document.querySelectorAll("[data-modal-hide]").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("static-modal").classList.add("hidden");
  });
});

async function fetchUsertask() {
  userTasks = await getTasksByUser();
  if (userTasks) displayTasks(userTasks);
}

const bgColors = [
  "bg-gradient-to-r from-teal-500 to-blue-900",
  "bg-gradient-to-r from-green-400 to-blue-600",
  "bg-gradient-to-r from-purple-600 to-indigo-900",
  "bg-gradient-to-r from-pink-400 via-purple-500 to-blue-600",
  "bg-gradient-to-r from-teal-600 to-green-700",
  "bg-gradient-to-l from-blue-700 to-yellow-300",
  "bg-gradient-to-r from-pink-300 to-pink-100",
  "bg-gradient-to-l from-gray-800 to-blue-400",
  "bg-gradient-to-r from-fuchsia-500 to-cyan-500",
  "bg-gradient-to-r from-cyan-400 to-green-300",
  "bg-gradient-to-r from-indigo-600 to-indigo-500",
  "bg-gradient-to-r from-green-500 to-green-300",
  "bg-gradient-to-r from-green-200 to-blue-200",
];

const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = await auth.currentUser.uid;
  console.log(userId);
  const title = document.getElementById("tTitle").value;
  const description = document.getElementById("tDescription").value;
  const startDate = new Date().toISOString();
  const endDate = document.getElementById("tEnddate").value;

  // Generate a unique task ID
  const taskId = push(ref(database, "tasks")).key;

  const newTask = {
    userId,
    title,
    description,
    startDate,
    endDate,
    isArchive: false,
    goals: [],
    contributors: [],
  };

  await set(ref(database, `tasks/${taskId}`), newTask);
  modal.classList.add("hidden");
  fetchUsertask();
});

async function updateTaskInFirebase(updatedTask) {
  const taskRef = ref(database, `tasks/${updatedTask.taskId}`);

  await update(taskRef, {
    title: updatedTask.title,
    description: updatedTask.description,
    startDate: updatedTask.startDate,
  });

  console.log("Task updated successfully!");
}

async function toggleArchiveTask(taskId, currentStatus) {
  const taskRef = ref(database, `tasks/${taskId}`);

  await update(taskRef, {
    isArchive: !currentStatus,
  });

  fetchUsertask();
  console.log("Task archive status toggled successfully!");
}

async function deleteTask(taskId) {
  const taskRef = ref(database, `tasks/${taskId}`);
  await set(taskRef, null);
  fetchUsertask();
}

function displayTasks(userTasks) {
  const taskGrid = document.getElementById("taskGrid");
  taskGrid.innerHTML = "";

  userTasks.forEach((task, index) => {
    // if (task.isArchive) {
    //   return;
    // }
    const card = document.createElement("div");
    card.className = `flex flex-col justify-between border rounded-lg p-4 text-white ${
      bgColors[Math.floor(Math.random() * bgColors.length)]
    }`;
    card.id = task.taskId;
    const detailButtonId = `taskDetail-${task.taskId}`;
    const deleteButtonId = `taskDelete-${task.taskId}`;
    const editButtonId = `taskEdit-${task.taskId}`;
    const archiveButtonId = `taskArchive-${task.taskId}`;

    card.innerHTML = `
        <div class="flex-grow">
          <div class="flex justify-between">
            <h4 class="text-lg font-bold">${task.title}</h4>
            <div class="flex gap-2">
          <div id="${editButtonId}" class="text-blue-500 cursor-pointer">
            <i class="fa-solid fa-edit"></i>
          </div>
          <div id="${archiveButtonId}" class="text-yellow-500 cursor-pointer">
            <i class="fa-solid fa-box-archive"></i>
          </div>
          <div id="${deleteButtonId}" class="text-red-500 cursor-pointer">
            <i class="fa-solid fa-trash"></i>
          </div>
        </div>
          </div>
          <p class="text-base text-gray-400 overflow-hidden text-ellipsis whitespace-normal line-clamp-3">
            ${task.description}
          </p>
        </div>
        <button id="${detailButtonId}" class="flex mt-4 w-full justify-center items-center gap-1 group font-medium border border-gray-100 rounded-lg px-2">
          <span>Details</span>
          <span class="group-hover:translate-x-1/2 duration-200 mt-1"><i class="fa-solid fa-arrow-right-long"></i></span>
        </button>
      `;

    taskGrid.appendChild(card);

    document.getElementById(detailButtonId).addEventListener("click", () => {
      window.location.href = `taskdetail.html?taskId=${task.taskId}`;
    });
    document.getElementById(deleteButtonId).addEventListener("click", () => {
      deleteTask(task.taskId);
    });
    document.getElementById(editButtonId).addEventListener("click", () => {
      openEditModal(task);
    });
    document.getElementById(archiveButtonId).addEventListener("click", () => {
      toggleArchiveTask(task.taskId, task.isArchive);
    });
  });
}

function formatDateForInput(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function openEditModal(task) {
  const modal = document.getElementById("editTaskModal");

  modal.querySelector("#taskTitle").value = task.title;
  modal.querySelector("#taskDescription").value = task.description;
  modal.querySelector("#taskStartDate").value = formatDateForInput(
    task.startDate
  );

  modal.querySelector("#saveTaskButton").onclick = () => {
    const updatedTask = {
      taskId: task.taskId,
      title: modal.querySelector("#taskTitle").value,
      description: modal.querySelector("#taskDescription").value,
      startDate: modal.querySelector("#taskStartDate").value,
    };

    updateTaskInFirebase(updatedTask);
    modal.classList.add("hidden");
  };

  modal.classList.remove("hidden");
}

fetchUsertask();

document.getElementById("cancelEditButton").addEventListener("click", () => {
  closeEditModal();
});

function closeEditModal() {
  const modal = document.getElementById("editTaskModal");

  modal.classList.add("hidden");
}
