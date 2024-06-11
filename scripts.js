document.addEventListener("DOMContentLoaded", async function () {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDisplay = document.getElementById('walletAddressDisplay');
    const whitelistOptions = document.getElementById('whitelistOptions');
    const isWhitelistedSelect = document.getElementById('isWhitelisted');

    let walletAddress = "";
    let hashconnect = new HashConnect();
    let appMetadata = {
        name: "CrowdFunding",
        description: "CrowdFunding DApp",
        icon: "https://example.com/icon.png"
    };

    // Initialize HashConnect
    await hashconnect.init(appMetadata, "testnet", false);

    // Pairing state
    let saveData = await hashconnect.connect();
    let state = await hashconnect.connectToLocalWallet(saveData.pairingString);

    // Set up pairing event listener
    hashconnect.pairingEvent.once((pairingData) => {
        walletAddress = pairingData.accountIds[0];
        connectWalletBtn.innerText = `Connected: ${walletAddress}`;
    });

    connectWalletBtn.addEventListener('click', async () => {
        try {
            if (!walletAddress) {
                // Generate the pairing string
                const pairingString = hashconnect.generatePairingString(saveData, "testnet", false);
                hashconnect.connectToLocalWallet(pairingString);
            } else {
                alert(`Already connected: ${walletAddress}`);
            }
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
        try {
            const response = await createPresale(presaleData); // Your function to call smart contract
            const receipt = await response.getReceipt(client);
            const presaleId = receipt.contractId.num;
            const presaleLink = `${window.location.origin}/presale.html?id=${presaleId}`;
            alert(`Presale created! Share this link with your community: ${presaleLink}`);
        } catch (error) {
            console.error("Presale creation failed:", error);
        }
    });

    // Load presale details
    async function loadPresaleDetails(presaleId) {
        // Fetch presale details from smart contract
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
                    const response = await finalizePresale(presaleId); // Your function to call smart contract
                    await response.getReceipt(client);
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
            const response = await donateToPresale(presaleId, donationAmount); // Your function to call smart contract
            await response.getReceipt(client);
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
