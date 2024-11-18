import { getUserProfile } from "./auth.js";
import { auth, database } from "./firebase.config.js";
import {
  get,
  ref,
  set,
  push,
  update,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

let currentUserData;

export async function fetchNotifications() {
  currentUserData = await getUserProfile();
  let userIdOfUser = currentUserData.userId || currentUserData.uid;
  const notificationsRef = ref(
    database,
    `notifications/${userIdOfUser}`
  );
  const snapshot = await get(notificationsRef);

  if (snapshot.exists()) {
    const notifications = snapshot.val();
    console.log("Fetched Notifications:", notifications);

    const notificationsArray = Object.values(notifications);
    return notificationsArray;
  } else {
    console.log("No notifications found!");
    return [];
  }
}

export async function sendNotification(reciverId, messageObj) {
  try {
    const notificationRef = push(ref(database, `notifications/${reciverId}`));
    const notificationId = notificationRef.key;

    await set(notificationRef, {
      ...messageObj,
      notificationId,
      timestamp: new Date().toISOString(),
    });

    console.log("notification Send")

  } catch (error) {
    console.log(error.message);
  }
}

export async function removeNotification(userId, notificationId) {
    console.log(userId, notificationId)
  try {
    const notificationRef = ref(
      database,
      `notifications/${userId}/${notificationId}`
    );
    await set(notificationRef, null); // Deletes the notification
    console.log(`Notification ${notificationId} removed successfully!`);
  } catch (error) {
    console.error("Error removing notification:", error.message);
  }
}
