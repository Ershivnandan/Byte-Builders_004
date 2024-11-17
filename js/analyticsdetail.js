import { fetchTaskGoals } from "./team.js";
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("taskId");

function groupTasksByDate(tasks) {
  const grouped = {};
  tasks.forEach((task) => {
    const { startDate, status } = task;
    if (!grouped[startDate]) {
      grouped[startDate] = [];
    }
    grouped[startDate].push(status);
  });
  return grouped;
}

function calculateAverageStatus(groupedTasks) {
  const averages = [];
  for (const date in groupedTasks) {
    const statuses = groupedTasks[date];
    const avgStatus =
      statuses.reduce((acc, status) => acc + status, 0) / statuses.length;
    averages.push({ date, avgStatus });
  }
  return averages;
}

function prepareChartData(tasks) {
  const groupedTasks = groupTasksByDate(tasks);
  const averageStatusData = calculateAverageStatus(groupedTasks);

  const labels = averageStatusData.map((item) => item.date);
  const data = averageStatusData.map((item) => {
    return item.avgStatus === 0 ? 0 : item.avgStatus === 1 ? 50 : 100;
  });

  return { labels, data };
}

async function fetchAndRenderChart() {
  try {
    const taskData = await fetchTaskGoals(taskId);
    console.log(taskData);

    const { labels, data } = prepareChartData(taskData);
    console.log(labels, data);

    const ctx = document.getElementById("myChart");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Task Progress (%)",
            data: data,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
              max: 100,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching task data:", error);
  }
}

fetchAndRenderChart();
