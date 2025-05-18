import {getCampaignById} from "../lib/api"
document.addEventListener('DOMContentLoaded', function() {

    const donationForm = document.getElementById('donationForm');
    const donationAmount = document.getElementById('donationAmount');
    const amountOptions = document.querySelectorAll('.amount-option');
    const paymentMethod = document.getElementById('paymentMethod');
    const creditCardFields = document.getElementById('creditCardFields');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    const campaignId = new URLSearchParams(window.location.search).get('campaign');
    const relatedCampaigns=document.getElementById('relatedCampaigns');
    const campaignTiltle = document.createElement("h2")


});
