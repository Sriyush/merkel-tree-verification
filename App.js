const express = require('express');
const Web3 = require('web3');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const cors = require('cors');

// Initialize Web3 provider
const infuraUrl = 'https://sepolia.infura.io/v3/40b58eb3ecec453fa24d172bc65fad6c';
const web3 = new Web3(infuraUrl);

// Set up Express
const app = express();
app.use(cors()); // Enable CORS if needed
app.use(express.json()); // For parsing application/json

const blockNumber = 7042416;

// Function to fetch transactions from a block and generate Merkle tree proof
async function fetchTransactionsFromBlock(blockNumber) {
    try {
        const block = await web3.eth.getBlock(blockNumber, true);
        const transactions = block.transactions;

        console.log(`Transactions in block ${blockNumber}:`);
        console.log('Total transactions:', transactions.length);

        // Hash each transaction to create the Merkle tree leaves
        const transactionHashes = transactions.map(tx => tx.hash);
        const leaves = transactionHashes.map(txHash => keccak256(txHash));

        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const root = tree.getHexRoot();
        console.log('Merkle Root:', root);

        // Example of selecting the second transaction
        const selectedTransactionHash = transactionHashes[1];
        console.log('Selected Transaction Hash:', selectedTransactionHash);

        const proof = tree.getProof(keccak256(selectedTransactionHash));
        console.log('Raw Merkle Proof:', proof);

        // Format the proof for Solidity
        const proofArray = proof.map(node => '0x' + node.data.toString('hex'));
        console.log('Formatted Proof for Solidity:', proofArray);

        // Return proof and root for API response
        return {
            proofArray,
            root,
            selectedTransactionHash,
            isValid: tree.verify(proof, keccak256(selectedTransactionHash), root),
        };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

// API endpoint to fetch Merkle proof
app.post('/verifyTransaction', async (req, res) => {
    try {
        const { blockNumber } = req.body;

        if (!blockNumber) {
            return res.status(400).json({ error: 'Block number is required' });
        }

        const result = await fetchTransactionsFromBlock(blockNumber);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process the transaction verification', message: error.message });
    }
});

// Start the Express server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
