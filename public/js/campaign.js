import { createCampaign, getApprovedCampaigns } from '../lib/api.js';
import {
  createCampaignCard,
  getUserData,
  imageToBase64,
  logout,
} from '../lib/utilities.js';
import { Campaign } from '../lib/classes.js';
import { uuidv4 } from '../lib/utilities.js';

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

// Run on load
updateUIForLoggedInUser(sessionStorage.getItem('user'));

// Campaign creation dialog
const rewardsContainer = document.getElementById('create-rewards-container');
const addRewardBtn = document.getElementById('create-add-reward-btn');
getApprovedCampaigns().then((campaigns) => {
  document.getElementById('campaign-container').innerHTML = ''; // Clear existing cards

  campaigns.forEach(async (campaign) => {
    const card = await createCampaignCard(campaign);
    document.getElementById('campaign-container').appendChild(card);
  });
});

document.getElementById('open-dialog').addEventListener('click', () => {
  const dialog = document.getElementById('create-dialog');
  dialog.showModal();
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
    return { title, amount };
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
