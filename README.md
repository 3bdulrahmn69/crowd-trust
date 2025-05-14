# crowd-trust
CrowdTrust is a modern crowdfunding platform that empowers individuals and organizations to raise funds for ideas, causes, and projects through transparent and community-driven support.

#### Sign In Page (`login.html`)

#### Features:
- Email/password login
- "Forgot password" link
- Social login options (Google, Facebook)
- Link to sign up page

#### Form Fields:
1. **Email** (required)
2. **Password** (required)

### Technical Implementation

#### Authentication Flow:
1. Client-side validation
2. API request to JSON Server
3. Role-based redirection:
   - Admin → `/admin-dashboard.html`
   - Creator → `/creator-dashboard.html`
   - Backer → `/backer-dashboard.html`

#### Security:
- Password hashing (simulated in current implementation)
- Session management using localStorage
- Protected routes based on user role

#### API Endpoints:
- `POST /users` - User registration
- `GET /users?email={email}` - User lookup for login
