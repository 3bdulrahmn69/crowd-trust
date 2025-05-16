class ApiService {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        return this.handleResponse(response);
    }

    async post(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async patch(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Something went wrong');
        }
        return response.json();
    }
}

// Campaign Manager
class CampaignManager {
    constructor(apiService) {
        this.api = apiService;
        this.currentCampaign = null;
    }

    async loadCampaign(campaignId) {
        try {
            const campaign = await this.api.get(`/campaigns/${campaignId}`);
            const pledges = await this.api.get(`/pledges?campaignId=${campaignId}`);
            const updates = await this.api.get(`/updates?campaignId=${campaignId}`);
            
            this.currentCampaign = {
                ...campaign,
                pledges,
                updates
            };
            
            return this.currentCampaign;
        } catch (error) {
            console.error('Failed to load campaign:', error);
            throw error;
        }
    }

    async createCampaign(campaignData) {
        try {
            // Convert image to Base64
            if (campaignData.imageFile) {
                campaignData.image = await this.fileToBase64(campaignData.imageFile);
                delete campaignData.imageFile;
            }
            
            const newCampaign = await this.api.post('/campaigns', campaignData);
            return newCampaign;
        } catch (error) {
            console.error('Failed to create campaign:', error);
            throw error;
        }
    }

    async updateCampaign(campaignId, updateData) {
        try {
            const updatedCampaign = await this.api.patch(`/campaigns/${campaignId}`, updateData);
            return updatedCampaign;
        } catch (error) {
            console.error('Failed to update campaign:', error);
            throw error;
        }
    }

