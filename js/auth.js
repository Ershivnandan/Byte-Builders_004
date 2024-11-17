import { auth, database } from "./firebase.config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  get,
  ref,
  set,
  push,
  update,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Check is current user token is available or expired
export function isTokenExpired(token) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const expiry = payload.exp * 1000;
  const now = Date.now();

  return now > expiry;
}

export let currentUserData;

const idToken = localStorage.getItem("idToken");

// Check if current user is login or not
export function checkLoggedin() {
  // const idToken = localStorage.getItem("idToken");
  if (!idToken || isTokenExpired(idToken)) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth.html";
  } else {
    return true;
  }
}

// Google login
export function googleLogin() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;

      const userProfile = {
        uid: user.uid,
        email: user.email,
        isGoogleAuth: true,
        name: user.displayName,
        photoURL: user.photoURL || "https://avatar.iran.liara.run/public/48",
      };

      const token = await user.getIdToken();

      await saveUserProfileToDatabase(userProfile);

      localStorage.setItem("idToken", token);
      localStorage.setItem("refreshToken", user.refreshToken);
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      alert("Login successful!");
      window.location.href = "/home.html";
    })
    .catch((error) => {
      console.error("Error during Google login:", error);
      alert("Google login failed.");
    });
}

// Email and Password login
export async function fetchLogindetails(loginData) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginData.email,
      loginData.password
    );
    alert("Login Successfully!");

    const token = await userCredential.user.getIdToken();
    localStorage.setItem("idToken", token);
    localStorage.setItem("refreshToken", userCredential.user.refreshToken);

    window.location.href = "/home.html";
  } catch (error) {
    alert(`Error: ${error.code ? error.code : error.message}`);
  }
}

export async function registerUser(userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.useremail,
      userData.password
    );

    const user = userCredential.user;
    console.log(user);

    const defaultPhotoURL = "https://avatar.iran.liara.run/public/48";

    const token = await user.getIdToken();

    const userProfile = {
      uid: user.uid,
      email: user.email,
      isGoogleAuth: false,
      name: userData.username || "Guest",
      photoURL: user.photoURL || defaultPhotoURL,
    };

    await saveUserProfileToDatabase(userProfile);

    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    localStorage.setItem("idToken", token);
    localStorage.setItem("refreshToken", user.refreshToken);

    alert("Signup successful!");
    window.location.href = "/home.html";
  } catch (err) {
    alert(`Signup Error: ${err.message}`);
  }
}

export async function saveUserProfileToDatabase(profile) {
  const userid = profile.uid || profile.userId;
  await set(ref(database, `users/${userid}`), profile);
}

export function getUserProfile() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const uid = user.uid;

          const userRef = ref(database, `users/${uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const profile = snapshot.val();
            resolve(profile);
          } else {
            console.warn("No user profile found in the database.");
            resolve({
              photoURL: "https://avatar.iran.liara.run/public/48",
              displayName: "Guest",
              isGoogleAuth: false,
              email: "No Email",
            });
          }
        } catch (error) {
          console.error("Unable to retrieve profile details:", error);
          reject({
            photoURL: "https://avatar.iran.liara.run/public/48",
            displayName: "Guest",
            isGoogleAuth: false,
            email: "No Email",
          });
        }
      } else {
        // User is not logged in
        resolve({
          photoURL: "https://avatar.iran.liara.run/public/48",
          displayName: "Guest",
          isGoogleAuth: false,
          email: "No Email",
        });
      }
    });
  });
}



//  Log out or sign out
export function signOutUser() {
  return auth
    .signOut()
    .then(() => {
      console.log("User signed out.");
      localStorage.removeItem("idToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userProfile");

      window.location.href = "auth.html";
    })
    .catch((error) => {
      console.error("Sign-out error:", error);
    });
}

currentUserData = await getUserProfile();
