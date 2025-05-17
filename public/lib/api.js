const BASE_URL = 'http://localhost:3000';

// TOPIC: All User API calls
async function registerUser(userData) {
  const checkRes = await fetch(
    `${BASE_URL}/users?email=${encodeURIComponent(userData.email)}`
  );
  const existingUsers = await checkRes.json();

  if (existingUsers.length > 0) {
    return {
      error: 'Email already exists.',
    };
  }

  // Proceed to register
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    return {
      error: 'Registration failed. Please try again.',
    };
  }

  return await res.json();
} // Register a new user

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/users?email=${email}`);
  const users = await res.json();
  const user = users.find((u) => u.password === password);
  if (!user) {
    return {
      error: 'Invalid email or password.',
    };
  }
  if (user.isApproved === false) {
    return {
      error: 'Your account is not approved yet.',
    };
  }
  if (user.isActive === false) {
    return {
      error: 'Your account is banned.',
    };
  }
  return user;
} // login (validate credentials manually)

async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return await res.json();
}

async function getUserById(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  return await res.json();
} // Get user by ID

async function getCampaignerRequests() {
  const res = await fetch(`${BASE_URL}/users?role=campaigner`);
  return await res.json();
} // Get all campaigners (admin)

async function updateUser(id, updates) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return await res.json();
} // Approve/reject campaigner or ban/UnBan user

async function getUserByCampaignId(campaignId) {
  const res = await getCampaignById(campaignId);
  const userId = await res.creatorId;
  const userRes = await fetch(`${BASE_URL}/users/${userId}`);
  const user = await userRes.json();
  return user;
}

async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
} // Delete user

// TOPIC: All Campaign API calls
async function createCampaign(campaignData) {
  const res = await fetch(`${BASE_URL}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaignData),
  });
  return await res.json();
} // Create a new campaign

async function getAllCampaigns() {
  const res = await fetch(`${BASE_URL}/campaigns`);
  return await res.json();
} // Get all campaigns

async function getCampaignsByUser(userId) {
  const res = await fetch(`${BASE_URL}/campaigns?creatorId=${userId}`);
  return await res.json();
}

async function getApprovedCampaigns() {
  const res = await fetch(`${BASE_URL}/campaigns?isApproved=true`);
  return await res.json();
} // Get approved campaigns

async function searchCampaigns(query) {
  const res = await fetch(
    `${BASE_URL}/campaigns?q=${encodeURIComponent(query)}`
  );
  return await res.json();
} // Search campaigns

async function filterCampaignsByCategory(category) {
  const res = await fetch(
    `${BASE_URL}/campaigns?category=${category}&_sort=deadline`
  );
  return await res.json();
} // Filter campaigns by category and sort by deadline

async function getCampaignById(id) {
  const res = await fetch(`${BASE_URL}/campaigns/${id}`);
  return await res.json();
} // Get campaign by ID

async function updateCampaign(id, updates) {
  const res = await fetch(`${BASE_URL}/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return await res.json();
} // Update campaign

async function deleteCampaign(id) {
  const res = await fetch(`${BASE_URL}/campaigns/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
} // Delete campaign

// TOPIC: All Pledge API calls
async function createPledge(pledgeData) {
  const res = await fetch(`${BASE_URL}/pledges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pledgeData),
  });
  return await res.json();
} // Submit a pledge

async function getAllPledges() {
  const res = await fetch(`${BASE_URL}/pledges`);
  return await res.json();
}

async function getPledgesByUser(userId) {
  const res = await fetch(`${BASE_URL}/pledges?userId=${userId}`);
  return await res.json();
} // Get pledges by user ID

async function getPledgesByCampaign(campaignId) {
  const res = await fetch(`${BASE_URL}/pledges?campaignId=${campaignId}`);
  return await res.json();
} // Get pledges by campaign ID

async function getUserPledgeToCampaign(userId, campaignId) {
  const res = await fetch(
    `${BASE_URL}/pledges?userId=${userId}&campaignId=${campaignId}`
  );
  return await res.json();
} // Get specific pledge by user + campaign

async function getUniquePledgesByCampaign(campaignId) {
  const res = await fetch(
    `${BASE_URL}/unique-pledges?campaignId=${campaignId}`
  );
  return await res.json();
}

// TOPIC: All Updates API calls
async function postCampaignUpdate(updateData) {
  const res = await fetch(`${BASE_URL}/updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  return await res.json();
} // Add campaign update

async function getUpdatesByCampaign(campaignId) {
  const res = await fetch(`${BASE_URL}/updates?campaignId=${campaignId}`);
  return await res.json();
} // Get updates for a campaign

export {
  registerUser,
  login,
  getAllUsers,
  getUserById,
  getCampaignerRequests,
  updateUser,
  getUserByCampaignId,
  deleteUser,
  createCampaign,
  getAllCampaigns,
  getCampaignsByUser,
  getApprovedCampaigns,
  searchCampaigns,
  filterCampaignsByCategory,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  createPledge,
  getAllPledges,
  getPledgesByUser,
  getPledgesByCampaign,
  getUserPledgeToCampaign,
  getUniquePledgesByCampaign,
  postCampaignUpdate,
  getUpdatesByCampaign,
};
