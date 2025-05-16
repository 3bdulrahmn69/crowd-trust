import { login } from '../lib/api.js';
import { saveUserData } from '../lib/utilities.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await login(email, password);

  if (res) {
    if (res.role === 'admin') {
      saveUserData(res);
      window.location.href = '/pages/dashboard.html';
    } else {
      saveUserData(res);
      window.location.href = '/';
    }
  } else {
    console.log('Login failed: Invalid credentials', res);
    document.getElementById('errorMessage').innerText =
      'Invalid email or password';
    document.getElementById('errorMessage').classList.remove('hidden');
  }
});
