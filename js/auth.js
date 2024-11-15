import { auth } from "./firebase.config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Check is current user token is available or expired
export function isTokenExpired(token) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const expiry = payload.exp * 1000;
  const now = Date.now();

  return now > expiry;
}

const idToken = localStorage.getItem("idToken");

// Check if current user is login or not
export function checkLoggedin() {
  // const idToken = localStorage.getItem("idToken");
  console.log("called")
  if (!idToken || isTokenExpired(idToken)) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth.html";
  } else {
    return true
  }
}

// Google login
export function googleLogin() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;

      const token = await user.getIdToken();
      localStorage.setItem("idToken", token);
      localStorage.setItem("refreshToken", user.refreshToken);

      const profile = {
        photoURL: user.photoURL,
        displayName: user.displayName,
        email: user.email,
      };

      localStorage.setItem("userProfile", JSON.stringify(profile));

      console.log("Google login successful:", profile);
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
      userData.email,
      userData.password
    );

    const user = userCredential.user;

   
    await user.updateProfile({
      displayName: userData.name,
      photoURL: userData.photoURL || "https://avatar.iran.liara.run/public/48", 
    });

    const token = await user.getIdToken();

    const profile = {
      photoURL: user.photoURL,
      displayName: user.displayName,
      email: user.email,
    };
    localStorage.setItem("userProfile", JSON.stringify(profile));
    localStorage.setItem("idToken", token);
    localStorage.setItem("refreshToken", user.refreshToken);

    alert("Signup successful!");
    window.location.href = "/home.html";
  } catch (err) {
    alert(`Signup Error: ${err.message}`);
  }
}


export function getUserProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("userProfile"));

   
    if (profile) return profile;

   
    return {
      photoURL: "https://avatar.iran.liara.run/public/48",
      displayName: "Guest",
      email: "No Email",
    };
  } catch (error) {
    console.error("Unable to retrieve profile details:", error);

    return {
      photoURL: "https://avatar.iran.liara.run/public/48", 
      displayName: "Guest",
      email: "No Email",
    };
  }
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
