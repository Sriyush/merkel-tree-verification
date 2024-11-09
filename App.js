const Web3 = require('web3');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const infuraUrl = 'https://sepolia.infura.io/v3/40b58eb3ecec453fa24d172bc65fad6c';
const web3 = new Web3(infuraUrl);

const blockNumber = 7042416;

async function fetchTransactionsFromBlock(blockNumber) {
    try {
        const block = await web3.eth.getBlock(blockNumber, true); 
        const transactions = block.transactions;

        console.log(`Transactions in block ${blockNumber}:`);
        console.log('Total transactions:', transactions.length);
        transactions.forEach(tx => {
            console.log(`Transaction Hash: ${tx.hash}`);
            console.log(`From: ${tx.from}, To: ${tx.to}, Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`);
        });
        
        const transactionHashes = transactions.map(tx => tx.hash);
        const leaves = transactionHashes.map(txHash => keccak256(txHash)); // Hash each transaction hash
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        const root = tree.getHexRoot();
        console.log('Merkle Root:', root);

        const selectedTransactionHash = transactionHashes[1]; 
        console.log(selectedTransactionHash)
        const proof = tree.getProof(keccak256(selectedTransactionHash));
        console.log('Raw Merkle Proof:', proof);

        // Format the proof for Solidity
        const proofArray = proof.map(node => '0x' + node.data.toString('hex'));
        console.log('Formatted Proof for Solidity:', proofArray);

        // Local verification to confirm correctness
        const isValid = tree.verify(proof, keccak256(selectedTransactionHash), root);
        console.log('Proof is valid:', isValid);
        
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

fetchTransactionsFromBlock(blockNumber);
