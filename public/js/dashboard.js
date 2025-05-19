import {
  deleteCampaign,
  deleteUser,
  getAllCampaigns,
  getAllPledges,
  getAllUsers,
  getUserById,
  updateCampaign,
  updateUser,
} from '../lib/api.js';

// Handle Dashboard Navigation
const buttons = document.querySelectorAll('.dashboard__btn');
const sections = document.querySelectorAll('.dashboard__section');

sections[0].classList.add('active');
buttons[0].classList.add('active');

async function verify() {
  const userJSON = sessionStorage.getItem('user');

  if (!userJSON) {
    window.location.href = '/index.html';
    return;
  }

  const user = JSON.parse(userJSON);
  if (user.role !== 'admin') {
    window.location.href = '/index.html';
  }
}
verify();

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetSection = button.dataset.section;
    buttons.forEach((b) => b.classList.remove('active'));
    sections.forEach((s) => s.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(targetSection).classList.add('active');
  });
});

// Handle Users __________________________________________________________________________________
const usersArea = document.getElementById('users-table-body');
const roleFilter = document.getElementById('filter-role');
const userStatusFilter = document.getElementById('filter-status');

let allUsers = []; // Global users array for filtering

// Render users table
const renderUsers = (users) => {
  usersArea.innerHTML = ''; // Clear existing content

  users.forEach((user) => {
    const userRow = document.createElement('tr');
    const userIdTd = document.createElement('td');
    const userNameTd = document.createElement('td');
    const userEmailTd = document.createElement('td');
    const userRoleTd = document.createElement('td');
    const userStatusTd = document.createElement('td');
    const userActionsTd = document.createElement('td');

    userIdTd.textContent = user.id;
    userNameTd.textContent = user.name;
    userEmailTd.textContent = user.email;
    userRoleTd.textContent = user.role;
    userStatusTd.textContent = user.isActive ? 'Active' : 'Blocked';

    const BlockUnBlock = document.createElement('button');
    BlockUnBlock.type = 'button';
    if (user.role === 'admin') {
      BlockUnBlock.textContent = 'Admin';
      BlockUnBlock.className = 'btn btn--disabled';
    } else {
      BlockUnBlock.textContent = user.isApproved
        ? user.isActive
          ? 'Block'
          : 'Un Block'
        : 'Not Approved';

      BlockUnBlock.className = user.isActive
        ? 'btn btn--danger'
        : 'btn btn--success';
      BlockUnBlock.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        await updateUser(user.id, { isActive: !user.isActive });
        await loadUsers();
      });
    }

    const acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.textContent = 'Approve';
    acceptBtn.className = 'btn btn--success';
    acceptBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      await updateUser(user.id, { isApproved: true });
      await loadUsers();
    });

    const rejectBtn = document.createElement('button');
    rejectBtn.type = 'button';
    rejectBtn.textContent = 'Reject';
    rejectBtn.className = 'btn btn--danger';
    rejectBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      await deleteUser(user.id);
      await loadUsers();
    });

    const createdDiv = document.createElement('div');
    createdDiv.style.cssText =
      'display: flex; gap: 10px; flex-direction: column;';

    createdDiv.appendChild(acceptBtn);
    createdDiv.appendChild(rejectBtn);

    user.isApproved
      ? userActionsTd.appendChild(BlockUnBlock)
      : userActionsTd.appendChild(createdDiv);

    userRow.appendChild(userIdTd);
    userRow.appendChild(userNameTd);
    userRow.appendChild(userEmailTd);
    userRow.appendChild(userRoleTd);
    userRow.appendChild(userStatusTd);
    userRow.appendChild(userActionsTd);
    usersArea.appendChild(userRow);
  });
};

// Apply filters and render filtered list
const applyFilters = () => {
  const role = roleFilter.value;
  const status = userStatusFilter.value;

  let filtered = [...allUsers];

  if (role !== 'all') {
    filtered = filtered.filter((user) => user.role === role);
  }

  if (status !== 'all') {
    if (status === 'need-approved') {
      filtered = filtered.filter((user) => !user.isApproved);
    } else {
      filtered = filtered.filter((user) =>
        status === 'active' ? user.isActive : !user.isActive
      );
    }
  }

  renderUsers(filtered);
};

// Load and render users
const loadUsers = async () => {
  allUsers = await getAllUsers();
  applyFilters(); // render with current filters applied
};
loadUsers();

// Filter listeners
roleFilter.addEventListener('change', applyFilters);
userStatusFilter.addEventListener('change', applyFilters);

// Handle Campaigns __________________________________________________________________________________
const campaignsArea = document.getElementById('campaigns-list');
const campaignCategoryFilter = document.getElementById('campaign-category');
const campaignStatusFilter = document.getElementById('campaign-status');

let allCampaigns = [];

const applyCampaignFilters = () => {
  const selectedCategory = campaignCategoryFilter.value;
  const selectedStatus = campaignStatusFilter.value;

  const filtered = allCampaigns.filter((campaign) => {
    const matchesCategory =
      selectedCategory === 'all' || campaign.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'approved' && campaign.isApproved) ||
      (selectedStatus === 'need-approved' && !campaign.isApproved);

    return matchesCategory && matchesStatus;
  });

  renderCampaigns(filtered);
};

