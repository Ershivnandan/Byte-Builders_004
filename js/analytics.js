import { getTasksByUser } from "./team.js";

let usertask;
async function getuserTask() {
    usertask = await getTasksByUser();
    displyTask(usertask);
}

const tasksContainer = document.getElementById('tasks-container');

function displyTask(tasks) {
    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card', 'relative', 'bg-gradient-to-r', 'from-purple-500', 'via-indigo-500', 'to-blue-500', 'p-4', 'rounded-lg', 'shadow-md', 'hover:shadow-xl', 'transition-all', 'flex', 'flex-col');

        // Format date function
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        // Append task content
        taskCard.innerHTML = `
            <h3 class="text-xl font-semibold text-white hover:text-blue-200 truncate">${task.title}</h3>
            <p class="text-sm text-gray-200 mt-2 line-clamp-3 overflow-hidden flex-grow">${task.description}</p>
            <div class="flex flex-col justify-between mt-4 pt-2 flex-shrink-0">
                <div class="flex justify-between items-center text-sm text-gray-100">
                    <span>Start: ${formatDate(task.startDate)}</span>
                    <span>End: ${formatDate(task.endDate)}</span>
                </div>
                <a href="analyticsdetail.html?taskId=${task.taskId}" class="block mt-4 text-blue-200 font-semibold hover:underline">Go to Analytics</a>
            </div>
        `;

        tasksContainer.appendChild(taskCard);
    });
}

getuserTask();
