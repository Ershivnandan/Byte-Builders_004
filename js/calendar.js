import { checkLoggedin } from "./auth.js";
import { getTasksByUser } from "./team.js";

let userTasks = {}; 
const today = new Date();
today.setHours(0, 0, 0, 0);

let date = new Date(); 
const currentMonth = document.querySelector(".current-month");
const calendarDays = document.querySelector(".calendar-days");

currentMonth.textContent = date.toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

async function getTaskData() {
  const tasks = await getTasksByUser();
  userTasks = {};

  tasks.forEach((task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const effectiveStart = start < monthStart ? monthStart : start;
    const effectiveEnd = end > monthEnd ? monthEnd : end;

    while (effectiveStart <= effectiveEnd) {
      const dateKey = effectiveStart.toISOString().split("T")[0];
      if (!userTasks[dateKey]) userTasks[dateKey] = [];
      userTasks[dateKey].push({ title: task.title, id: task.taskId });
      effectiveStart.setDate(effectiveStart.getDate() + 1);
    }
  });

  renderCalendar();
}

function renderCalendar() {
  const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  const totalMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startWeekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  calendarDays.innerHTML = "";

  const totalCalendarDay = 6 * 7;
  for (let i = 0; i < totalCalendarDay; i++) {
    const day = i - startWeekDay + 1;
    const fullDate = new Date(date.getFullYear(), date.getMonth(), day)
      .toISOString()
      .split("T")[0];

    if (i < startWeekDay) {
      calendarDays.innerHTML += `<div class="text-gray-400 text-sm">${
        prevLastDay - startWeekDay + i + 1
      }</div>`;
    } else if (i < startWeekDay + totalMonthDay) {
      const isToday = today.toISOString().split("T")[0] === fullDate;
      const hasTasks = userTasks[fullDate];

      calendarDays.innerHTML += ` 
        <div 
          class="cursor-pointer ${
            isToday ? "bg-gray-900 text-white" : hasTasks ? "bg-orange-500 text-white" : "bg-gray-100"
          } text-center p-2 w-full h-20 rounded shadow-sm transition hover:scale-105 text-sm relative"
          data-date="${fullDate}">
          <span class="block font-bold">${day}</span>
          ${
            hasTasks
              ? `<div class="task-container overflow-x-auto h-full scroll-hidden text-center items-center flex space-x-1">
                    ${userTasks[fullDate]
                      .map(
                        (task) =>
                          `<div class="task-item text-xs truncate capitalize font-semibold bg-blue-500 text-white p-1 rounded-md cursor-pointer h-5 text-center min-w-max" data-id="${task.id}">
                            ${task.title}
                          </div>`
                      )
                      .join("")}
                  </div>
                  ` 
              : ""
          }
        </div>`;
    } else {
      calendarDays.innerHTML += `<div class="text-gray-400 text-sm">${
        i - startWeekDay - totalMonthDay + 1
      }</div>`;
    }
  }

  document.querySelectorAll(".task-item").forEach((taskItem) => {
    taskItem.addEventListener("click", (e) => {
      const taskId = e.currentTarget.dataset.id;
      window.location.href = `/taskdetail.html?taskId=${taskId}`;
    });
  });
}

document.querySelectorAll(".month-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("prev-month")) {
      date.setMonth(date.getMonth() - 1);
    } else if (btn.classList.contains("next-month")) {
      date.setMonth(date.getMonth() + 1);
    }

    currentMonth.textContent = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    renderCalendar();
  });
});

// Add event listeners for Today, Next Year, and Previous Year buttons
document.querySelector(".prev-year").addEventListener("click", () => {
  date.setFullYear(date.getFullYear() - 1);
  currentMonth.textContent = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  renderCalendar();
});

document.querySelector(".next-year").addEventListener("click", () => {
  date.setFullYear(date.getFullYear() + 1);
  currentMonth.textContent = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  renderCalendar();
});

document.querySelector(".today").addEventListener("click", () => {
  date = new Date(); // Set date to today
  currentMonth.textContent = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  renderCalendar();
});

checkLoggedin();
getTaskData();
