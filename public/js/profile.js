import {
  deleteUser,
  getCampaignById,
  getCampaignsByUser,
  getPledgesByUser,
  getUserByCampaignId,
  getUserById,
  updateCampaign,
  updateUser,
} from '../lib/api.js';
import { getUserData, imageToBase64 } from '../lib/utilities.js';

async function verify() {
  try {
    const user = await getUserData();
    if (!user) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    window.location.href = '/';
  }
}
verify();

function redirectToLogin() {
  window.location.href = '../auth/login.html';
}

function setupGreeting({ name }) {
  const firstName = name.split(' ')[0];
  document.getElementById(
    'hey-message'
  ).innerHTML = `Hey, <strong class="name">${firstName}</strong> welcome back!`;
  document.title = `Crowd Trust - ${firstName} Profile`;
}

function setupTabs(role) {
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.profile-tab');

  if (role === 'campaigner') {
    document
      .querySelector('[data-tab="campaigns"]')
      ?.style.setProperty('display', 'inline-block');
  } else if (role === 'backer') {
    document
      .querySelector('[data-tab="pledges"]')
      ?.style.setProperty('display', 'inline-block');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selectedTab = tab.dataset.tab;
      sections.forEach((sec) => {
        sec.style.display = sec.id === `${selectedTab}-tab` ? 'block' : 'none';
      });
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  document.querySelector('[data-tab="settings"]')?.click();
}

function setupProfileInfo({ name, email, role }) {
  document.querySelector('#user-name').textContent = name;
  document.querySelector('#user-email').textContent = email;
  document.querySelector('#user-role').textContent = role;
}

async function renderCampaigns(userId) {
  const campaigns = await getCampaignsByUser(userId);
  const container = document.getElementById('campaigns-list');
  container.innerHTML = '';

  if (!campaigns.length) {
    container.innerHTML = '<p>No campaigns found.</p>';
    return;
  }

  campaigns.forEach(
    ({ title, description, goal, raised, image, category, id, isApproved }) => {
      const progress = Math.min(100, Math.floor((raised / goal) * 100));
      const card = document.createElement('div');
      card.className = 'campaign-card';
      card.innerHTML = `
      <h3 class="campaign__title">${title}</h3>
      <span class="approve-span ${
        isApproved ? 'approve-span-approved' : 'approve-span-pending'
      }"></span>
      <p class="campaign__description">${description}</p>
      <p class="campaign__goal">Goal: $${goal} Raised: $${raised}</p>
      <div class="campaign__progress-bar">
        <div class="campaign__progress" style="width: ${progress}%"></div>
      </div>
      <p>Category: ${category}</p>
      <img class="campaign__image" src="${image}" alt="${title}" />
      <button class="btn btn--primary btn--full campaign__edit" data-id="${id}">Edit</button>
    `;
      container.appendChild(card);
    }
  );
}

async function renderPledges(userId) {
  const pledges = await getPledgesByUser(userId);
  const container = document.getElementById('pledges-list');
  container.innerHTML = '';

  if (!pledges.length) {
    container.innerHTML = '<p>No pledges found.</p>';
    return;
  }

  for (const { campaignId, rewardId, amount } of pledges) {
    const campaign = await getCampaignById(campaignId);
    const campaigner = await getUserByCampaignId(campaignId);
    const reward = campaign.rewards.find((r) => r.id === rewardId);

    const card = document.createElement('div');
    card.className = 'pledge-card';
    card.innerHTML = `
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Campaign Title:</strong> ${campaign.title}</p>
      <p><strong>Campaigner Name:</strong> ${campaigner.name}</p>
      <p><strong>Reward:</strong> ${reward?.title || 'N/A'}</p>
      <p><strong>Reward Description:</strong> ${reward?.amount || 'N/A'}</p>
    `;
    container.appendChild(card);
  }
}

function setupEmailForm(userId) {
  document
    .getElementById('email-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const feedback = document.getElementById('email-feedback');
      const newEmail = document.getElementById('new-email').value;
      const password = document.getElementById('current-password-email').value;

      try {
        const user = await getUserById(userId);
        if (user.password === password) {
          await updateUser(userId, { email: newEmail });
          feedback.className = 'feedback-success';
          feedback.textContent = 'Email updated successfully.';
          e.target.reset();
        } else throw new Error();
      } catch {
        feedback.className = 'feedback-error';
        feedback.textContent = 'Invalid email or password.';
      }

      setTimeout(() => (feedback.textContent = ''), 1500);
    });
}

