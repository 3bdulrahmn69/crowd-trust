import { getUniquePledgesByCampaign, getUserByCampaignId } from './api.js';

async function imageToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function createCampaignCard(campaign) {
  const { name } = await getUserByCampaignId(campaign.id);

  const progress = Math.min(
    100,
    Math.floor((campaign.raised / campaign.goal) * 100)
  );

  const remainingDays = (deadline) => {
    const today = new Date();
    const endDate = new Date(deadline);
    const timeDiff = endDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return 'Campaign ended';
    } else if (daysLeft === 0) {
      return 'Last day to support';
    } else {
      return `${daysLeft} days left`;
    }
  };

  const backers = await getUniquePledgesByCampaign(campaign.id);

  const card = document.createElement('div');
  card.classList.add('campaign-card');

  card.innerHTML = `
  <figure class="campaign-media">
    <img
      src="${campaign.image}"
      alt="${campaign.title} campaign image">
    <figcaption class="campaign-category-badge">
      <i class="fas fa-graduation-cap" aria-hidden="true"></i>
      <span>${campaign.category}</span>
    </figcaption>
  </figure>
  <div class="campaign-content">
    <header class="campaign-header">
      <h2 id="campaign2-title" class="campaign-title">${campaign.title}</h2>
      <p class="campaign-creator">By <span>${name}</span></p>
    </header>
    <p class="campaign-description">
      ${campaign.description}
    </p>
    <div class="campaign-progress" aria-label="Funding Progress">
      <div class="progress-stats">
        <span class="amount-raised">$${campaign.raised} raised</span>
        <span class="funding-goal">of $${campaign.goal} goal</span>
      </div>
      <div class="progress-bar" aria-hidden="true">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    </div>
    <dl class="campaign-meta">
      <div class="meta-item">
        <dt><i class="fas fa-users" aria-hidden="true"></i></dt>
        <dd>${backers.length} backers</dd>
      </div>
      <div class="meta-item">
        <dt><i class="fas fa-clock" aria-hidden="true"></i></dt>
        <dd>${remainingDays(campaign.deadline)}</dd>
      </div>
    </dl>
    <button class="btn btn-primary">Support Now</button>
  </div>
  `;

  return card;
}

function saveUserData(user) {
  user = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  // console.log('User data saved:', user);
  sessionStorage.setItem('user', JSON.stringify(user));
  const userData = JSON.parse(sessionStorage.getItem('user'));
  return userData;
}

export { imageToBase64, createCampaignCard, saveUserData };
