import { login } from '../lib/api.js';
import { saveUserData, redirectUser } from '../lib/utilities.js';

(async () => {
  await redirectUser();
})();

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await login(email, password);

  console.log('Login response:', res);

  if (res.error) {
    console.log('Login failed: Invalid credentials', res);
    document.getElementById('errorMessage').innerText = res.error;
    document.getElementById('errorMessage').classList.remove('hidden');
  } else {
    saveUserData(res);
    if (res.role === 'admin') {
      window.location.href = '/pages/dashboard.html';
    } else {
      window.location.href = '/';
      console.log('Login successful', res);
    }
  }
});