    async postUpdate(campaignId, updateData) {
        try {
            const newUpdate = await this.api.post('/updates', {
                ...updateData,
                campaignId
            });
            return newUpdate;
        } catch (error) {
            console.error('Failed to post update:', error);
            throw error;
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}

// UI Renderer
class CampaignRenderer {
    constructor() {
        this.campaignContainer = document.getElementById('campaign-container');
    }

    renderCampaign(campaign) {
        const progressPercent = Math.min((campaign.pledged / campaign.goal) * 100, 100);
        const deadline = new Date(campaign.deadline);
        const today = new Date();
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

        this.campaignContainer.innerHTML = `
            <section class="campaign-hero">
                <div class="campaign-hero-container">
                    <div class="campaign-hero-media">
                        ${campaign.image ? `<img src="${campaign.image}" alt="${campaign.title}">` : ''}
                    </div>
                    <div class="campaign-hero-details">
                        <div class="category-badge">
                            <i class="fas fa-tag"></i>
                            <span class="category-name">${campaign.category || 'General'}</span>
                        </div>
                        <h1 class="campaign-title">${campaign.title}</h1>
                        
                        <div class="creator">
                            <div class="creator-avatar">
                                <img src="https://randomuser.me/api/portraits/tech/${campaign.creatorId || 1}.jpg" alt="Creator">
                            </div>
                            <div class="creator-info">
                                <div class="creator-name">Creator ${campaign.creatorId || 'Unknown'}</div>
                            </div>
                        </div>
                        
                        <p class="campaign-description">${campaign.description}</p>
                        
                        <div class="progress">
                            <div class="progress-stats">
                                <div class="amount-raised">$${campaign.pledged || 0}</div>
                                <div class="funding-goal">$${campaign.goal} goal</div>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                        </div>
                        
                        <div class="info-cards">
                            <div class="info-card">
                                <div class="value">${campaign.backers || 0}</div>
                                <div class="label">Backers</div>
                            </div>
                            <div class="info-card">
                                <div class="value">${diffDays > 0 ? diffDays : 0}</div>
                                <div class="label">Days Left</div>
                            </div>
                            <div class="info-card">
                                <div class="value">${campaign.isApproved ? 'Approved' : 'Pending'}</div>
                                <div class="label">Status</div>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary btn-full" id="support-button">Support This Campaign</button>
                    </div>
                </div>
            </section>
            
            <section class="tabs">
                <div class="tabs-header">
                    <button class="tabs-button active" data-tab="story">Story</button>
                    <button class="tabs-button" data-tab="updates">Updates</button>
                    <button class="tabs-button" data-tab="pledges">Pledges</button>
                </div>
                
                <div class="tabs-content active" id="story-tab">
                    <div class="campaign-story">
                        ${campaign.story || '<p>No story content available.</p>'}
                    </div>
                </div>
                
                <div class="tabs-content" id="updates-tab">
                    ${campaign.updates && campaign.updates.length > 0 ? 
                        campaign.updates.map(update => `
                            <div class="update-card">
                                <h3>${update.title}</h3>
                                <p class="update-date">${new Date(update.createdAt).toLocaleDateString()}</p>
                                <div class="update-content">${update.content}</div>
                            </div>
                        `).join('') : 
                        '<p>No updates yet.</p>'}
                    ${campaign.isCreator ? `
                        <button class="btn btn-secondary" id="post-update-button">Post Update</button>
                    ` : ''}
                </div>
                
                <div class="tabs-content" id="pledges-tab">
                    ${campaign.pledges && campaign.pledges.length > 0 ? 
                        campaign.pledges.map(pledge => `
                            <div class="pledge-card">
                                <div class="pledge-amount">$${pledge.amount}</div>
                                <div class="pledge-user">User ${pledge.userId}</div>
                                <div class="pledge-date">${new Date(pledge.createdAt).toLocaleDateString()}</div>
                            </div>
                        `).join('') : 
                        '<p>No pledges yet. Be the first to support this campaign!</p>'}
                </div>
            </section>
            
            <section class="rewards">
                <h2 class="section-title">
                    <i class="fas fa-gift"></i>
                    Rewards
                </h2>
                
                <div class="rewards-grid" id="rewards-grid">
                    ${campaign.rewards && campaign.rewards.length > 0 ? 
                        campaign.rewards.map(reward => `
                            <div class="rewards-card">
                                <h3 class="rewards-card-title">${reward.title}</h3>
                                <div class="rewards-card-amount">$${reward.amount}</div>
                                <p class="rewards-card-description">${reward.description}</p>
                                <button class="btn btn-primary reward-button" data-reward-id="${reward.id}">Select Reward</button>
                            </div>
                        `).join('') : 
                        '<p>No rewards offered for this campaign.</p>'}
                </div>
            </section>
        `;

        // Initialize tab functionality
        this.initTabs();
    }

    initTabs() {
        const tabButtons = document.querySelectorAll('.tabs-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and content
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tabs-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }
}

// Form Handler
class FormHandler {
    constructor(campaignManager) {
        this.campaignManager = campaignManager;
        this.initForms();
    }

    initForms() {
        // Campaign Form
        const campaignForm = document.getElementById('campaign-form');
        if (campaignForm) {
            campaignForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const rewards = [];
                document.querySelectorAll('.reward-item').forEach(item => {
                    rewards.push({
                        title: item.querySelector('.reward-title').value,
                        amount: parseFloat(item.querySelector('.reward-amount').value),
                        description: item.querySelector('.reward-description').value
                    });
                });
                
                const campaignData = {
                    title: document.getElementById('campaign-title').value,
                    description: document.getElementById('campaign-description').value,
                    goal: parseFloat(document.getElementById('campaign-goal').value),
                    deadline: document.getElementById('campaign-deadline').value,
                    rewards,
                    imageFile: document.getElementById('campaign-image').files[0]
                };
                
                try {
                    const newCampaign = await this.campaignManager.createCampaign(campaignData);
                    alert('Campaign created successfully!');
                    window.location.href = `campaign.html?id=${newCampaign.id}`;
                } catch (error) {
                    alert(`Error creating campaign: ${error.message}`);
                }
            });
        }

        // Update Form
        const updateForm = document.getElementById('update-form');
        if (updateForm) {
            updateForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const updateData = {
                    title: document.getElementById('update-title').value,
                    content: document.getElementById('update-content').value
                };
                
                const campaignId = document.getElementById('update-campaign-id').value;
                
                try {
                    await this.campaignManager.postUpdate(campaignId, updateData);
                    alert('Update posted successfully!');
                    document.getElementById('update-form-modal').style.display = 'none';
                    // Refresh updates tab
                } catch (error) {
                    alert(`Error posting update: ${error.message}`);
                }
            });
        }

