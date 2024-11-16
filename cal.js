// Dummy task data (Replace with actual API function)
async function getAllTasks() {
    return [
      { id: 1, title: "Task 1", date: "2024-11-16" },
      { id: 2, title: "Task 2", date: "2024-11-18" },
      { id: 3, title: "Task 3", date: "2024-11-20" },
    ];
  }
  
  // Generate Calendar
  async function generateCalendar() {
    const calendar = document.getElementById("calendar");
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
  
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
    // Get all tasks
    const tasks = await getAllTasks();
  
    // Create empty cells for the first row
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "border border-gray-200 h-20";
      calendar.appendChild(emptyCell);
    }
  
    // Create cells for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.className = "border border-gray-200 h-20 relative";
  
      // Display the day number
      const dayNumber = document.createElement("span");
      dayNumber.textContent = day;
      dayNumber.className = "absolute top-2 left-2 text-gray-700";
      cell.appendChild(dayNumber);
  
      // Check if there's a task for this day
      const taskDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const dayTasks = tasks.filter(task => task.date === taskDate);
  
      // Add tasks to the cell
      dayTasks.forEach(task => {
        const taskLabel = document.createElement("div");
        taskLabel.textContent = task.title;
        taskLabel.className = "mt-5 text-sm bg-blue-100 text-blue-800 rounded px-1";
        cell.appendChild(taskLabel);
      });
  
      calendar.appendChild(cell);
    }
  }
  
  // Load calendar
  generateCalendar();
  