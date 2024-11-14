const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

import { fetchLogindetails, registerUser } from "./js/auth.js";

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const loginData = {
    email: email,
    password: password,
    returnSecureToken: true,
  };

  fetchLogindetails(loginData);
});

// Sign up with email and password
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("userEmail").value;
  const password = document.getElementById("userPass").value;

  const userData = {
    password: password,
    username: email,
  };

  registerUser(userData);
});