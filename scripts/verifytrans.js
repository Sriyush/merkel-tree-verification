const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const Web3 = require('web3');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const app = express();
app.use(cors());
app.use(express.json());

const infuraUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));

const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
const contractAddress = "0x5D6a769a212Bcbbe20CCca1C0F60ecc8423f11d8";
const abi = [
  "function verifyTransaction(bytes32 transactionHash, bytes32[] calldata proof) public view returns (bool)",
  "function getMerkleRoot() public view returns (bytes32)"
];
const contract = new ethers.Contract(contractAddress, abi, provider);

const blockNumber = 7042416;

app.post('/verifyTransaction', async (req, res) => {
  const { transactionHash, proof } = req.body;

  try {
    console.log("Received transaction hash:", transactionHash);
    console.log("Received proof:", proof);

    const block = await web3.eth.getBlock(blockNumber, true);
    console.log("Fetched block:", block);
    
    if (!block || !block.transactions || block.transactions.length === 0) {
      console.error("No transactions found in this block");
      return res.status(400).json({ error: 'No transactions found in the block.' });
    }
    
    const transactionHashes = block.transactions.map(tx => tx.hash);
    console.log("Transaction hashes:", transactionHashes);
    const leaves = transactionHashes.map(txHash => keccak256(txHash)); 
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    const storedMerkleRoot = await contract.getMerkleRoot();
    console.log("Stored Merkle Root from the contract:", storedMerkleRoot);

    const hashedTransaction = keccak256(transactionHash);
    console.log("Hashed transaction hash:", hashedTransaction.toString('hex'));

    // Convert proof to Buffer
    const proofBuffers = proof.map(p => Buffer.from(p.slice(2), 'hex'));
    console.log("Buffered proof:", proofBuffers.map(buf => buf.toString('hex')));

    // Verify the Merkle proof using the stored Merkle root
    const isValid = tree.verify(proofBuffers, keccak256(transactionHash), storedMerkleRoot);
    console.log("Merkle proof verification result:", isValid);

    // Respond with the result of the verification
    res.json({ isValid });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
