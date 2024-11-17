import {
  checkLoggedin,
  currentUserData,
  getUserProfile,
  saveUserProfileToDatabase,
} from "./auth.js";
import { auth, database } from "./firebase.config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  get,
  ref,
  set,
  push,
  update,
  child,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

export const deleteTeamByTeamIdAndCreatorId = async (teamId, creatorId) => {
  console.log("called", teamId);
  try {
    const teamRef = ref(database, `teams/${teamId}`);

    const snapshot = await get(teamRef);

    if (!snapshot.exists()) {
      console.log(`Team with ID ${teamId} not found.`);
      return;
    }

    const team = snapshot.val();
    if (team.creatorId === creatorId) {
      await remove(teamRef);
      console.log(`Team with ID ${teamId} deleted successfully.`);
    } else {
      console.log("Creator ID does not match. Cannot delete the team.");
    }
  } catch (error) {
    console.error("Error deleting team: ", error);
  }
};

export async function joinTeam(teamId) {
  const user = auth.currentUser;
  const userId = user ? user.uid : null;
  const userdata = await getUserProfile();
  const userid = userdata.userId;

  if (userId && userid) {
    const teamRef = ref(database, `teams/${teamId}/participants`);

    try {
      const snapshot = await get(teamRef);
      let participants = snapshot.exists() ? snapshot.val() : {};

      const nextIndex = Object.keys(participants).length;

      const isAlreadyAdded = Object.values(participants).includes(userid);
      if (isAlreadyAdded) {
        alert("You are already part of this team.");
        return;
      }

      await update(teamRef, {
        [nextIndex]: userid,
      });

      alert("Joined the team successfully!");
      checkIfTeamExists();
    } catch (error) {
      console.error("Error joining team: ", error);
      alert("Failed to join the team. Please try again later.");
    }
  } else {
    alert("Please login to join a team.");
  }
}

export function getTasksByUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const tasksRef = ref(database, "tasks");
        try {
          const snapshot = await get(tasksRef);
          if (snapshot.exists()) {
            const tasks = snapshot.val();
            const userTasks = Object.entries(tasks)
              .filter(([taskId, task]) => task.userId === userId)
              .map(([taskId, task]) => ({ taskId, ...task }));
            resolve(userTasks);
          } else {
            const taskGrid = document.getElementById("taskGrid");
            taskGrid.innerHTML = `
                <div class="flex justify-center items-center text-center font-bold text-3xl">
                  <p>
                    You have no task yet!
                  </p>
                </div>
              `;
            console.log("No tasks found for the user.");
            resolve([]);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
          reject(error);
        }
      } else {
        console.log("User not logged in.");
        resolve([]);
      }
    });
  });
}

export function fetchTaskGoals(taskId) {
  const goalsRef = ref(database, `goals`);

  return get(goalsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const goals = snapshot.val();

        const filteredGoals = Object.entries(goals)
          .filter(([goalId, goal]) => {
            return goal.taskId === taskId;
          })
          .map(([goalId, goal]) => ({ goalId, ...goal }));
        if (filteredGoals.length > 0) {
          return filteredGoals;
        } else {
          return [];
        }
      } else {
        return [];
      }
    })
    .catch((error) => {
      console.error("Error fetching goals:", error);
      return [];
    });
}