        // Add Reward Button
        const addRewardBtn = document.getElementById('add-reward');
        if (addRewardBtn) {
            addRewardBtn.addEventListener('click', () => {
                const rewardsContainer = document.getElementById('rewards-container');
                const rewardItem = document.createElement('div');
                rewardItem.className = 'reward-item';
                rewardItem.innerHTML = `
                    <input type="text" placeholder="Reward title" class="reward-title" required>
                    <input type="number" placeholder="Amount" min="1" class="reward-amount" required>
                    <textarea placeholder="Description" class="reward-description" required></textarea>
                    <button type="button" class="btn btn-secondary remove-reward">Remove</button>
                `;
                rewardsContainer.appendChild(rewardItem);
                
                // Add event listener to new remove button
                rewardItem.querySelector('.remove-reward').addEventListener('click', () => {
                    rewardsContainer.removeChild(rewardItem);
                });
            });
        }
    }
}

// Modal Handler
class ModalHandler {
    constructor() {
        this.initModals();
    }

    initModals() {
        // Get all modal close buttons
        const closeButtons = document.querySelectorAll('.close-modal');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
    }

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
}

// Main App
class App {
    constructor() {
        this.apiService = new ApiService();
        this.campaignManager = new CampaignManager(this.apiService);
        this.renderer = new CampaignRenderer();
        this.modalHandler = new ModalHandler();
        this.formHandler = new FormHandler(this.campaignManager);
        
        this.init();
    }

    async init() {
        // Set current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        // Check if we're on a campaign page
        const urlParams = new URLSearchParams(window.location.search);
        const campaignId = urlParams.get('id');
        
        if (campaignId) {
            try {
                const campaign = await this.campaignManager.loadCampaign(campaignId);
                this.renderer.renderCampaign(campaign);
                
                // Set up event listeners for this campaign
                this.setupCampaignEvents(campaign);
            } catch (error) {
                console.error('Error loading campaign:', error);
                document.getElementById('campaign-container').innerHTML = `
                    <div class="error-message">
                        <h2>Error loading campaign</h2>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
        
        // Set up global event listeners
        this.setupGlobalEvents();
    }

    setupGlobalEvents() {
        // Start Campaign button
        const startCampaignBtn = document.getElementById('start-campaign-link');
        if (startCampaignBtn) {
            startCampaignBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.modalHandler.openModal('campaign-form-modal');
            });
        }
    }

    setupCampaignEvents(campaign) {
        // Post Update button
        const postUpdateBtn = document.getElementById('post-update-button');
        if (postUpdateBtn) {
            postUpdateBtn.addEventListener('click', () => {
                document.getElementById('update-campaign-id').value = campaign.id;
                this.modalHandler.openModal('update-form-modal');
            });
        }
        
        // Support button
        const supportBtn = document.getElementById('support-button');
        if (supportBtn) {
            supportBtn.addEventListener('click', () => {
                // Scroll to rewards section
                document.querySelector('.rewards').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
        
        // Reward buttons
        const rewardButtons = document.querySelectorAll('.reward-button');
        rewardButtons.forEach(button => {
            button.addEventListener('click', () => {
                const rewardId = button.getAttribute('data-reward-id');
                const reward = campaign.rewards.find(r => r.id == rewardId);
                alert(`You selected the ${reward.title} reward for $${reward.amount}`);
                // Here you would typically open a pledge form
            });
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
