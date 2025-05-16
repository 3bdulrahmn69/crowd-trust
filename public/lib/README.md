# 📦 CrowdTrust — Data Shapes & API Functions

This document outlines the expected data structure in `db.json` and provides categorized `fetch`-based asynchronous functions for interacting with the backend.

---

## ⚙️ Base Configuration

```js
const BASE_URL = 'http://localhost:3000';
```

Make sure JSON Server is running:

```bash
npm run start
```

---

## 👤 User

### 📄 Data Shape

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "hashed_or_plain_password",
  "role": "campaigner",
  "isActive": true,
  "isApproved": true,
}
```

- `role`: Defines access level ("admin", "backer", or "campaigner")
- `isActive`: Used to ban/unban accounts
- `isApproved`: Admin sets this to `true` for campaigners

### 🧩 Functions

- `registerUser(userData)` — Add a new user (backer or campaigner)
- `login(email, password)` — Validate if user exists and credentials match
- `getUserById(id)` — Fetch a specific user’s data
- `getCampaignerRequests()` — Admin: Get all users with `role=campaigner`
- `updateUser(id, updates)` — Admin: Approve campaigners, ban/unban users

---

## 📢 Campaign

### 📄 Data Shape

```json
{
  "id": 1,
  "title": "Smart Water Bottle",
  "description": "A bottle that tracks your hydration in real-time.",
  "goal": 10000,
  "raised": 2300,
  "deadline": "2025-06-30",
  "image": "base64string",
  "creatorId": 2,
  "isApproved": false,
  "category": "tech",
  "rewards": [
    { "id": 1, "title": "Early Backer Pack", "amount": 50 },
    { "id": 2, "title": "Deluxe Edition", "amount": 100 }
  ]
}
```

- `raised`: Update when pledges are made
- `creatorId`: Links to `users.id`
- `isApproved`: Set by admin

### 🧩 Functions

- `createCampaign(campaignData)` — Campaigner: Create a new campaign
- `getAllCampaigns()` — Get all campaigns (approved or not)
- `getApprovedCampaigns()` — Get only approved campaigns
- `searchCampaigns(query)` — Search by keyword
- `filterCampaignsByCategory(category)` — Filter by category and sort by deadline
- `getCampaignById(id)` — Get a single campaign’s details
- `updateCampaign(id, updates)` — Edit campaign details
- `deleteCampaign(id)` — Admin: Remove a campaign

---

## 💰 Pledge

### 📄 Data Shape

```json
{
  "id": 1,
  "campaignId": 1,
  "userId": 4,
  "amount": 100,
  "rewardId": 2
}
```

- References a campaign, user, and reward

### 🧩 Functions

- `createPledge(pledgeData)` — Submit a pledge to a campaign
- `getPledgesByUser(userId)` — Get all pledges by a specific user
- `getPledgesByCampaign(campaignId)` — Get all pledges made to a campaign
- `getUserPledgeToCampaign(userId, campaignId)` — Get a user's pledge to a specific campaign

---

## 📝 Update

### 📄 Data Shape

```json
{
  "id": 1,
  "campaignId": 1,
  "message": "We just passed 50% of our goal! Thank you all!",
  "timestamp": "2025-05-11T14:35:00Z"
}
```

- Use `timestamp` to display updates in order

### 🧩 Functions

- `postCampaignUpdate(updateData)` — Campaigner: Post a campaign update
- `getUpdatesByCampaign(campaignId)` — Get all updates for a campaign

---

## 🧠 Usage Example

```js
(async () => {
  const user = await login('test@example.com', '123456');
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
})();
```

---

## 🗂 Example `db.json`

```json
{
  "users": [],
  "campaigns": [],
  "pledges": [],
  "updates": []
}
```
