document.addEventListener('DOMContentLoaded', function () {
    const whitelistToggle = document.getElementById('isWhitelisted');
    const whitelistFields = document.getElementById('whitelistFields');

    whitelistToggle.addEventListener('change', function () {
        if (this.value === 'true') {
            whitelistFields.style.display = 'block';
        } else {
            whitelistFields.style.display = 'none';
        }
    });
});

const client = new Client({
    network: {
        testnet: 'testnet.hedera.com:50211',
    },
    operator: {
        accountId: process.env.MY_ACCOUNT_ID,
        privateKey: process.env.MY_PRIVATE_KEY,
    },
});

document.getElementById('createPresaleForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const tokenName = document.getElementById('tokenName').value;
    const aboutToken = document.getElementById('aboutToken').value;
    const tokenID = document.getElementById('tokenID').value;
    const tokenSymbol = document.getElementById('tokenSymbol').value;
    const totalSupply = document.getElementById('totalSupply').value;
    const presaleAllocation = document.getElementById('presaleAllocation').value;
    const liquidityAllocation = document.getElementById('liquidityAllocation').value;
    const presaleRate = document.getElementById('presaleRate').value;
    const listingRate = document.getElementById('listingRate').value;
    const softcap = document.getElementById('softcap').value;
    const hardcap = document.getElementById('hardcap').value;
    const min = document.getElementById('min').value;
    const max = document.getElementById('max').value;
    const startTime = document.getElementById('startTime').value;
    const deadline = document.getElementById('deadline').value;
    const image = document.getElementById('image').value;
    const feeOption = document.getElementById('feeOption').value === 'true';
    const liquidityPercentage = document.getElementById('liquidityPercentage').value;
    const isWhitelisted = document.getElementById('isWhitelisted').value === 'true';
    const whitelistFields = isWhitelisted ? [
        document.getElementById('nftTokenId').value,
        document.getElementById('whitelistDuration').value
    ] : [0, 0];
    const useSaucerSwap = document.getElementById('useSaucerSwap').value === 'true';
    const burnUnsoldTokens = document.getElementById('burnUnsoldTokens').value === 'true';

    const contractCreate = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction("createPresale", new ContractFunctionParameters()
            .addString(tokenName)
            .addString(aboutToken)
            .addAddress(tokenID)
            .addString(tokenSymbol)
            .addUint256(totalSupply)
            .addUint256(presaleAllocation)
            .addUint256(liquidityAllocation)
            .addUint256(presaleRate)
            .addUint256(listingRate)
            .addUint256(softcap)
            .addUint256(hardcap)
            .addUint256(min)
            .addUint256(max)
            .addUint256(startTime)
            .addUint256(deadline)
            .addString(image)
            .addBool(feeOption)
            .addUint256(liquidityPercentage)
            .addBool(isWhitelisted)
            .addUint256(whitelistFields[0])
            .addUint256(whitelistFields[1])
            .addBool(useSaucerSwap)
            .addBool(burnUnsoldTokens)
        )
        .freezeWith(client);

    const txResponse = await contractCreate.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const presaleId = receipt.contractId;

    console.log('Presale created with ID:', presaleId.toString());
    alert('Presale created successfully with ID: ' + presaleId.toString());
});

async function fetchPresales() {
    const contractCall = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getPresales");

    const queryResponse = await contractCall.execute(client);
    const presales = queryResponse.getUint256Array(0);

    const presalesList = document.getElementById('presalesList');
    presalesList.innerHTML = '';

    presales.forEach((presale, index) => {
        const presaleItem = document.createElement('div');
        presaleItem.className = 'presale-item';
        presaleItem.innerHTML = `
            <h3>Presale ${index + 1}</h3>
            <p>Token Name: ${presale.tokenName}</p>
            <p>About Token: ${presale.aboutToken}</p>
            <p>Token Symbol: ${presale.tokenSymbol}</p>
            <button onclick="donateToPresale(${index})">Donate to Presale</button>
        `;
        presalesList.appendChild(presaleItem);
    });
}

if (document.getElementById('presalesList')) {
    fetchPresales();
}

async function donateToPresale(presaleId) {
    const amount = prompt('Enter the amount to donate:');
    const contractCall = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setPayableAmount(amount)
        .setFunction("donateToPresale", new ContractFunctionParameters()
            .addUint256(presaleId)
        );

    const txResponse = await contractCall.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log('Donation transaction status:', receipt.status.toString());
    alert('Donation successful');
}

document.getElementById('refundPresaleForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const presaleId = document.getElementById('refundPresaleId').value;

    const contractCall = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("requestRefund", new ContractFunctionParameters()
            .addUint256(presaleId)
        );

    const txResponse = await contractCall.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log('Refund transaction status:', receipt.status.toString());
    alert('Refund requested successfully');
});
