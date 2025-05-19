import { createCampaign, getApprovedCampaigns } from '../lib/api.js';
import {
  createCampaignCard,
  getUserData,
  imageToBase64,
  logout,
} from '../lib/utilities.js';
import { Campaign } from '../lib/classes.js';
import { uuidv4 } from '../lib/utilities.js';
// import {loadCampaigns} from '../js/dashboard.js';

async function verify() {
  const userJSON = sessionStorage.getItem('user');
  const user = JSON.parse(userJSON);
  if (user.role === 'campaigner') {
    window.location.href = '/public/pages/campaigner.html';
  }
  if (user.role === 'backer') {
    window.location.href = '/public/pages/campaigner.html';
  }
  if (user.role === 'admin') {
    window.location.href = '/pages/dashboard.html';
    // loadCampaigns();
  }
 
}
verify();
function updateUIForLoggedInUser(userJSON) {
  const authButtons = document.getElementById('auth_buttons');
  const userContainer = document.getElementById('user_container');
  const userButton = document.getElementById('user_button');
  const profileList = document.getElementById('profile_list');
  const logoutBtn = document.getElementById('logout_btn');

  if (!userJSON) {
    // User not logged in – ensure login/register are visible
    authButtons?.classList.remove('hidden');
    userContainer?.classList.add('hidden');
    return;
  }

  const user = JSON.parse(userJSON);

  if (user.role === 'admin') {
    document.getElementById('link-replace').href = '/pages/dashboard.html';
    document.getElementById('link-replace').textContent = 'Dashboard';
  }

  if (user.role === 'campaigner') {
    document.querySelector('.create-btn').classList.remove('hidden');
  }

  if (user.role === 'backer') {
    document.querySelectorAll('.campaign-footer').forEach((footer) => {
      footer.classList.remove('hidden');
    });
  }

  // Update UI for logged-in user
  authButtons?.classList.add('hidden');
  userContainer?.classList.remove('hidden');
  userButton.textContent = `👋 ${user.name}`;

  // Dropdown toggle on hover
  userContainer.addEventListener('mouseenter', () => {
    profileList.classList.remove('hidden');
  });

  userContainer.addEventListener('mouseleave', () => {
    profileList.classList.add('hidden');
  });

  // Logout functionality
  logoutBtn?.addEventListener('click', () => {
    logout();
  });
}

// Load and display campaigns
let allCampaigns = [];

function renderCampaigns(campaigns) {
  const container = document.getElementById('campaign-container');
  container.innerHTML = ''; // Clear existing cards

  campaigns.forEach(async (campaign) => {
    const card = await createCampaignCard(campaign);
    container.appendChild(card);
    updateUIForLoggedInUser(sessionStorage.getItem('user'));
  });
}

getApprovedCampaigns().then((campaigns) => {
  allCampaigns = campaigns;
  renderCampaigns(allCampaigns);
});

document.getElementById('campaign-category').addEventListener('change', (e) => {
  const selectedCategory = e.target.value;

  if (selectedCategory === 'all') {
    renderCampaigns(allCampaigns);
  } else {
    const filtered = allCampaigns.filter(
      (campaign) =>
        campaign.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
    renderCampaigns(filtered);
  }
});

// Campaign creation dialog
const rewardsContainer = document.getElementById('create-rewards-container');
const addRewardBtn = document.getElementById('create-add-reward-btn');
function createRewardInput(reward = { title: '', amount: 0 }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group__reward';

  // Title input
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.name = 'reward-title';
  titleInput.placeholder = 'Reward Title';
  titleInput.value = reward.title || '';
  titleInput.className = 'form-group__input reward-input__title';

  // Amount input
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.name = 'reward-amount';
  amountInput.placeholder = 'Amount ($)';
  amountInput.value = reward.amount || 0;
  amountInput.className = 'form-group__input reward-input__amount';

  // Optional: delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'form-group__remove-reward';
  deleteBtn.textContent = 'Remove';
  deleteBtn.addEventListener('click', () => wrapper.remove());

  // Append inputs
  wrapper.appendChild(titleInput);
  wrapper.appendChild(amountInput);
  wrapper.appendChild(deleteBtn);

  return wrapper;
}

addRewardBtn.addEventListener('click', () => {
  const newReward = createRewardInput();
  rewardsContainer.appendChild(newReward);
});

document
  .getElementById('create-image')
  .addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const imagePreview = document.getElementById('create-image-preview');

    if (file) {
      try {
        const base64 = await imageToBase64(file);
        imagePreview.src = base64;
        imagePreview.classList.remove('hidden');
      } catch (err) {
        console.error('Error converting image:', err);
      }
    } else {
      imagePreview.src = '';
      imagePreview.classList.add('hidden');
    }
  });

document.getElementById('create-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const { id } = await getUserData();
  const rewards = Array.from(
    rewardsContainer.querySelectorAll('.form-group__reward')
  ).map((reward) => {
    const title = reward.querySelector('.reward-input__title').value;
    const amount = parseFloat(
      reward.querySelector('.reward-input__amount').value
    );
    const id = uuidv4();
    return { id, title, amount };
  });

  const formData = new FormData(e.target);
  const campaign = new Campaign(
    uuidv4(),
    formData.get('title'),
    formData.get('description'),
    await imageToBase64(formData.get('image')),
    formData.get('category'),
    formData.get('goal'),
    0,
    formData.get('deadline'),
    id,
    false,
    rewards
  );

  try {
    const res = await createCampaign(campaign);
    console.log('Campaign created:', res);
    document.getElementById('create-dialog').close();
    document.getElementById('submitted-dialog').showModal();
  } catch (error) {
    console.error('Error creating campaign:', error);
  }
});

document.getElementById('logout_btn').addEventListener('click', () => {
  logout();
});

document.getElementById('open-dialog').addEventListener('click', () => {
  const dialog = document.getElementById('create-dialog');
  dialog.showModal();
});