// Render campaigns list
const renderCampaigns = (campaigns) => {
  campaignsArea.innerHTML = campaigns
    .map((campaign) => {
      const isApproved = campaign.isApproved;
      const progress = Math.min(
        100,
        Math.floor((campaign.raised / campaign.goal) * 100)
      );

      const rewardsHtml = campaign.rewards
        .map(
          (reward) => `
          <li class="campaign__reward">
            <strong>${reward.title}</strong>: $${reward.amount}
          </li>`
        )
        .join('');

      const actionsHtml = isApproved
        ? `
    <button type="button" class="btn btn--danger" data-id="${campaign.id}" data-action="delete">
      Delete
    </button>
  `
        : `
    <button type="button" class="btn btn--primary" data-id="${campaign.id}" data-action="approve">
      Approve
    </button>
    <button type="button" class="btn btn--danger" data-id="${campaign.id}" data-action="reject">
      Reject
    </button>
  `;

      return `
        <div class="campaign__card">
          <div class="campaign__status ${
            isApproved
              ? 'campaign__status--approved'
              : 'campaign__status--pending'
          }">
            ${isApproved ? 'Approved' : 'Pending Approval'}
          </div>

          <img src="${campaign.image}" alt="${
        campaign.title
      }" class="campaign__image" />

          <div class="campaign__content">
            <h3 class="campaign__title">${campaign.title}</h3>
            <p class="campaign__desc">${campaign.description}</p>

            <div class="campaign__progress-bar">
              <div class="campaign__progress" style="width: ${progress}%"></div>
            </div>

            <div class="campaign__meta">
              <p><strong>$${campaign.raised}</strong> raised of $${
        campaign.goal
      } goal</p>
              <p>Deadline: ${new Date(
                campaign.deadline
              ).toLocaleDateString()}</p>
              <p>Category: ${campaign.category}</p>
            </div>

            <div class="campaign__rewards">
              <p><strong>Rewards:</strong></p>
              <ul>
                ${rewardsHtml}
              </ul>
            </div>

            <div class="campaign__actions">
              ${actionsHtml}
            </div>
          </div>
        </div>
      `;
    })
    .join('');
};

// Load and render campaigns
const loadCampaigns = async () => {
  allCampaigns = await getAllCampaigns();
  applyCampaignFilters(); // Initial render with filters applied
};

campaignsArea.addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent default behavior
  e.stopPropagation(); // Stop event propagation

  const btn = e.target.closest('button[data-id]');
  if (!btn) return;

  const campaignId = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'delete') {
    await deleteCampaign(campaignId);
  } else if (action === 'approve') {
    await updateCampaign(campaignId, { isApproved: true });
  } else if (action === 'reject') {
    await deleteCampaign(campaignId);
  }

  await loadCampaigns(); // Reload campaigns after action
});

campaignCategoryFilter.addEventListener('change', applyCampaignFilters);
campaignStatusFilter.addEventListener('change', applyCampaignFilters);

loadCampaigns();

// Handle Pledges __________________________________________________________________________________
const pledgesArea = document.getElementById('pledges-table-body');
const pledgeCampaignFilter = document.getElementById('pledge-campaign');
const pledgeUserFilter = document.getElementById('pledge-user');

let allPledges = []; // Global pledges array for filtering

// Render pledges table
const renderPledges = (pledges) => {
  pledgesArea.innerHTML = ''; // Clear existing content

  pledges.forEach((pledge) => {
    const pledgeRow = document.createElement('tr');
    const pledgeIdTd = document.createElement('td');
    const pledgeUserTd = document.createElement('td');
    const pledgeCampaignTd = document.createElement('td');
    const pledgeAmountTd = document.createElement('td');
    const pledgeStatusTd = document.createElement('td');

    pledgeIdTd.textContent = pledge.id;
    pledgeUserTd.textContent = pledge.userId;
    getUserById(pledge.userId).then(
      (user) => (pledgeCampaignTd.textContent = user.email)
    );
    pledgeAmountTd.textContent = `$${pledge.amount}`;
    pledgeStatusTd.textContent = pledge.isAnonymous ? 'Anonymous' : 'Public';

    pledgeRow.appendChild(pledgeIdTd);
    pledgeRow.appendChild(pledgeUserTd);
    pledgeRow.appendChild(pledgeCampaignTd);
    pledgeRow.appendChild(pledgeAmountTd);
    pledgeRow.appendChild(pledgeStatusTd);
    pledgesArea.appendChild(pledgeRow);
  });
};

// Apply filters and render filtered list
const applyPledgeFilters = () => {
  const selectedCampaign = pledgeCampaignFilter.value;
  const selectedUser = pledgeUserFilter.value;

  let filtered = [...allPledges];

  if (selectedCampaign !== 'all') {
    filtered = filtered.filter(
      (pledge) => pledge.campaignId === selectedCampaign
    );
  }

  if (selectedUser !== 'all') {
    filtered = filtered.filter((pledge) => pledge.userId === selectedUser);
  }

  renderPledges(filtered);
};

// Load and render pledges
const loadPledges = async () => {
  allPledges = await getAllPledges();
  applyPledgeFilters(); // render with current filters applied
};

loadPledges();
// Filter listeners
pledgeCampaignFilter.addEventListener('change', applyPledgeFilters);
pledgeUserFilter.addEventListener('change', applyPledgeFilters);

// Populate campaign filter options
//logout
let logoutBtn = document.getElementById(`logout-btn`);
logoutBtn.addEventListener(`click`, function () {
  sessionStorage.removeItem(`user`);
  window.location.href = `/index.html`;
});
export{
  loadCampaigns,
}