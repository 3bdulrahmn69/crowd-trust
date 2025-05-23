import {
  getUniquePledgesByCampaign,
  getUserByCampaignId,
  getUserById,
} from './api.js';

async function imageToBase64(source) {
  return new Promise(async (resolve, reject) => {
    let blob;

    // If source is a File, use it directly
    if (source instanceof File) {
      blob = source;
    }
    // If source is a string, treat it as a URL and fetch the image
    else if (typeof source === 'string') {
      try {
        const response = await fetch(source);
        blob = await response.blob();
      } catch (err) {
        return reject('Failed to fetch image from URL');
      }
    } else {
      return reject('Invalid source provided');
    }

    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject('Failed to read the file');
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

    if (daysLeft < 0) return 'Campaign ended';
    if (daysLeft === 0) return 'Last day to support';
    return `${daysLeft} days left`;
  };

  const backers = await getUniquePledgesByCampaign(campaign.id);

  const card = document.createElement('article');
  card.classList.add('campaign-card');
  card.setAttribute('role', 'region');
  card.setAttribute('aria-labelledby', `campaign-title-${campaign.id}`);

  card.innerHTML = `
    <figure class="campaign-media">
      <img src="${campaign.image}" alt="${campaign.title} campaign image" />
      <figcaption class="campaign-category-badge">
        <i class="fas fa-tag" aria-hidden="true"></i>
        <span class="category-label">${campaign.category}</span>
      </figcaption>
    </figure>

    <section class="campaign-content">
      <header class="campaign-header">
        <h2 id="campaign-title-${campaign.id}" class="campaign-title">${
    campaign.title
  }</h2>
        <p class="campaign-creator">By <span class="creator-name">${name}</span></p>
      </header>

      <summary class="campaign-description">
        ${campaign.description}
      </summary>

      <section class="campaign-progress" aria-label="Funding progress">
        <div class="progress-info">
          <span class="amount-raised">$${campaign.raised.toLocaleString()} raised</span>
          <span class="funding-goal">of $${campaign.goal.toLocaleString()} goal</span>
        </div>
        <div class="progress-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" style="width: ${progress}%;"></div>
        </div>
      </section>

      <dl class="campaign-meta">
        <div class="meta-item">
          <dt><i class="fas fa-users" aria-hidden="true"></i><span class="sr-only">Backers</span></dt>
          <dd>${backers.length} backers</dd>
        </div>
        <div class="meta-item">
          <dt><i class="fas fa-clock" aria-hidden="true"></i><span class="sr-only">Time remaining</span></dt>
          <dd>${remainingDays(campaign.deadline)}</dd>
        </div>
      </dl>

      <footer class="campaign-footer hidden">
        <a href="/pages/checkout.html?campaign=${
          campaign.id
        }" class="btn btn-primary">Support Now</a>
      </footer>
    </section>
  `;

  return card;
}

function saveUserData(user) {
  user = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  sessionStorage.setItem('user', JSON.stringify(user));
  return user;
}

async function verifyUserData(user) {
  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: 'User not found' };
  }
  if (dbUser.name !== user.name) {
    return { error: 'Name mismatch' };
  }
  if (dbUser.role !== user.role) {
    return { error: 'Role mismatch' };
  }

  return dbUser;
}

async function getUserData() {
  const userJSON = sessionStorage.getItem('user');
  if (!userJSON) return null;

  const user = JSON.parse(userJSON);
  const verifiedUser = await verifyUserData(user);

  if (verifiedUser.error) {
    alert("Don't play with storage data");
    sessionStorage.removeItem('user');
    return null;
  }

  return verifiedUser;
}

function logout() {
  sessionStorage.removeItem('user');
  window.location.reload();
}

async function redirectUser() {
  const user = await getUserData();
  if (user) {
    if (user.role === 'admin') {
      window.location.replace('/pages/dashboard.html');
    } else {
      window.location.replace('/');
    }
  }
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export {
  imageToBase64,
  createCampaignCard,
  saveUserData,
  getUserData,
  logout,
  redirectUser,
  uuidv4,
};
