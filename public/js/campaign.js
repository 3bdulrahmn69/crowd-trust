import { createCampaignCard } from '../lib/utilities.js';
import { getApprovedCampaigns, updateCampaign } from '../lib/api.js';

document.addEventListener('DOMContentLoaded', () => {
  let creatCampaignbtn = document.getElementById(`openDialogBtn1`);
  let creatDialog = document.getElementById(`campaignDialog`);
  let UpdateCampaignbtn = document.getElementById(`openDialogBtn2`);
  let UpdateDialog = document.getElementById(`updateDialog`);
  let addCardbtn = document.getElementById(`addCardBtn`);

  //dialog for creating campaign
  creatCampaignbtn.addEventListener(`click`, function () {
    console.log(`open dialog`);
    creatDialog.showModal();
  });
  //dialog for updating campaign
  UpdateCampaignbtn.addEventListener(`click`, function () {
    UpdateDialog.showModal();
  });

  //display card
  let campaignForm = document.getElementById('campaign-form');
  campaignForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Capture form inputs
    const campaignTitle = document.getElementById('campaign-title').value;
    const campaignDescription = document.getElementById(
      'campaign-description'
    ).value;
    const campaignGoal = parseFloat(
      document.getElementById('campaign-goal').value
    );
    const campaignDeadline = document.getElementById('campaign-deadline').value;
    const campaignImage = document.getElementById('campaign-image').files[0];
    const campaignCategory = document.getElementById('category').value;
    // Create a campaign object
    const campaign = {
      id: Date.now(),
      title: campaignTitle,
      description: campaignDescription,
      goal: campaignGoal,
      raised: 0,
      deadline: campaignDeadline,
      image: URL.createObjectURL(campaignImage),
      category: campaignCategory,
    };

    const campaignCard = await createCampaignCard(campaign);

    document.getElementById(`cardContainer`).appendChild(campaignCard);

    //   document.getElementById('campaignDialog').close();
  });

  // addCardbtn.addEventListener(`click`, function () {
  //     let card = createCampaignCard(creatDialog);
  //     document.getElementById(`cardContainer`).appendChild(card);
  // });
  // window.addEventListener('click', (event) => {
  //         if (!event.target === campaignDialog) {
  //             campaignDialog.close();
  //         } else if (!event.target === updateDialog) {
  //             updateDialog.close();
  //         }
  //     });
});

getApprovedCampaigns().then((campaigns) => {
  document.getElementById('campaign-container').innerHTML = ''; // Clear existing cards

  campaigns.forEach(async (campaign) => {
    const card = await createCampaignCard(campaign);
    document.getElementById('campaign-container').appendChild(card);
  });
});

//display update
let updateForm = document
  .getElementById('update-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    // Capture form inputs
    const campaignId = document.getElementById('update-campaign-id').value;
    const updateTitle = document.getElementById('update-title').value;
    const updateContent = document.getElementById('update-content').value;

    // Create an updates object
    const updates = {
      title: updateTitle,
      description: updateContent,
    };

    // Call the updateCampaign function
    try {
      const updatedCampaign = await updateCampaign(campaignId, updates);

      const campaignCard = document.getElementById(`cardContainer`);
      campaignCard.appendChild(updatedCampaign);

      // Close the dialog
      document.getElementById('updateDialog').close();
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  });
