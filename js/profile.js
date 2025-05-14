import {
  deleteUser,
  getCampaignById,
  getCampaignsByUser,
  getPledgesByUser,
  getUserByCampaignId,
  getUserById,
  updateUser,
} from './api.js';

const user = {
    id: "4",
    name: "Dave Brown",
    email: "sayed@gmail.com ",
    password: "dave123",
    role: "campaigner",
    isActive: true 
};

sessionStorage.setItem('user', JSON.stringify(user));
const userData = JSON.parse(sessionStorage.getItem('user'));
// Get the user's role from localStorage or fallback to 'campaigner'
const tabs = document.querySelectorAll('.nav-tab');
const sections = document.querySelectorAll('.profile-tab');

const role = userData.role || 'campaigner';

document.getElementById('hey-message').innerHTML = `Hey, <strong class="name">${
  userData.name.split(' ')[0]
}</strong> welcome back!`;
document.title = `Crowd Trust - ${userData.name.split(' ')[0]} Profile`;

if (role === 'campaigner') {
  document.querySelector('[data-tab="campaigns"]').style.display =
    'inline-block';
} else if (role === 'backer') {
  document.querySelector('[data-tab="pledges"]').style.display = 'inline-block';
}

// Tab switching logic
tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    const selectedTab = btn.getAttribute('data-tab');
    sections.forEach((sec) => {
      sec.style.display = sec.id === `${selectedTab}-tab` ? 'block' : 'none';
    });

    tabs.forEach((tab) => tab.classList.remove('active'));
    btn.classList.add('active');
  });
});
const settingsTab = document.querySelector('[data-tab="settings"]');
if (settingsTab) settingsTab.click();

// Display user data
document.querySelector('#user-name').textContent = userData.name;
document.querySelector('#user-email').textContent = userData.email;
document.querySelector('#user-role').textContent = userData.role;

// Display campaigns for campaigners

const createCampaignCard = (campaign) => {
  const progress = Math.min(
    100,
    Math.floor((campaign.raised / campaign.goal) * 100)
  );

  const card = document.createElement('div');
  card.className = 'campaign-card';
  card.innerHTML = `
    <h3 class="campaign__title">${campaign.title}</h3>
    <p class="campaign__description">${campaign.description}</p>
    <p class="campaign__goal">Goal: $${campaign.goal} Raised: $${campaign.raised}</p>
    <div class="campaign__progress-bar">
      <div class="campaign__progress" style="width: ${progress}%"></div>
    </div>
    <p>Category $${campaign.category}</p>
    <img class="campaign__image" src="${campaign.image}" alt="${campaign.title}" />
  `;

  return card;
};

const campaignsContainer = document.getElementById('campaigns-list');

async function displayCampaigns() {
  const campaigns = await getCampaignsByUser(userData.id);
  campaignsContainer.innerHTML = ''; // Clear existing content

  if (campaigns.length === 0) {
    campaignsContainer.innerHTML = '<p>No campaigns found.</p>';
    return;
  }

  campaigns.forEach((campaign) => {
    const card = createCampaignCard(campaign);
    campaignsContainer.appendChild(card);
  });
}
displayCampaigns();

// Display pledges for backers

const pledgesContainer = document.getElementById('pledges-list');

const createPledgeCard = async (pledge) => {
  let { name } = await getUserByCampaignId(pledge.campaignId);
  let { title, rewards } = await getCampaignById(pledge.campaignId);
  rewards = rewards.find((reward) => reward.id === pledge.rewardId);
  const card = document.createElement('div');
  card.className = 'pledge-card';
  card.innerHTML = `
    <p><strong>Amount:</strong> $${pledge.amount}</p>
    <p><strong>Campaign Title:</strong> ${title}</p>
    <p><strong>Campaigner Name:</strong> ${name}</p>
    <p><strong>Reward:</strong> ${rewards.title}</p>
    <p><strong>Reward Description:</strong> ${rewards.amount}</p>
  `;

  return card;
};

async function displayPledges() {
  const pledges = await getPledgesByUser(userData.id);
  pledgesContainer.innerHTML = ''; // Clear existing content

  if (pledges.length === 0) {
    pledgesContainer.innerHTML = '<p>No pledges found.</p>';
    return;
  }

  pledges.forEach(async (pledge) => {
    const card = await createPledgeCard(pledge);
    pledgesContainer.appendChild(card);
  });
}
displayPledges();

// Display settings
document.getElementById('email-form').addEventListener('submit', (e) => {
  e.preventDefault();
  e.stopPropagation();

  const emailFeedback = document.getElementById('email-feedback');
  getUserById(userData.id).then(async (user) => {
    const newEmail = document.getElementById('new-email').value;
    const password = document.getElementById('current-password-email').value;
    if (user.password === password) {
      await updateUser(userData.id, { email: newEmail });
      emailFeedback.classList.remove('feedback-error');
      emailFeedback.classList.add('feedback-success');
      emailFeedback.textContent = 'Email updated successfully.';
      document.getElementById('new-email').value = '';
      document.getElementById('current-password-email') = '';
      setTimeout(() => {
        emailFeedback.textContent = '';
      }, 1500);
    } else {
      emailFeedback.classList.remove('feedback-success'); 
      emailFeedback.classList.add('feedback-error');
      emailFeedback.textContent = 'Invalid email or password.';
      setTimeout(() => {
        emailFeedback.textContent = '';
      }, 1500);
    }
  });
});

document.getElementById('password-form').addEventListener('submit', (e) => {
  e.preventDefault();
  e.stopPropagation();

  const passwordFeedback = document.getElementById('password-feedback');
  getUserById(userData.id).then(async (user) => {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    if (user.password === currentPassword) {
      await updateUser(userData.id, { password: newPassword });
      passwordFeedback.classList.add('feedback-success');
      passwordFeedback.textContent = 'Password updated successfully.';
      document.getElementById('new-password').value = '';
      document.getElementById('current-password').value = '';
      setTimeout(() => {
        passwordFeedback.textContent = '';
      }, 1500);
    } else {
      passwordFeedback.classList.add('feedback-error');
      passwordFeedback.textContent = 'Invalid email or password.';
      setTimeout(() => {
        passwordFeedback.textContent = '';
      }, 1500);
    }
  });
});

document.getElementById('delete-user').addEventListener('click', async (e) => {
  let sure = confirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );
  if (sure) {
    const res = await deleteUser(userData.id);
    if (res) {
      alert('Account deleted successfully.');
      sessionStorage.removeItem('user');
      window.location.href = '../';
    } else {
      alert('Failed to delete account. Please try again.');
    }
  }
});
