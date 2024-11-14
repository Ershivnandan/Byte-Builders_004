
import { signOutUser, getUserProfile } from '../js/auth.js'; 


class subnavManager extends HTMLElement {
  connectedCallback() {
    const userProfile = getUserProfile(); 

    const userImage = userProfile.photoURL || "https://dummyjson.com/image/150";
    const userName = userProfile.displayName || "GOAT";

    const routes = [
      { name: "Home", url: "home.html" },
      { name: "Task", url: "task.html" },
      { name: "Calendar", url: "calendar.html" },
      { name: "Music", url: "music.html" },
      { name: "Analytics", url: "analytics.html" },
      { name: "Task Goals", url: "taskdetail.html" },
    ];

    const currentPage = window.location.href;
    const currentRoute = routes.find(route => currentPage.includes(route.url));
    const headingText = currentRoute ? currentRoute.name : "Your Website";

    this.innerHTML = `
        <nav class="p-4 shadow-md">
          <div class="flex items-center justify-between">
            <!-- Heading on the left -->
            <div class="text-xl font-semibold">${headingText}</div>
  
            <!-- Profile menu on the right -->
            <div class="relative">
              <button
                type="button"
                class="flex items-center text-sm rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
                aria-expanded="false"
                onclick="toggleDropdown()"
              >
                <span class="sr-only">Open user menu</span>
                <img
                  class="w-8 h-8 rounded-full shadow shadow-white-500/50"
                  src="${userImage}"
                  alt="user photo"
                />
              </button>
  
              <!-- Dropdown menu -->
              <div
                class="z-50 hidden my-4 text-base list-none dropdown divide-y divide-gray-100 rounded-lg shadow absolute right-0"
                id="user-dropdown"
              >
                <div class="px-4 w-[12vw] py-3">
                  <span class="block text-sm">${userName}</span>
                  <span class="block text-sm truncate">${userProfile.email}</span>
                </div>
                <ul class="py-2" w-[12vw] aria-labelledby="user-menu-button">
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 text-sm hover:bg-gray-500 rounded-lg font-medium"
                      >Settings</a>
                  </li>
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 text-sm hover:bg-gray-500 rounded-lg font-medium"
                      id="signout-button"
                      >Sign out</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      `;

    
    document.getElementById("signout-button").addEventListener("click", () => {
      signOutUser();
    });


    window.toggleDropdown = () => {
      const dropdown = document.getElementById("user-dropdown");
      dropdown.classList.toggle("hidden");
    };

    
    window.addEventListener("click", function (event) {
      const dropdown = document.getElementById("user-dropdown");
      const button = document.getElementById("user-menu-button");

      if (!button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }
}

customElements.define("sub-nav", subnavManager);
