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
  const idToken = localStorage.getItem("idToken");
  if (!idToken || isTokenExpired(idToken)) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "login.html";
  } else {
    window.location.href = "home.html";
  }
}

// Google login
export function googleLogin() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Google login successful:", user);

      window.location.href = "/home.html";
    })
    .catch((error) => {
      console.error("Error during Google login:", error);
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

// loginForm.addEventListener("submit", (e) => {
//   e.preventDefault();

//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   const loginData = {
//     email: email,
//     password: password,
//     returnSecureToken: true,
//   };

//   fetchLogindetails(loginData);
// });

// Sign up with email and password
// signupForm.addEventListener("submit", (e) => {
//   e.preventDefault();

//   const email = document.getElementById("userEmail").value;
//   const password = document.getElementById("userPass").value;

//   const userData = {
//     password: password,
//     username: email,
//   };

//   registerUser(userData);
// });

export async function registerUser(userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.username,
      userData.password
    );

    const token = await userCredential.user.getIdToken();
    localStorage.setItem("idToken", token);

    localStorage.setItem("refreshToken", userCredential.user.refreshToken);

    alert("Signup successful!");
    window.location.href = "/home.html";
  } catch (err) {
    throw new Error(err.message);
  }
}

// Get user profile
export function getUserProfile() {
  const user = auth.currentUser;
  try {
    if (user) {
      return {
        photoURL: user.photoURL,
        displayName: user.displayName,
        email: user.email,
      };
    }
    return {
      photoURL: "/docs/images/people/default-avatar.jpg",
      displayName: "Guest",
      email: "No Email",
    };
  } catch (error) {
    console.log("Cant not get profile details", error)
  }
}

//  Log out or sign out
export function signOutUser() {
  return auth
    .signOut()
    .then(() => {
      console.log("User signed out.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Sign-out error:", error);
    });
}
