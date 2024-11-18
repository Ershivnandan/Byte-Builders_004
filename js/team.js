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
import { sendNotification } from "./notification.js";

export const deleteTeamByTeamIdAndCreatorId = async (teamId, creatorId) => {

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


      const participants = team.participants || [];


      await Promise.all(
        participants.map(async (participantId) => {
          const userRef = ref(database, `users/${participantId}`);
          const userSnapshot = await get(userRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            const updatedTeams = (userData.teams || []).filter(
              (id) => id !== teamId
            );

            // Update the user's node
            await update(userRef, { ...userData, teams: updatedTeams });
            console.log(`Removed team ID ${teamId} from user ${participantId}`);
          } else {
            console.log(`User with ID ${participantId} not found.`);
          }
        })
      );
    } else {
      console.log("Creator ID does not match. Cannot delete the team.");
    }
  } catch (error) {
    console.error("Error deleting team: ", error);
  }
};

export async function joinTeam(teamId) {
    
    const userdata = await getUserProfile();
    const userid = userdata.userId || userdata.uid;
    if (!userid) {
      console.error("User not authenticated.");
      return;
    }
  
    try {

      if (!userid) {
        console.error("User profile not found.");
        return;
      }

      const teamRef = ref(database, `teams/${teamId}/participants`);
      const userRef = ref(database, `users/${userid}`);
  
      const teamSnapshot = await get(teamRef);
      let participants = teamSnapshot.exists() ? teamSnapshot.val() : {};
  
      const isAlreadyAdded = Object.values(participants).includes(userid);
      if (isAlreadyAdded) {
        alert("You are already part of this team.");
        return;
      }
  
      const nextIndex = Object.keys(participants).length;
      await update(teamRef, {
        [nextIndex]: userid,
      });
  

      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();

        await update(userRef, { ...userData, teamId: teamId });
      } else {

        await update(userRef, { teamId: teamId });
      }
      console.log("Joined successfully");
      

    } catch (error) {
      console.error("Error joining team: ", error);
      alert("Failed to join the team. Please try again later.");
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
