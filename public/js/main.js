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
