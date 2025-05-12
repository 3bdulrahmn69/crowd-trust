const toggleBtn = document.querySelector('.header__toggle-btn');
const navMenu = document.getElementById('nav-menu');

toggleBtn.addEventListener('click', () => {
  const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
  toggleBtn.setAttribute('aria-expanded', !expanded);
  toggleBtn.classList.toggle('is-active');
  navMenu.classList.toggle('active');
});
