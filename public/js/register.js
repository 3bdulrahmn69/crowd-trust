import { registerUser } from '../lib/api.js';
import { User } from '../lib/classes.js';
import { redirectUser } from '../lib/utilities.js';
import { uuidv4 } from '../lib/utilities.js';

(async () => {
  await redirectUser();
})();

const strengthBars = document.querySelectorAll('.strength-bar');
const strengthText = document.querySelector('.strength-text');
document.querySelector('#password').addEventListener('input', (e) => {
  const password = e.target.value;

  if (password.length > 12) {
    strengthBars.forEach((bar) => {
      bar.classList.remove('weak');
      bar.classList.remove('medium');
      bar.classList.add('strong');
    });
    strengthText.textContent = 'Strong';
  }

  if (password.length > 8 && password.length <= 12) {
    strengthBars.forEach((bar) => {
      bar.classList.remove('weak');
      bar.classList.remove('medium');
      bar.classList.remove('strong');
    });
    strengthBars[0].classList.add('medium');
    strengthBars[1].classList.add('medium');
    strengthText.textContent = 'Medium';
  }

  if (password.length > 0 && password.length <= 8) {
    strengthBars.forEach((bar) => {
      bar.classList.remove('weak');
      bar.classList.remove('medium');
      bar.classList.remove('strong');
    });
    strengthBars[0].classList.add('weak');
    strengthText.textContent = 'Weak';
  }

  if (password.length === 0) {
    strengthBars.forEach((bar) => {
      bar.classList.remove('weak');
      bar.classList.remove('medium');
      bar.classList.remove('strong');
    });
    strengthText.textContent = '';
  }
}); // Validate password strength

document
  .getElementById('register-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const id = uuidv4();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    const user = new User(id, name, email, password, role);
    const res = await registerUser(user);

    if (res.error) {
      document.getElementById('email-error').classList.remove('hidden');
      document.getElementById('email-error').classList.add('email-error');
    } else {
      document.getElementById('email-error').classList.add('hidden');
      document.getElementById('email-error').classList.remove('email-error');
      document.getElementById('register-form').reset();
      document.getElementById('register-form').classList.add('hidden');
      document.getElementById('register-done').classList.remove('hidden');
    }
  });

console.log('Register page loaded');
