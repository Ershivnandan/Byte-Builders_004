import { auth } from "./firebaseConfig.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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

export function emailLogin(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Email login successful:", user);

      window.location.href = "/home.html";
    })
    .catch((error) => {
      console.error("Error during email login:", error);
    });
}
