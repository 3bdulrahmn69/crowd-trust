import { getCampaignById } from "../lib/api.js";

const donationForm = document.getElementById("donationForm");
const donationAmount = document.getElementById("donationAmount");
const amountOptions = document.querySelectorAll(".amount-option");
const paymentMethod = document.getElementById("paymentMethod");
const creditCardFields = document.getElementById("creditCardFields");
const cardNumber = document.getElementById("cardNumber");
const expiryDate = document.getElementById("expiryDate");
const cvv = document.getElementById("cvv");

const campaignId = new URLSearchParams(window.location.search).get("campaign");
const relatedCampaigns = document.getElementById("relatedCampaigns");
const campaignTitle = document.createElement("h2");
const campaignDescription = document.createElement("p");
const daysRemaining = document.getElementById("daysRemaining");

(async function init() {
  const data = await getData(campaignId);

  // Render campaign details
  campaignTitle.innerText = data.title;
  relatedCampaigns.appendChild(campaignTitle);

  campaignDescription.innerText = data.description;
  relatedCampaigns.appendChild(campaignDescription);

  const remainingDays = calculateDaysRemaining(data.deadline);
  daysRemaining.innerText = `Days Remaining: ${remainingDays}`;

  const remaining = data.goal - data.raised;
  console.log("Remaining amount:", remaining);

  // Add validation for exceeding amount
  donationAmount.addEventListener("blur", function () {
    const warningMsg = document.getElementById("exceeding-msg");
    if (donationAmount.value > remaining) {
      warningMsg.classList.remove("hidden");
    } else {
      warningMsg.classList.add("hidden");
    }
  });

  // Add click listeners to preset amount buttons
  amountOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      donationAmount.value = btn.dataset.amount;
    });
  });
})();

// Submit form handler
donationForm.addEventListener("submit", function (e) {
  e.preventDefault();
  donationForm.style.display = "none";
  document.getElementById("thankYouMessage").classList.remove("hidden");
});

// Fetch campaign data
async function getData(campaignId) {
  const data = await getCampaignById(campaignId);
  return data;
}

// Helper to calculate days remaining
function calculateDaysRemaining(deadline) {
  const end = new Date(deadline);
  const now = new Date();
  const diffTime = end - now;
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
}
