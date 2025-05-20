# Crowd Trust

A crowdfunding platform focused on building trust between project creators and backers through transparency and credibility.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Authentication](#authentication)
- [User Pages](#user-pages)
- [Campaign Management](#campaign-management)
- [Administration](#administration)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Crowd Trust is a modern crowdfunding platform that enables transparent fundraising and trust-building between creators and backers. The platform offers comprehensive campaign management, user authentication, and administrative tools to ensure a seamless experience.

## Features

- **User Authentication**: Secure login/registration with role-based access
- **Campaign Creation & Management**: Intuitive tools for creators to launch and manage campaigns
- **Backer Experience**: Simple discovery and pledge process for supporters
- **Administrative Dashboard**: Powerful tools for platform management
- **Responsive Design**: Optimized for all devices and screen sizes
- **Interactive UI**: Modern, user-friendly interface with real-time feedback

## Authentication

### Sign In (`login.html`)

- **Features:** Email/password login
- **Implementation:** Client-side validation, JSON Server authentication, role-based redirection
- **Security:** Session storage management, protected routes
- **API:** `GET /users?email={email}` (user lookup)

### Registration (`register.html`)

- **Features:** Email registration, role selection (Campaigner/Backer)
- **Implementation:** Form validation, JSON Server integration
- **API:** `POST /users` (user creation)

## User Pages

### Landing Page (`index.html`)

- **Features:** Navigation, hero section, campaign highlights, personalized welcome for logged users
- **API:** `GET /campaigns`, `GET /users`

### Profile Management (`profile.html`)

- **Features:** User details, password management, account settings
- **Implementation:** Role-based display, account deletion option and change email functionality
- **API:** `GET/PATCH/DELETE /users`

## Campaign Management

### Campaign Details (`campaign.html`)

- **Features:** Campaign information, creator tools (add/edit for appropriate roles)
- **API:** `GET/POST /campaigns`, `GET /users`

### Checkout Process (`checkout.html`)

- **Features:** Donation options, payment methods, rewards selection
- **Implementation:** Real-time calculations, pledge creation
- **API:** `GET/PATCH /campaigns`, `GET /users`, `PUT /pledges`

## Administration

### Admin Dashboard (`dashboard.html`)

- **Features:**
  - Campaign moderation with approval/rejection workflow
  - Comprehensive pledge analytics with filtering options
  - User management system with status controls and role assignment
  - Performance metrics and platform health monitoring
- **Implementation:**
  - Real-time data visualization for trends analysis
  - Advanced filtering and search capabilities
  - Bulk action tools for efficient management
- **API Endpoints:**
  - `GET /campaigns` - Retrieve all campaigns with status
  - `PATCH /campaigns/{id}` - Update campaign approval status
  - `GET /pledges` - Access all platform donations
  - `GET /users` - List all users with role information
  - `PATCH /users/{id}` - Modify user status (active/blocked)

## Technologies

- **Frontend:**
  - HTML5, SCSS, JavaScript (ES6+)
  - Modern CSS architecture (7-1 pattern)
  - ES modules for JavaScript organization
- **Backend:**
  - JSON Server (mock REST API)
  - Node.js for server operations
- **Data Management:**
  - Session Storage for user authentication
  - JSON for data persistence
- **Development Tools:**
  - npm for package management
  - Git for version control

## Project Structure

```
crowd-trust/
├── public/                  # Front-end assets and code
│   ├── images/              # Image assets
│   ├── styles/              # CSS/SCSS files
│   │   ├── abstracts/       # Variables, mixins, functions
│   │   ├── base/            # Base styles, typography, reset
│   │   ├── components/      # UI components (buttons, cards)
│   │   ├── layout/          # Layout sections (header, footer)
│   │   ├── pages/           # Page-specific styles
│   │   └── themes/          # Theme variations
│   ├── lib/                 # Utility libraries and helpers
│   │   ├── api.js           # API interaction functions
│   │   ├── classes.js       # Data models
│   │   └── utilities.js     # Helper functions
│   ├── js/                  # JavaScript modules
│   │   ├── main.js          # Main application logic
│   │   ├── campaign.js      # Campaign page logic
│   │   ├── profile.js       # Profile page logic
│   │   ├── register.js      # Registration logic
│   │   └── dashboard.js     # Admin dashboard logic
│   ├── pages/               # HTML pages
│   │   ├── auth/            # Authentication pages
│   │   │   ├── login.html   # Login page
│   │   │   └── register.html # Registration page
│   │   ├── user/            # User pages
│   │   │   └── profile.html # User profile page
│   │   ├── dashboard.html   # Admin dashboard
│   │   ├── campaigns.html   # Campaigns listing
│   │   └── checkout.html    # Donation checkout
│   └── index.html           # Landing page
├── server.js                # JSON Server configuration
├── db.json                  # Database for JSON Server
├── package.json             # Project dependencies
├── package-lock.json        # Dependency lock file
├── .gitignore               # Git ignore configuration
└── README.md                # Project documentation
```

## Data Models

The platform uses several core classes to represent key entities in the system:

### User Class

Represents a user account in the system with associated roles and permissions.

```javascript
class User {
  constructor(
    id,           // Unique identifier
    name,         // User's full name
    email,        // Email address (must be unique)
    password,     // User's password (should be hashed in production)
    role,         // "admin", "campaigner", or "backer"
    isActive = true,      // Account status flag
    isApproved = false    // Admin approval status (for campaigners)
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

**Usage Example:**
```javascript
import { User } from './lib/classes.js';
import { uuidv4 } from './lib/utilities.js';

// Create a new backer account
const newUser = new User(
  uuidv4(),                // Generate a unique ID
  "Jane Smith",            // Name
  "jane@example.com",      // Email
  "securePassword123",     // Password
  "backer",                // Role
  true,                    // Active status
  true                     // Approval status (auto-approved for backers)
);

// Create a campaigner account (requires admin approval)
const newCampaigner = new User(
  uuidv4(),
  "John Creator",
  "john@example.com",
  "password456",
  "campaigner",
  true,       // Active
  false       // Not approved yet
);
```

### Campaign Class

Defines a fundraising campaign with its details, goals, and associated rewards.

```javascript
class Campaign {
  constructor(
    id,           // Unique identifier
    title,        // Campaign title
    description,  // Detailed description
    image,        // Base64 encoded image string
    category,     // Campaign category
    goal,         // Funding goal amount
    raised = 0,   // Amount raised so far
    deadline,     // ISO date string for end date
    creatorId,    // User ID of campaign creator
    isApproved = false,  // Admin approval status
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

**Usage Example:**
```javascript
import { Campaign } from './lib/classes.js';
import { uuidv4 } from './lib/utilities.js';

// Create a new campaign
const newCampaign = new Campaign(
  uuidv4(),                                      // Generate a unique ID
  "Eco-Friendly Water Bottles",                  // Title
  "Reusable bottles that reduce plastic waste",  // Description
  "data:image/png;base64,iVBORw...",            // Base64 image
  "environment",                                 // Category
  5000,                                          // Funding goal
  0,                                             // Initial amount raised
  "2025-12-31",                                  // Deadline
  "user-123",                                    // Creator ID
  false,                                         // Not approved yet
  [                                              // Rewards
    { id: uuidv4(), title: "Single Bottle", amount: 25 },
    { id: uuidv4(), title: "Family Pack", amount: 80 }
  ]
);
```

### Pledge Class

Represents a financial contribution from a backer to a specific campaign.

```javascript
class Pledge {
  constructor(
    id,           // Unique identifier
    campaignId,   // ID of the campaign being funded
    userId,       // ID of the user making the pledge
    amount,       // Monetary amount pledged
    rewardId      // ID of the reward selected (if any)
  ) {
    this.id = id;
    this.campaignId = campaignId;
    this.userId = userId;
    this.amount = amount;
    this.rewardId = rewardId;
  }
}
```

**Usage Example:**
```javascript
import { Pledge } from './lib/classes.js';
import { uuidv4 } from './lib/utilities.js';

// Create a new pledge
const newPledge = new Pledge(
  uuidv4(),          // Generate a unique ID
  "campaign-456",    // Campaign ID
  "user-789",        // Backer's user ID
  50,                // Pledge amount
  "reward-123"       // Selected reward ID
);
```

These classes are used throughout the application to maintain consistent data structures and facilitate communication with the API endpoints.

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/3bdulrahmn69/crowd-trust.git
   ```
2. Navigate to project directory
   ```
   cd crowd-trust
   ```
3. Install dependencies
   ```
   npm install
   ```
4. Start JSON Server
   ```
   npm run start
   ```
5. Open `localhost:3000` in your browser

### Development

To modify the SCSS files and compile to CSS:

```
# If you have SASS installed globally
sass --watch public/styles/style.scss:public/styles/style.css
```

## API Documentation

The API is powered by JSON Server with the following main endpoints:

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get specific user
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Campaigns

- `GET /campaigns` - List all campaigns
- `GET /campaigns/:id` - Get specific campaign
- `POST /campaigns` - Create campaign
- `PATCH /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign

### Pledges

- `GET /pledges` - List all pledges
- `POST /pledges` - Create pledge
- `GET /unique-pledges?campaignId=:id` - Get unique backers for a campaign

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

All pages implement role-based access control and responsive design for optimal user experience.
