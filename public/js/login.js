// import { login } from "../lib/api.js";
// import { saveUserData } from "../lib/utilities.js";

// document.getElementById("loginForm").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   e.stopPropagation();

//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   const res = await login(email, password);

//   if (res) {
//     if (res.role === "admin") {
//       saveUserData(res);
//       window.location.href = "/pages/dashboard.html";
//     } else {
//       saveUserData(res);

//       window.location.href = "/";
//       console.log("Login successful", res);
//       localStorage.setItem("user", JSON.stringify(res));
//     user = JSON.parse(localStorage.getItem("user"));
//     console.log("User data saved:", user);
//     const loginIndexbtn = document.getElementById("loginIndexbtn");
//     const registerIndexbtn = document.getElementById("registerIndexbtn");
//     registerIndexbtn.classList.add("hidden");
//     loginIndexbtn.classList.add("hidden");
//     const userbtn = document.createElement("button");
//     const usercontainer = document.getElementById("usercontainer");
//     userbtn.classList.add("btn", "btn-primary");
//     userbtn.innerText = `Welcome ${user.name}`;
//     userbtn.addEventListener("click", function () {
//       console.log("User button clicked");});
//      const profilelist = document.getElementById("profile-list");
//     userbtn.addEventListener("mouseover", function () {
//       profilelist.style.display = "block";
//       usercontainer.appendChild(profilelist);
//     });

//     userbtn.addEventListener("mouseout", function () {
//       profilelist.style.display = "none";
//     });
//   else {
//     console.log("Login failed: Invalid credentials", res);
//     document.getElementById("errorMessage").innerText =
//       "Invalid email or password";
//     document.getElementById("errorMessage").classList.remove("hidden");
//   }
// });

import { login } from '../lib/api.js';
import { saveUserData } from '../lib/utilities.js';

document.getElementById(`loginForm`).addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await login(email, password);

  if (res) {
    saveUserData(res);
    // localStorage.setItem("user", JSON.stringify(res));

    if (res.role === 'admin') {
      window.location.href = '/pages/dashboard.html';
    } else {
      window.location.href = '/';
      console.log('Login successful', res);

      // Retrieve user data from localStorage
      // const user = JSON.parse(localStorage.getItem("user"));
      // console.log("User data saved:", user);

      // Update UI for logged-in user
      updateUIForLoggedInUser(user);
    }
  } else {
    console.log('Login failed: Invalid credentials', res);
    document.getElementById('errorMessage').innerText =
      'Invalid email or password';
    document.getElementById('errorMessage').classList.remove('hidden');
  }
});
