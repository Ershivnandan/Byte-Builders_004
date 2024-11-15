function displayTasks(userTasks) {
    const taskGrid = document.getElementById("taskGrid");
    taskGrid.innerHTML = "";
  
    userTasks.forEach((task, index) => {
      const card = document.createElement("div");
      card.className = `flex flex-col justify-between border rounded-lg p-4 text-white ${
        bgColors[Math.floor(Math.random() * bgColors.length)]
      }`;
      card.id = task.taskId;
      const detailButtonId = `taskDetail-${task.taskId}`;
      const deleteButtonId = `taskDelete-${task.taskId}`;
  
      card.innerHTML = `
          <div class="flex-grow">
            <div class="flex justify-between">
              <h4 class="text-lg font-bold">${task.title}</h4>
              <div id="${deleteButtonId}" class="text-red-500 cursor-pointer">
                <i class="fa-solid fa-trash"></i>
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
          deleteTask(task.taskId)
      });
    });
  }