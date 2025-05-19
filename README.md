# crowd-trust
A crowd trust campaign in crowdfunding refers to building trust with potential backers to encourage contributions. This is crucial because crowdfunding relies on individuals contributing to projects, and trust is essential for people to risk their money. It involves demonstrating credibility, transparency, and a strong commitment to the campaign's goals.

### Sign In Page (`login.html`)

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
- Session management using Seesion Storage
- Protected routes based on user role

#### API Endpoints:
- `POST /users` - User registration
- `GET /users?email={email}` - User lookup for login
*************************
### register page (`register.html`)
#### Features:
- Email/password registration
- Social registration options (Google, Facebook)
- Link to login page

#### Form Fields:
1. **Email** (required)
2. **Password** (required)
3. **Confirm Password** (required)
4. **Role** (required, dropdown: Admin, Creator, Backer)

### Technical Implementation

#### Registration Flow:
1. Client-side validation
2. API request to JSON Server
3. Automatic login and redirection based on role
***********************
### landing page (`index.html`)
#### features 
1. nav bar
2. hero section
3. about us
4. campaign
5. contact us
6. footer
### Technical Implementation
#### Specifed user experiance
1. every user have welcome message
2. list to easy rich his profile and campaigns
#### endpoints
1. get  campaigns
2. get  users
**************************
### admin dashboard (`admin-dashboard.html`)
#### features 
1. home page
2. side bar
3. dashboard
4. log out


### Technical Implementation

 #### campaign dispaly 
 1. approve or delete inappropiate campaign
 2. filter between campaign
 #### pledges display
 1. get all pledges
 2. filter between pledges
 #### diplay all users
 1. get all users by data and role
 2. filter between users
 3. block or unblock users
#### end points
1. get all campaigns
2. get all pledges
3. get all users
4. update campaign
5. delete campaign
6. update user
7. delete user
***********************************
### checkout page `checkout.html`
features
1. choose donation amout
2. choose payment method
3. choose reward
4. confirm donation
5. thank you message

#### technical implementation
1. get campaign details
2. get user details
3. calculate remaning amount
4. calculate total raised
5. update campaign info
6. add pledge to database
 #### end points
 1. get campaign
 2. get user
 3. patch campaign
 4. put pledge
*****************************
### campaign page (`campaign.html`)
#### features
1. campaign details
2. create campaign dialog
3. edit campaign dialog
4. add campaign button
5. role based display for feature
 #### technical implementation
 1. get campaign details
 2. get user details
 
 #### end points
 1. get campaign
 2. get user
 3. post campaign

********************
### profile page (`profile.html`)
#### features
1. user details
2. change password dialog
3. delete account button
4. role based display for feature
 #### technical implementation
 1. get user details
 2. update user details
 3. delete user
 #### end points
 1. get user
 2. patch user
 3. delete user
*********************







