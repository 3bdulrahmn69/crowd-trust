import { getApprovedCampaigns } from '../lib/api.js';
import { createCampaignCard, logout } from '../lib/utilities.js';

const toggleBtn = document.querySelector('.header__toggle-btn');
const navMenu = document.getElementById('nav-menu');

toggleBtn.addEventListener('click', () => {
  const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
  toggleBtn.setAttribute('aria-expanded', !expanded);
  toggleBtn.classList.toggle('is-active');
  navMenu.classList.toggle('active');
});

getApprovedCampaigns().then((campaigns) => {
  const campaignList = document.querySelector('.campaigns__list');
  campaigns.slice(0, 3).forEach(async (campaign) => {
    const card = await createCampaignCard(campaign);
    campaignList.appendChild(card);
    // Run on load
    updateUIForLoggedInUser(sessionStorage.getItem('user'));
  });
});

function updateUIForLoggedInUser(userJSON) {
  const authButtons = document.getElementById('auth_buttons');

  const userContainer = document.getElementById('user_container');
  const userButton = document.getElementById('user_button');
  const profileList = document.getElementById('profile_list');

  if (!userJSON) {
    // User not logged in – ensure login/register are visible
    authButtons?.classList.remove('hidden');
    userContainer?.classList.add('hidden');
    return;
  }

  const user = JSON.parse(userJSON);

  // Update UI for logged-in user
  authButtons?.classList.add('hidden');
  userContainer?.classList.remove('hidden');
  userButton.textContent = `👋 ${user.name}`;

  if (user.role === 'admin') {
    document.getElementById('link-replace').href = '/pages/dashboard.html';
    document.getElementById('link-replace').textContent = 'Dashboard';
  }

  // Dropdown toggle on hover
  userContainer.addEventListener('mouseenter', () => {
    profileList.classList.remove('hidden');
  });

  userContainer.addEventListener('mouseleave', () => {
    profileList.classList.add('hidden');
  });

  if (user.role === 'backer') {
    document.querySelectorAll('.campaign-footer').forEach((footer) => {
      footer.classList.remove('hidden');
    });
  }

  document.getElementById('logout_btn').addEventListener('click', () => {
    logout();
  }); // Logout functionality
}
