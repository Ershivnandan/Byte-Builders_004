class sidebarManager extends HTMLElement {
  connectedCallback() {
    // Define the routes and their corresponding labels
    const routes = [
      { name: "Home", url: "home.html", icon: `<i class="fa-solid fa-house"></i>` },
      { name: "Task", url: "task.html", icon: `<i class="fa-solid fa-bars-progress"></i>` },
      { name: "Calendar", url: "calendar.html", icon: `<i class="fa-solid fa-calendar-days"></i>` },
      { name: "Music", url: "music.html", icon: `<i class="fa-solid fa-podcast"></i>` },
      { name: "Analytics", url: "analytics.html", icon: `<i class="fa-solid fa-chart-line"></i>` },
    ];

    const routeLinks = routes
      .map((route) => {
        const isActive = window.location.href.includes(route.url)
          ? "bg-orange-200 text-orange-500"
          : "";
        return `
            <li class="w-full">
              <a
                href="${route.url}"
                class="flex gap-2 items-center p-2 rounded-lg text-white hover:bg-orange-200 hover:text-orange-500 ${isActive}"
              >
              <span>${route.icon}</span>
              <span> ${route.name}</span>
                
              </a>
            </li>
          `;
      })
      .join(""); 
      
  
    this.innerHTML = `
        <div
          style="width: 20%"
          id="sidebar"
          class="fixed w-full  top-0 left-0 z-40 h-screen p-4 overflow-y-auto w-64 bg-gray-900 transform md:translate-x-0 -translate-x-full transition-transform duration-300 ease-in-out"
        >
          <h5 class="text-base p-2 font-semibold text-white uppercase ">
            Menu
          </h5>
  
          <!-- Close Button (Hidden on large screens) -->
          <button
            id="closeSidebar"
            class="text-gray-400 bg-transparent hover:bg-orange-200 hover:text-orange-500 rounded-lg text-sm w-8 h-8 absolute top-2 right-2 inline-flex items-center justify-center md:hidden"
          >
            <svg
              class="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span class="sr-only">Close menu</span>
          </button>
  
          <!-- Route Links -->
          <div class="py-4 overflow-y-auto">
            <ul class="space-y-2 font-medium">
              ${routeLinks}
            </ul>
          </div>
        </div>
      `;

    // Open/Close Sidebar functionality
    const openSidebarButton = document.getElementById("openSidebar");
    const sidebar = document.getElementById("sidebar");
    const closeSidebarButton = document.getElementById("closeSidebar");

    // Open the sidebar
    openSidebarButton?.addEventListener("click", () => {
      sidebar.classList.remove("-translate-x-full");
    });

    // Close the sidebar
    closeSidebarButton?.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
    });
  }
}

customElements.define("side-bar", sidebarManager);
