import {
  getApprovedCampaigns,
  getUniquePledgesByCampaign,
  getUserByCampaignId,
} from '../lib/api.js';
import { createCampaignCard } from '../lib/utilities.js';

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
  });
});
let displayCampaignPage = document.getElementById('displayCampaignPage');

displayCampaignPage.addEventListener('click', () => {
  window.location.href = '/pages/campaign.html';
});

function updateUIForLoggedInUser(user) {
  const loginIndexbtn = document.getElementById('loginIndexbtn');
  const registerIndexbtn = document.getElementById('registerIndexbtn');
  const usercontainer = document.getElementById('usercontainer');

  // Hide login and register buttons
  registerIndexbtn.classList.add('hidden');
  loginIndexbtn.classList.add('hidden');

  // Create and configure the user button
  const userbtn = document.createElement('button');
  userbtn.classList.add('btn', 'btn-primary');
  userbtn.innerText = `Welcome ${user.name}`;

  // Create profile list element if it doesn't exist

  const profilelist = document.createElement('ul');
  profilelist.id = 'profile-list';
  profilelist.className = 'profile-list';
  profilelist.innerHTML = `
      <li><a href="#">View Profile</a></li>
      <li><a href="#">Log Out</a></li>
    `;

  // Add event listeners for user button
  userbtn.addEventListener('click', function () {
    console.log('User button clicked');
  });

  userbtn.addEventListener('mouseover', function () {
    profilelist.style.display = 'block';
    usercontainer.appendChild(profilelist);
  });

  userbtn.addEventListener('mouseout', function () {
    profilelist.style.display = 'none';
  });

  // Append user button to the container
  usercontainer.appendChild(userbtn);
}

updateUIForLoggedInUser(sessionStorage.getItem('user'));
