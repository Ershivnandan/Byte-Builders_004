class sidebarManager extends HTMLElement {
  connectedCallback() {
    // Define the routes and their corresponding labels
    const routes = [
      { name: "Home", url: "home.html" },
      { name: "Task", url: "task.html" },
      { name: "Calendar", url: "calender.html" },
      { name: "Music", url: "music.html" },
      { name: "Analytics", url: "analytics.html" },
    ];


    const routeLinks = routes
      .map((route) => {
        const isActive = window.location.href.includes(route.url)
          ? "bg-gray-100 dark:bg-gray-700"
          : "";
        return `
            <li>
              <a
                href="${route.url}"
                class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive}"
              >
                ${route.name}
              </a>
            </li>
          `;
      })
      .join(""); 

  
    this.innerHTML = `
        <div
          id="sidebar"
          class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto bg-white w-64 dark:bg-gray-800 transform md:translate-x-0 -translate-x-full transition-transform duration-300 ease-in-out"
        >
          <h5 class="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
            Menu
          </h5>
  
          <!-- Close Button (Hidden on large screens) -->
          <button
            id="closeSidebar"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2 right-2 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white md:hidden"
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