function setupPasswordForm(userId) {
  document
    .getElementById('password-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const feedback = document.getElementById('password-feedback');
      const current = document.getElementById('current-password').value;
      const newPass = document.getElementById('new-password').value;

      try {
        const user = await getUserById(userId);
        if (user.password === current) {
          await updateUser(userId, { password: newPass });
          feedback.className = 'feedback-success';
          feedback.textContent = 'Password updated successfully.';
          e.target.reset();
        } else throw new Error();
      } catch {
        feedback.className = 'feedback-error';
        feedback.textContent = 'Invalid email or password.';
      }

      setTimeout(() => (feedback.textContent = ''), 1500);
    });
}

function setupDeleteUser(userId) {
  document.getElementById('delete-user').addEventListener('click', async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const result = await deleteUser(userId);
      if (result) {
        alert('Account deleted successfully.');
        sessionStorage.removeItem('user');
        window.location.href = '../';
      } else {
        throw new Error();
      }
    } catch {
      alert('Failed to delete account. Please try again.');
    }
  });
}

(async function loadPageData() {
  try {
    const userData = await getUserData();
    if (!userData) return redirectToLogin();

    setupGreeting(userData);
    setupTabs(userData.role);
    setupProfileInfo(userData);

    if (userData.role === 'campaigner') {
      await renderCampaigns(userData.id);
    } else if (userData.role === 'backer') {
      await renderPledges(userData.id);
    }

    setupEmailForm(userData.id);
    setupPasswordForm(userData.id);
    setupDeleteUser(userData.id);
  } catch (error) {
    console.error('Failed to load page data:', error);
    alert('An error occurred while loading your data. Please try again.');
  }
})();

// Dialog for updating campaign
const UpdateDialog = document.getElementById('update-dialog');
const rewardsContainer = document.getElementById('rewards-container');
const addRewardBtn = document.getElementById('add-reward-btn');
let globalImage = '';

document
  .getElementById('campaigns-tab')
  .addEventListener('click', async (e) => {
    if (e.target.classList.contains('campaign__edit')) {
      const campaignId = e.target.dataset.id;
      const campaign = await getCampaignById(campaignId);
      if (!campaign) return;

      UpdateDialog.showModal();

      document
        .getElementById('update-form')
        .setAttribute('data-id', campaignId);
      document.getElementById('update-campaign-id').value = campaign.id || '';
      document.getElementById('update-title').value = campaign.title || '';
      document.getElementById('update-description').value =
        campaign.description || '';
      document.getElementById('update-goal').value = campaign.goal || 0;
      document.getElementById('update-raised').value = campaign.raised || 0;
      document.getElementById('update-deadline').value = campaign.deadline
        ? new Date(campaign.deadline).toISOString().split('T')[0]
        : '';
      document.getElementById('update-category').value =
        campaign.category || 'health';

      // Set image preview
      const imagePreview = document.getElementById('update-image-preview');
      if (campaign.image) {
        imagePreview.src = campaign.image;
        globalImage = campaign.image;
        imagePreview.style.display = 'block';
      } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
      }

      // Populate rewards
      rewardsContainer.innerHTML = '';
      if (Array.isArray(campaign.rewards)) {
        campaign.rewards.forEach((reward) => {
          const rewardElement = createRewardInput(reward);
          rewardsContainer.appendChild(rewardElement);
        });
      }
    }
  });

document.querySelector('.dialog__close').addEventListener('click', () => {
  UpdateDialog.close();
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

document
  .getElementById('update-image')
  .addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const imagePreview = document.getElementById('update-image-preview');

    if (file) {
      try {
        const base64 = await imageToBase64(file);
        imagePreview.src = base64;
        imagePreview.style.display = 'block';
      } catch (err) {
        console.error('Error converting image:', err);
      }
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  });

addRewardBtn.addEventListener('click', () => {
  const newReward = createRewardInput();
  rewardsContainer.appendChild(newReward);
});

document.getElementById('update-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const formData = new FormData(e.target);
  const campaignId = e.target.dataset.id;
  const title = formData.get('title');
  const description = formData.get('description');
  const goal = parseFloat(formData.get('goal'));
  const raised = parseFloat(formData.get('raised'));
  const deadline = formData.get('deadline');
  const category = formData.get('category');
  const image = formData.get('image');
  const rewards = Array.from(rewardsContainer.children).map((reward) => {
    const title = reward.querySelector('.reward-input__title').value;
    const amount = parseFloat(
      reward.querySelector('.reward-input__amount').value
    );
    return { title, amount };
  });

  const imageBase64 = await imageToBase64(image);

  const updatedCampaign = {
    title,
    description,
    goal,
    raised,
    deadline,
    category,
    image: image.size === 0 ? globalImage : imageBase64,
    rewards,
  };

  try {
    let res = await updateCampaign(campaignId, updatedCampaign);
    console.log('Campaign updated:', res);
    UpdateDialog.close();
    window.location.reload();
  } catch (error) {
    console.error('Error updating campaign:', error);
  }
});
