import { signOutUser, getUserProfile } from "../js/auth.js";
import { deleteTeamByTeamIdAndCreatorId, joinTeam } from "../js/team.js";
import {
  fetchNotifications,
  removeNotification,
  sendNotification,
} from "../js/notification.js";

class subnavManager extends HTMLElement {
  async connectedCallback() {
    const userProfile = await getUserProfile();
    const userImage = userProfile.photoURL;
    const userName = userProfile.displayName || userProfile.name || "Guest";
    const notifications = await fetchNotifications();
    let notificationCount =
      notifications.length > 9 ? "9+" : notifications.length || 0;

    const routes = [
      { name: "Home", url: "home.html" },
      { name: "Task", url: "task.html" },
      { name: "Calendar", url: "calendar.html" },
      { name: "Music", url: "music.html" },
      { name: "Analytics", url: "analytics.html" },
      { name: "Task Goals", url: "taskdetail.html" },
      { name: "Progress Chart", url: "analyticsdetail.html" },
    ];

    const currentPage = window.location.href;
    const currentRoute = routes.find((route) =>
      currentPage.includes(route.url)
    );
    const headingText = currentRoute ? currentRoute.name : "Your Website";

    this.innerHTML = `
      <nav class="p-4 bg-orange-500 shadow-lg shadow-black-500/50">
        <div class="flex items-center justify-between">
          <div class="text-xl font-semibold">${headingText}</div>
  
          <div class="relative flex gap-2 items-center">
            <div id="user-notification-button"
                aria-expanded="false"
                onclick="toggleNotificationDropdown()"
                class="cursor-pointer flex justify-center items-center text-sm rounded-full border border-black text-xl w-7 h-7"
                >
              <i
                class="fa-solid fa-bell text-black ps-2"
              >
              </i>
              <sup class="font-medium text-white -mt-2">${notificationCount}</sup>
            </div>

            <!-- Notification Dropdown -->
            <div
              class="hidden z-50 absolute right-0 my-4 top-5 text-base list-none dropdown divide-y divide-gray-100 rounded-lg shadow"
              id="notification-dropdown"
            >
              <div class="px-4 py-3">
                <span class="block text-lg font-semibold">Notifications</span>
              </div>
              <ul class="py-2" id="notification-list">
                <!-- Notifications will be dynamically inserted here -->
              </ul>
            </div>

            <!-- User Menu Dropdown -->
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
                loading="lazy"
              />
            </button>
            <div
              class="z-50 hidden my-4 top-5 text-base list-none dropdown divide-y divide-gray-100 rounded-lg shadow absolute right-0"
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
                    id="deleteMyTeam"
                    class="block px-4 py-2 text-sm hover:bg-gray-500 rounded-lg font-medium"
                    >Delete your Team</a>
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

    if(userProfile){
      document.getElementById("deleteMyTeam").addEventListener("click", async ()=>{

          let userid = userProfile.userId || userProfile.uid;
        await deleteTeamByTeamIdAndCreatorId(userProfile.teamId, userid);
      });
    }

    window.toggleDropdown = () => {
      const dropdown = document.getElementById("user-dropdown");
      dropdown.classList.toggle("hidden");
    };

    window.toggleNotificationDropdown = async () => {
      const dropdown = document.getElementById("notification-dropdown");

      dropdown.classList.toggle("hidden");

      const notificationList = document.getElementById("notification-list");
      notificationList.innerHTML = "";
      notifications.forEach((notification, index) => {
        const notificationItem = document.createElement("li");
        const teamIdAcceptBtn = `accept-${notification.teamId}-${index}`;
        const teamIdRejectBtn = `reject-${notification.teamId}-${index}`;
        const removeNotifi = `remove-${notification.notificationId}`;
        notificationItem.className =
          "px-4 py-2 text-sm hover:bg-orange-300 hover:text-orange-500 rounded-lg flex items-center gap-2 w-full text-xs w-[500px]";
        notificationItem.innerHTML = `
            <img class="w-6 h-6 rounded-full" src="${
              notification.senderImage
            }" alt="sender photo">
            <span class="overflow-ellipsis line-clamp-2">${
              notification.message
            }</span>
            <span class="text-xs text-gray-500 ml-auto">${new Date(
              notification.timestamp
            ).toLocaleString()}</span>
            <div class="flex gap-3 text-base items-center">
              ${
                notification.teamId
                  ? `
                <div>
                    <button
                    type="submit"
                    class="bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-lg cursor-pointer"
                    id="${teamIdAcceptBtn}"
                  >
                    Join
                  </button>
                </div>

              <div class="cursor-pointer">
              <button
                type="submit"
                class="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-lg cursor-pointer"
                id="${teamIdRejectBtn}"
              >
                Reject
              </button>
            
             </div>
              `
                  : ``
              }
              <div>
               <i
                class="text-red-500 text-lg font-bold py-1 px-2 rounded-lg fa-solid fa-circle-xmark"
                id="${removeNotifi}"
              >
              </i>
             </div>
            </div>
          `;
        notificationList.appendChild(notificationItem);

        if (notification.teamId) {
          document
            .getElementById(teamIdAcceptBtn)
            .addEventListener("click", async () => {
              await joinTeam(notification.teamId);

              const message = {
                message: `${userName} has accepted your team invitation`,
                senderId: userProfile.userId || userProfile.uid,
                senderImage: userImage,
              };

              await sendNotification(notification.senderId, message);

              await removeNotification(
                userProfile.userId || userProfile.uid,
                notification.notificationId
              );
            });
          document
            .getElementById(teamIdRejectBtn)
            .addEventListener("click", async () => {
              const message = {
                message: `${userName} has rejected your team invitation`,
                senderId: userProfile.userId || userProfile.uid,
                senderImage: userImage,
              };

              await sendNotification(notification.senderId, message);

              await removeNotification(
                userProfile.userId || userProfile.uid,
                notification.notificationId
              );
            });
        }

        document
          .getElementById(removeNotifi)
          .addEventListener("click", async () => {
            await removeNotification(
              userProfile.userId || userProfile.uid,
              notification.notificationId
            );
          });
      });
    };

    // Close dropdown if clicking outside
    window.addEventListener("click", function (event) {
      const notificationDropdown = document.getElementById(
        "notification-dropdown"
      );
      const userMenuButton = document.getElementById("user-menu-button");
      const userDropdown = document.getElementById("user-dropdown");

      if (
        !userMenuButton.contains(event.target) &&
        !userDropdown.contains(event.target)
      ) {
        userDropdown.classList.add("hidden");
      }
    });
  }
}

customElements.define("sub-nav", subnavManager);
