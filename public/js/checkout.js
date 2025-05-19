import { getCampaignById, updateCampaign, createPledge } from '../lib/api.js';
import { getUserData, uuidv4 } from '../lib/utilities.js';
import { Pledge } from '../lib/classes.js';

const donationForm = document.getElementById('donationForm');
const donationAmountInput = document.getElementById('donationAmount');
const amountButtons = document.querySelectorAll(
  '.donation-form__amount-option'
);
const rewardSelect = document.getElementById('selectReward');
const campaignImage = document.getElementById('campaignImage');
const campaignTitle = document.getElementById('campaignTitle');
const campaignDescription = document.getElementById('campaignDescription');
const raisedAmount = document.getElementById('raisedAmount');
const goalAmount = document.getElementById('goalAmount');
const progressBar = document.getElementById('progressBar');
const daysRemainingText = document.getElementById('daysRemaining');
const exceedingMsg = document.getElementById('exceeding-msg');

const campaignId = new URLSearchParams(window.location.search).get('campaign');

(async function init() {
  const data = await getCampaignById(campaignId);
  if (!data) return;

  // Render campaign details
  campaignTitle.textContent = data.title;
  campaignDescription.textContent = data.description;
  campaignImage.src = data.image;
  raisedAmount.textContent = data.raised.toLocaleString();
  goalAmount.textContent = data.goal.toLocaleString();
  daysRemainingText.textContent = `Days Remaining: ${calculateDaysRemaining(
    data.deadline
  )}`;

  // Update progress bar width
  const percentage = Math.min((data.raised / data.goal) * 100, 100);
  progressBar.style.width = `${percentage}%`;

  // Setup reward options
  rewardSelect.innerHTML += data.rewards
    .map((reward) => {
      return `<option value="${reward.id}">$${reward.amount} - ${reward.title}</option>`;
    })
    .join('');

  // Setup amount buttons
  amountButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      amountButtons.forEach((b) => b.classList.remove('active'));
      donationAmountInput.value = btn.dataset.amount;
      btn.classList.add('active');
      validateDonationAmount(data.goal - data.raised);
    });
  });

  // Validate donation input
  donationAmountInput.addEventListener('blur', () => {
    validateDonationAmount(data.goal - data.raised);
  });
})();

// Handle form submission
donationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const donationValue = parseInt(donationAmountInput.value);
  const selectedRewardId = rewardSelect.value;
  const data = await getCampaignById(campaignId);
  const remaining = data.goal - data.raised;

  if (donationValue > remaining) {
    validateDonationAmount(remaining);
    return;
  }

  // Update campaign raised value
  const updatedRaised = data.raised + donationValue;
  await updateCampaign(campaignId, { raised: updatedRaised });

  const { id } = await getUserData();

  // Create pledge
  const pledge = new Pledge(
    uuidv4(),
    campaignId,
    id,
    donationValue,
    selectedRewardId
  );

  let res = await createPledge(pledge);

  if (res) {
    document.getElementById('donation-card').style.display = 'none';
    document.getElementById('thankYouMessage').classList.remove('hidden');
  }
});

// Utility: Validate input against goal
function validateDonationAmount(remaining) {
  const value = parseInt(donationAmountInput.value);
  if (value > remaining) {
    exceedingMsg.classList.remove('hidden');
  } else {
    exceedingMsg.classList.add('hidden');
  }
}

// Utility: Calculate remaining days
function calculateDaysRemaining(deadline) {
  const end = new Date(deadline);
  const now = new Date();
  const diffTime = end - now;
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
}
