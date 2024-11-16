let userTasks = {}; // This will hold tasks by date

// This function will be called from taskDetails.js to update tasks
function updateCalendarTasks(tasks) {
  userTasks = tasks; // Update the global user tasks
  renderCalendar(); // Re-render the calendar with updated tasks
}

const currentMonth = document.querySelector(".current-month");
const calendarDays = document.querySelector(".calendar-days");

const today = new Date();
let date = new Date();

currentMonth.textContent = date.toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});
today.setHours(0, 0, 0, 0);

renderCalendar();

function renderCalendar() {
  const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  const totalMonthDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
  const startWeekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  calendarDays.innerHTML = "";

  const totalCalendarDay = 6 * 7;
  for (let i = 0; i < totalCalendarDay; i++) {
    const day = i - startWeekDay + 1;
    const fullDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      day
    ).toISOString().split("T")[0];

    if (i < startWeekDay) {
      calendarDays.innerHTML += `<div class="text-gray-400 text-sm">${prevLastDay - startWeekDay + i + 1}</div>`;
    } else if (i < startWeekDay + totalMonthDay) {
      const isToday = today.toISOString().split("T")[0] === fullDate;
      const hasTasks = userTasks[fullDate];

      calendarDays.innerHTML += ` 
        <div class="${
          isToday ? "bg-orange-500 text-white" : "bg-gray-100"
        } ${
        hasTasks ? "border-2 border-orange-500" : "border"
      } text-center p-2 rounded shadow-sm cursor-pointer transition hover:scale-105 text-sm" style="height: 100px;">
          <span class="block font-bold">${day}</span>
          ${
            hasTasks
              ? `<ul class="text-xs mt-2 text-orange-600">${userTasks[fullDate]
                  .map((task) => `<li>${task}</li>`)
                  .join("")}</ul>` 
              : ""
          }
        </div>`;
    } else {
      calendarDays.innerHTML += `<div class="text-gray-400 text-sm">${i - startWeekDay - totalMonthDay + 1}</div>`;
    }
  }
}

// Event listeners for navigating months
document.querySelectorAll(".month-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Check if the clicked button is for the previous or next month
    if (btn.classList.contains("prev-month")) {
      date.setMonth(date.getMonth() - 1); // Decrease month by 1 for prev month
    } else if (btn.classList.contains("next-month")) {
      date.setMonth(date.getMonth() + 1); // Increase month by 1 for next month
    }

    // Update the current month and year text
    currentMonth.textContent = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Re-render the calendar with the updated date
    renderCalendar();
  });
});

// Event listeners for navigating years
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("today")) {
      date = new Date();
    } else if (btn.classList.contains("prev-year")) {
      date.setFullYear(date.getFullYear() - 1); // Decrease year by 1
    } else if (btn.classList.contains("next-year")) {
      date.setFullYear(date.getFullYear() + 1); // Increase year by 1
    }

    // Update the current month and year text
    currentMonth.textContent = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Re-render the calendar with the updated date
    renderCalendar();
  });
});
