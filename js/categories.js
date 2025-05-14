//to loop in categories of campaign 
// Sample category data (replace with API call)
const categories = [
  { id: 1, name: "Medical", icon: "fas fa-heartbeat", count: 42 },
  { id: 2, name: "Memorial", icon: "fas fa-monument", count: 28 },
  { id: 3, name: "Charity", icon: "fas fa-hand-holding-heart", count: 65 },
  { id: 4, name: "Emergency", icon: "fas fa-exclamation-triangle", count: 37 },
  { id: 5, name: "Business", icon: "fas fa-briefcase", count: 89 },
  { id: 6, name: "Education", icon: "fas fa-graduation-cap", count: 54 },
  { id: 7, name: "Sports", icon: "fas fa-running", count: 31 },
  { id: 8, name: "Animals", icon: "fas fa-paw", count: 47 },
  { id: 9, name: "Wedding", icon: "fas fa-ring", count: 23 }
];

function renderCategories() {
  const categoryGrid = document.getElementById('category-grid');
  
  if (categoryGrid) {
    categoryGrid.innerHTML = categories.map(category => `
      <div class="category-card" data-category-id="${category.id}">
        <div class="category-card-icon">
          <i class="${category.icon}"></i>
        </div>
        <h3 class="category-card-name">${category.name}</h3>
        <p class="category-card-count">${category.count} campaigns</p>
      </div>
    `).join('');
    
    // Add click event listeners
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const categoryId = card.getAttribute('data-category-id');
        // Filter campaigns by category (implement this function)
        filterCampaignsByCategory(categoryId);
        
        // Update active state
        document.querySelectorAll('.category-card').forEach(c => {
          c.classList.remove('active');
        });
        card.classList.add('active');
      });
    });
  }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', renderCategories);