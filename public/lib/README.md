# 📦 CrowdTrust — API Documentation

This document outlines the data structures in `db.json` and provides a complete reference for all API functions to interact with the JSON Server backend.

## Table of Contents

- [Getting Started](#getting-started)
- [Class Models](#class-models)
- [User API](#user-api)
- [Campaign API](#campaign-api)
- [Pledge API](#pledge-api)
- [Update API](#update-api)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## Getting Started

### Base Configuration

```js
const BASE_URL = 'http://localhost:3000';
```

### Running the Server

Make sure JSON Server is running:

```bash
npm run start
```

---

## Class Models

The application uses ES6 classes for consistent data modeling across the platform. These classes provide the structure for all data entities and ensure type consistency when working with the API.

### User Class

```javascript
class User {
  constructor(
    id,           // Unique identifier (string)
    name,         // User's full name (string)
    email,        // Email address (string, must be unique)
    password,     // Password (string, should be hashed in production)
    role,         // User role: "admin", "campaigner", or "backer" (string)
    isActive = true,      // Account active status (boolean)
    isApproved = false    // Admin approval status (boolean)
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.isActive = isActive;
    this.isApproved = isApproved;
  }
}
```

**Property Details:**

- `id`: UUID string that uniquely identifies the user
- `name`: User's full name for display purposes
- `email`: Unique email address used for login and notifications
- `password`: User password (plain text in this demo, but should be hashed in production)
- `role`: Access control role determining permissions:
  - `admin`: Can manage all users and campaigns
  - `campaigner`: Can create and manage campaigns
  - `backer`: Can pledge to campaigns
- `isActive`: Boolean flag to enable/disable account access (used for banning)
- `isApproved`: Boolean flag indicating admin approval (mainly for campaigners)

**Usage Example:**

```javascript
import { User } from '../lib/classes.js';
import { uuidv4 } from '../lib/utilities.js';

// Create a new admin user
const adminUser = new User(
  uuidv4(),
  "Admin User",
  "admin@example.com",
  "secureAdminPass",
  "admin",
  true,
  true
);

// Create a campaigner that requires approval
const campaigner = new User(
  uuidv4(),
  "Campaign Creator",
  "creator@example.com",
  "password123",
  "campaigner",
  true,    // Active account
  false    // Not approved yet
);

// Create a regular backer
const backer = new User(
  uuidv4(),
  "John Supporter",
  "john@example.com",
  "backerPass",
  "backer",
  true,
  true
);
```

### Campaign Class

```javascript
class Campaign {
  constructor(
    id,           // Unique identifier (string)
    title,        // Campaign title (string)
    description,  // Campaign description (string)
    image,        // Base64-encoded image string
    category,     // Category name (string)
    goal,         // Funding goal amount (number)
    raised = 0,   // Current amount raised (number)
    deadline,     // Campaign end date (ISO string)
    creatorId,    // User ID of campaign creator (string)
    isApproved = false,  // Admin approval status (boolean)
    rewards = []  // Array of reward objects
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.image = image;
    this.category = category;
    this.goal = goal;
    this.raised = raised;
    this.deadline = deadline;
    this.creatorId = creatorId;
    this.isApproved = isApproved;
    this.rewards = rewards;
  }
}
```

**Property Details:**

- `id`: UUID string that uniquely identifies the campaign
- `title`: Campaign title displayed in listings and headers
- `description`: Long-form description of the campaign and its purpose
- `image`: Base64-encoded string of the campaign's featured image
- `category`: Classification category (e.g., "technology", "environment")
- `goal`: Target funding amount in currency units
- `raised`: Current amount raised from pledges
- `deadline`: ISO date string indicating campaign end date
- `creatorId`: Reference to the User ID of the campaign creator
- `isApproved`: Boolean indicating if the campaign has been approved by admin
- `rewards`: Array of reward objects with structure:
  ```javascript
  {
    id: string,      // Unique reward identifier
    title: string,   // Reward title
    amount: number   // Minimum pledge amount to receive reward
  }
  ```

**Usage Example:**

```javascript
import { Campaign } from '../lib/classes.js';
import { uuidv4 } from '../lib/utilities.js';

// Create a new campaign
const ecoCampaign = new Campaign(
  uuidv4(),
  "Eco-Friendly Water Bottles",
  "Our mission is to reduce plastic waste with reusable, biodegradable water bottles.",
  "data:image/jpeg;base64,/9j/4AAQSkZ...", // Base64 image string
  "environment",
  10000,                 // $10,000 goal
  0,                     // Starting with $0 raised
  "2025-12-31",          // End date
  "user-123",            // Creator's user ID
  false,                 // Not approved yet
  [                      // Rewards
    {
      id: uuidv4(),
      title: "Early Bird Special",
      amount: 25
    },
    {
      id: uuidv4(),
      title: "Family Pack",
      amount: 100
    },
    {
      id: uuidv4(),
      title: "Retailer Package",
      amount: 500
    }
  ]
);
```

### Pledge Class

```javascript
class Pledge {
  constructor(
    id,           // Unique identifier (string)
    campaignId,   // Campaign ID reference (string)
    userId,       // User ID reference (string)
    amount,       // Pledge amount (number)
    rewardId      // Selected reward ID (string)
  ) {
    this.id = id;
    this.campaignId = campaignId;
    this.userId = userId;
    this.amount = amount;
    this.rewardId = rewardId;
  }
}
```

**Property Details:**

- `id`: UUID string that uniquely identifies the pledge
- `campaignId`: Reference to the Campaign ID being funded
- `userId`: Reference to the User ID of the backer making the pledge
- `amount`: Monetary amount of the pledge
- `rewardId`: ID of the selected reward (from the campaign's rewards array)

**Usage Example:**

```javascript
import { Pledge } from '../lib/classes.js';
import { uuidv4 } from '../lib/utilities.js';

// Create a new pledge
const newPledge = new Pledge(
  uuidv4(),
  "campaign-456",    // Campaign being supported
  "user-789",        // Backer's user ID
  100,               // $100 pledge amount
  "reward-123"       // Selected reward ID
);
```

## User API

### Data Model

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "campaigner" | "backer";
  isActive: boolean;
  isApproved: boolean;
}
```

### API Functions

#### `registerUser(userData)`

- **Description**: Register a new user
- **Parameters**: User object
- **Returns**: Created user object or error object
- **Example**:
  ```js
  const newUser = {
    id: "uuid-string",
    name: "Jane Doe",
    email: "jane@example.com",
    password: "securePassword",
    role: "backer",
    isActive: true,
    isApproved: true
  };
  const result = await registerUser(newUser);
  ```

#### `login(email, password)`

- **Description**: Authenticate a user
- **Parameters**: email (string), password (string)
- **Returns**: User object if credentials match, error object otherwise
- **Example**:
  ```js
  const user = await login("jane@example.com", "securePassword");
  if (!user.error) {
    // Authentication successful
  }
  ```

#### `getAllUsers()`

- **Description**: Fetch all users (admin function)
- **Returns**: Array of User objects
- **Example**:
  ```js
  const allUsers = await getAllUsers();
  ```

#### `getUserById(id)`

- **Description**: Fetch a specific user by ID
- **Parameters**: id (string)
- **Returns**: User object
- **Example**:
  ```js
  const user = await getUserById("user-uuid");
  ```

#### `getCampaignerRequests()`

- **Description**: Get all users with role "campaigner" (admin function)
- **Returns**: Array of User objects with role "campaigner"
- **Example**:
  ```js
  const campaigners = await getCampaignerRequests();
  ```

#### `updateUser(id, updates)`

- **Description**: Update user properties (admin: approve campaigners, ban/unban users)
- **Parameters**: id (string), updates (partial User object)
- **Returns**: Updated User object
- **Example**:
  ```js
  const updatedUser = await updateUser("user-uuid", { isApproved: true });
  ```

#### `getUserByCampaignId(campaignId)`

- **Description**: Get the creator of a campaign
- **Parameters**: campaignId (string)
- **Returns**: User object of the campaign creator
- **Example**:
  ```js
  const creator = await getUserByCampaignId("campaign-uuid");
  ```

#### `deleteUser(id)`

- **Description**: Delete a user account
- **Parameters**: id (string)
- **Returns**: Boolean indicating success
- **Example**:
  ```js
  const success = await deleteUser("user-uuid");
  ```

---

## Campaign API

### Data Model

```typescript
interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string; // ISO date string
  image: string; // base64 encoded image
  creatorId: string;
  isApproved: boolean;
  category: string;
  rewards: Array<{
    id: string;
    title: string;
    amount: number;
  }>;
}
```

### API Functions

#### `createCampaign(campaignData)`

- **Description**: Create a new fundraising campaign
- **Parameters**: Campaign object
- **Returns**: Created Campaign object
- **Example**:
  ```js
  const campaign = {
    id: "uuid-string",
    title: "Smart Water Bottle",
    description: "A bottle that tracks hydration",
    goal: 10000,
    raised: 0,
    deadline: "2025-06-30",
    image: "base64-string",
    creatorId: "user-uuid",
    isApproved: false,
    category: "tech",
    rewards: [
      { id: "reward-1", title: "Early Bird", amount: 25 }
    ]
  };
  const result = await createCampaign(campaign);
  ```

#### `getAllCampaigns()`

- **Description**: Get all campaigns (approved and unapproved)
- **Returns**: Array of Campaign objects
- **Example**:
  ```js
  const allCampaigns = await getAllCampaigns();
  ```

#### `getCampaignsByUser(userId)`

- **Description**: Get all campaigns created by a specific user
- **Parameters**: userId (string)
- **Returns**: Array of Campaign objects
- **Example**:
  ```js
  const userCampaigns = await getCampaignsByUser("user-uuid");
  ```

#### `getApprovedCampaigns()`

- **Description**: Get only approved campaigns
- **Returns**: Array of Campaign objects with isApproved = true
- **Example**:
  ```js
  const publicCampaigns = await getApprovedCampaigns();
  ```

#### `searchCampaigns(query)`

- **Description**: Search campaigns by keyword
- **Parameters**: query (string)
- **Returns**: Array of matching Campaign objects
- **Example**:
  ```js
  const results = await searchCampaigns("eco-friendly");
  ```

#### `filterCampaignsByCategory(category)`

- **Description**: Filter campaigns by category and sort by deadline
- **Parameters**: category (string)
- **Returns**: Array of filtered Campaign objects
- **Example**:
  ```js
  const techCampaigns = await filterCampaignsByCategory("tech");
  ```

#### `getCampaignById(id)`

- **Description**: Get a single campaign's details
- **Parameters**: id (string)
- **Returns**: Campaign object
- **Example**:
  ```js
  const campaign = await getCampaignById("campaign-uuid");
  ```

#### `updateCampaign(id, updates)`

- **Description**: Edit campaign details
- **Parameters**: id (string), updates (partial Campaign object)
- **Returns**: Updated Campaign object
- **Example**:
  ```js
  const updatedCampaign = await updateCampaign("campaign-uuid", {
    description: "Updated description",
    goal: 15000
  });
  ```

#### `deleteCampaign(id)`

- **Description**: Delete a campaign
- **Parameters**: id (string)
- **Returns**: Boolean indicating success
- **Example**:
  ```js
  const success = await deleteCampaign("campaign-uuid");
  ```

---

## Pledge API

### Data Model

```typescript
interface Pledge {
  id: string;
  campaignId: string;
  userId: string;
  amount: number;
  rewardId: string;
}
```

### API Functions

#### `createPledge(pledgeData)`

- **Description**: Submit a new pledge to a campaign
- **Parameters**: Pledge object
- **Returns**: Created Pledge object
- **Example**:
  ```js
  const pledge = {
    id: "uuid-string",
    campaignId: "campaign-uuid",
    userId: "user-uuid",
    amount: 100,
    rewardId: "reward-uuid"
  };
  const result = await createPledge(pledge);
  ```

#### `getAllPledges()`

- **Description**: Get all pledges (admin function)
- **Returns**: Array of Pledge objects
- **Example**:
  ```js
  const allPledges = await getAllPledges();
  ```

#### `getPledgesByUser(userId)`

- **Description**: Get all pledges made by a specific user
- **Parameters**: userId (string)
- **Returns**: Array of Pledge objects
- **Example**:
  ```js
  const userPledges = await getPledgesByUser("user-uuid");
  ```

#### `getPledgesByCampaign(campaignId)`

- **Description**: Get all pledges made to a specific campaign
- **Parameters**: campaignId (string)
- **Returns**: Array of Pledge objects
- **Example**:
  ```js
  const campaignPledges = await getPledgesByCampaign("campaign-uuid");
  ```

#### `getUserPledgeToCampaign(userId, campaignId)`

- **Description**: Get a user's pledge to a specific campaign
- **Parameters**: userId (string), campaignId (string)
- **Returns**: Pledge object or empty array if no pledge exists
- **Example**:
  ```js
  const pledge = await getUserPledgeToCampaign("user-uuid", "campaign-uuid");
  ```

#### `getUniquePledgesByCampaign(campaignId)`

- **Description**: Get unique backers for a campaign (counts each user once)
- **Parameters**: campaignId (string)
- **Returns**: Array of unique Pledge objects
- **Example**:
  ```js
  const uniqueBackers = await getUniquePledgesByCampaign("campaign-uuid");
  const backerCount = uniqueBackers.length;
  ```

---

## Update API

### Data Model

```typescript
interface Update {
  id: string;
  campaignId: string;
  message: string;
  timestamp: string; // ISO date string
}
```

### API Functions

#### `postCampaignUpdate(updateData)`

- **Description**: Post a new update to a campaign
- **Parameters**: Update object
- **Returns**: Created Update object
- **Example**:
  ```js
  const update = {
    id: "uuid-string",
    campaignId: "campaign-uuid",
    message: "We've reached 50% of our goal!",
    timestamp: new Date().toISOString()
  };
  const result = await postCampaignUpdate(update);
  ```

#### `getUpdatesByCampaign(campaignId)`

- **Description**: Get all updates for a specific campaign
- **Parameters**: campaignId (string)
- **Returns**: Array of Update objects
- **Example**:
  ```js
  const updates = await getUpdatesByCampaign("campaign-uuid");
  ```

---

## Usage Examples

### User Authentication Flow

```js
// Registration
const newUser = {
  id: generateUUID(),
  name: "John Doe",
  email: "john@example.com",
  password: "password123", // In production, use proper hashing
  role: "backer",
  isActive: true,
  isApproved: true
};

const registrationResult = await registerUser(newUser);
if (registrationResult.error) {
  console.error(registrationResult.error);
} else {
  console.log("Registration successful!");
}

// Login
const user = await login("john@example.com", "password123");
if (user.error) {
  console.error("Login failed:", user.error);
} else {
  sessionStorage.setItem("user", JSON.stringify(user));
  console.log("Login successful!");

  // Redirect based on role
  if (user.role === "admin") {
    window.location.href = "/pages/dashboard.html";
  } else if (user.role === "campaigner") {
    window.location.href = "/pages/campaigns.html";
  } else {
    window.location.href = "/index.html";
  }
}
```

### Campaign Creation & Pledging

```js
// Create a campaign
const newCampaign = {
  id: generateUUID(),
  title: "Eco-Friendly Water Bottles",
  description: "Reusable bottles that reduce plastic waste",
  goal: 5000,
  raised: 0,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  image: "base64-encoded-string",
  creatorId: currentUser.id,
  isApproved: false,
  category: "environment",
  rewards: [
    { id: generateUUID(), title: "Single Bottle", amount: 25 },
    { id: generateUUID(), title: "Family Pack", amount: 80 }
  ]
};

const campaign = await createCampaign(newCampaign);
console.log("Campaign created:", campaign);

// Make a pledge
const pledge = {
  id: generateUUID(),
  campaignId: campaign.id,
  userId: currentUser.id,
  amount: 25,
  rewardId: campaign.rewards[0].id
};

const pledgeResult = await createPledge(pledge);
console.log("Pledge made:", pledgeResult);

// Update campaign funding
const updatedCampaign = await updateCampaign(campaign.id, {
  raised: campaign.raised + pledge.amount
});
console.log("Campaign updated:", updatedCampaign);
```

### Admin Operations

```js
// Get all users
const users = await getAllUsers();
console.log("All users:", users);

// Approve a campaigner
const pendingCampaigners = await getCampaignerRequests();
const campaigner = pendingCampaigners.find(user => !user.isApproved);
if (campaigner) {
  const approvedCampaigner = await updateUser(campaigner.id, { isApproved: true });
  console.log("Campaigner approved:", approvedCampaigner);
}

// Ban a user
const bannedUser = await updateUser(userId, { isActive: false });
console.log("User banned:", bannedUser);

// Delete inappropriate campaign
const success = await deleteCampaign(campaignId);
console.log("Campaign deleted:", success);
```

---

## Best Practices

### Working with Classes

1. **Always use the class constructors** to create new instances rather than creating plain objects to ensure consistent data structures:

   ```javascript
   // Good
   const user = new User(uuidv4(), "Name", "email@example.com", /*...*/);

   // Avoid
   const user = {
     id: uuidv4(),
     name: "Name",
     // Might miss required properties or use incorrect types
   };
   ```

2. **Validate data before creating instances**:

   ```javascript
   function createUser(formData) {
     // Validate email format
     if (!isValidEmail(formData.email)) {
       throw new Error("Invalid email format");
     }

     // Validate password strength
     if (formData.password.length < 8) {
       throw new Error("Password must be at least 8 characters");
     }

     return new User(
       uuidv4(),
       formData.name,
       formData.email,
       formData.password,
       formData.role,
       true,
       formData.role === "backer" // Auto-approve backers
     );
   }
   ```

3. **Handle class serialization/deserialization consistently**:

   ```javascript
   // Serializing for storage
   sessionStorage.setItem('user', JSON.stringify(userInstance));

   // Deserializing (reconstruct the class instance)
   const userData = JSON.parse(sessionStorage.getItem('user'));
   const userInstance = new User(
     userData.id,
     userData.name,
     userData.email,
     userData.password,
     userData.role,
     userData.isActive,
     userData.isApproved
   );
   ```

### Error Handling

Most API functions return the following error structure when unsuccessful:

```js
{
  error: "Error message details"
}
```

Always check for the presence of an error property before proceeding with the result:

```js
const result = await login(email, password);
if (result.error) {
  // Handle error
  displayError(result.error);
} else {
  // Proceed with successful result
  saveUserAndRedirect(result);
}
```
