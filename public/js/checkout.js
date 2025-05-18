import { getCampaignById , updateCampaign ,createPledge} from "../lib/api.js";
import {getUserData ,uuidv4} from "../lib/utilities.js";
import { Pledge } from '../lib/classes.js';

const donationForm = document.getElementById("donationForm");
const donationAmount = document.getElementById("donationAmount");
const amountOptions = document.querySelectorAll(".amount-option");
const rewardcontainer= document.getElementById("selectReward");


const campaignId = new URLSearchParams(window.location.search).get("campaign");
const relatedCampaigns = document.getElementById("relatedCampaigns");
const campaignTitle = document.createElement("h2");
const campaignDescription = document.createElement("p");
const daysRemaining = document.getElementById("daysRemaining");

(async function init() {
  const data = await getData(campaignId);
  console.log(data);

  // Render campaign details
  campaignTitle.innerText = data.title;
  relatedCampaigns.appendChild(campaignTitle);
  campaignTitle.classList.add("donation-header");

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

   console.log(data.rewards);
    for (let i = 0; i < data.rewards.length; i++){
        console.log(data.rewards[i]);
        const rewardOption = document.createElement("option");
     rewardOption.innerText = ` ${data.rewards[i].amount} - ${data.rewards[i].title}`;
     rewardOption.value = data.rewards[i].id;
     rewardcontainer.appendChild(rewardOption);
    }
    

  // Add click listeners to preset amount buttons
  amountOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      donationAmount.value = btn.dataset.amount;
      btn.classList.add("active");
    });
    btn.addEventListener("blur", function () {
      btn.classList.remove("active");
    });
  });
})();

// Submit form handler
donationForm.addEventListener("submit",async function (e) {
  e.preventDefault();
  document.getElementById(`donation-card`).style.display = "none";
  document.getElementById("thankYouMessage").classList.remove("hidden");
  const data = await getData(campaignId);
  const supportUpdate =data.raised += parseInt(donationAmount.value);
    await updateCampaign(campaignId, {raised: supportUpdate});
    const selectReward = document.getElementById("selectReward");
    

    const pledge = new Pledge(uuidv4(), campaignId,getUserData().id ,donationAmount.value, selectReward.value);
    await createPledge(pledge);
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
 
 
