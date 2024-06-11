document.addEventListener("DOMContentLoaded", async function () {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDisplay = document.getElementById('walletAddressDisplay');
    const whitelistOptions = document.getElementById('whitelistOptions');
    const isWhitelistedSelect = document.getElementById('isWhitelisted');

    let walletAddress = "";

    // Connect to wallet function
    connectWalletBtn.addEventListener('click', async () => {
        // Assuming using HashPack SDK for connecting wallet
        try {
            const hashconnect = new HashConnect();
            const initData = await hashconnect.init();
            const state = await hashconnect.connect();
            walletAddress = state.pairingData[0].accountIds[0];

            // Display wallet address
            connectWalletBtn.innerText = `Connected: ${walletAddress}`;
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    });

    // Show or hide whitelist options based on selection
    isWhitelistedSelect.addEventListener('change', function () {
        if (this.value === 'true') {
            whitelistOptions.classList.remove('hidden');
        } else {
            whitelistOptions.classList.add('hidden');
        }
    });

    // Create Presale
    document.getElementById('createPresaleForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Gather form data
        const formData = new FormData(this);
        const presaleData = {};
        formData.forEach((value, key) => {
            presaleData[key] = value;
        });

        // Interact with smart contract to create presale
        // Assuming using ethers.js or HashPack SDK for contract interaction

        try {
            // Code to interact with the contract and create presale

            // Generate a link to the presale page
            const presaleId = /* Retrieve presale ID from transaction receipt */;
            const presaleLink = `${window.location.origin}/presale.html?id=${presaleId}`;
            alert(`Presale created! Share this link with your community: ${presaleLink}`);
        } catch (error) {
            console.error("Presale creation failed:", error);
        }
    });

    // Load presale details
    async function loadPresaleDetails(presaleId) {
        // Fetch presale details from smart contract
        // Assuming using ethers.js or HashPack SDK for contract interaction
        const presaleDetails = {}; // Fetch from contract

        // Display presale details on the page
        document.getElementById('presaleTitle').innerText = presaleDetails.tokenName;
        document.getElementById('presaleDescription').innerText = presaleDetails.aboutToken;
        document.getElementById('presaleImage').src = presaleDetails.image;
        document.getElementById('presaleStatus').innerText = presaleDetails.isFinalized ? "Finalized" : (presaleDetails.deadline > Date.now() ? "Active" : "Ended");

        if (presaleDetails.isWhitelisted) {
            document.getElementById('whitelistInfo').classList.remove('hidden');
            document.getElementById('whitelistStatus').innerText = "Yes";
            document.getElementById('whitelistNftTokenId').innerText = presaleDetails.nftTokenId;
        } else {
            document.getElementById('whitelistInfo').classList.add('hidden');
        }

        // Owner specific actions
        if (walletAddress === presaleDetails.owner) {
            document.getElementById('ownerActions').classList.remove('hidden');
            document.getElementById('userActions').classList.add('hidden');

            document.getElementById('finalizeBtn').addEventListener('click', async function () {
                // Call finalize function on the smart contract
                try {
                    // Code to finalize the presale
                    alert("Presale finalized!");
                } catch (error) {
                    console.error("Presale finalization failed:", error);
                }
            });
        } else {
            document.getElementById('ownerActions').classList.add('hidden');
            document.getElementById('userActions').classList.remove('hidden');
        }
    }

    // Check if we are on a presale detail page
    const urlParams = new URLSearchParams(window.location.search);
    const presaleId = urlParams.get('id');
    if (presaleId) {
        await loadPresaleDetails(presaleId);
    }

    // Donate to Presale
    document.getElementById('donateForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const donationAmount = document.getElementById('donationAmount').value;

        // Interact with the contract to donate
        try {
            // Code to donate to the presale
            alert("Donation successful!");
        } catch (error) {
            console.error("Donation failed:", error);
        }
    });

    // Load all presales
    async function loadAllPresales() {
        const presaleList = document.getElementById('presaleList');

        // Fetch all presales from the contract
        const presales = []; // Fetch from contract

        presales.forEach(presale => {
            const li = document.createElement('li');
            li.classList.add('presale-item');

            li.innerHTML = `
                <span>${presale.tokenName}</span>
                <button onclick="location.href='presale.html?id=${presale.id}'">View Presale</button>
            `;

            presaleList.appendChild(li);
        });
    }

    if (document.getElementById('presaleList')) {
        await loadAllPresales();
    }
});
