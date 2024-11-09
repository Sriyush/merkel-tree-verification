const hre = require("hardhat");
const cors = require('cors');
const app = express();
async function main() {
    const contractAddress = "0x5D6a769a212Bcbbe20CCca1C0F60ecc8423f11d8"; // Your contract address
    const MerkleVerification = await hre.ethers.getContractFactory("MerkleVerification");
    const contract = MerkleVerification.attach(contractAddress);
  
    const blockNumber = 7042416; // Example block number
    const selectedTransactionHash = "0x7baf990d1e549f4a976e7a7988ab817f8547197110719995131937133818092d"; // Transaction hash you are verifying
  
    // Fetch the Merkle Root from the contract
    const storedMerkleRoot = await contract.getMerkleRoot();
    console.log("Stored Merkle Root in Contract:", storedMerkleRoot);
  
    // Get the transactions from the block and generate the Merkle Tree
    const Web3 = require('web3');
    const { MerkleTree } = require('merkletreejs');
    const keccak256 = require('keccak256');
    const infuraUrl = 'https://sepolia.infura.io/v3/40b58eb3ecec453fa24d172bc65fad6c'; // Example Infura URL
    const web3 = new Web3(infuraUrl);
    const block = await web3.eth.getBlock(blockNumber, true); 
    const transactions = block.transactions;
  
    const transactionHashes = transactions.map(tx => tx.hash);
    const leaves = transactionHashes.map(txHash => keccak256(txHash)); // Hash each transaction hash
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  
    const generatedMerkleRoot = tree.getHexRoot();
    console.log("Generated Merkle Root:", generatedMerkleRoot);
  
    // Compare the roots
    if (storedMerkleRoot.toLowerCase() === generatedMerkleRoot.toLowerCase()) {
      console.log("Merkle Root matches!");
    } else {
      console.log("Merkle Root does not match.");
    }
  
    // Dynamically generate proof for the selected transaction
    const proof = tree.getProof(keccak256(selectedTransactionHash));
    
    // Convert the proof to the correct format (bytes32 values)
    const formattedProof = proof.map(item => ethers.utils.hexlify(item.data));
  
    console.log("Generated proof:", formattedProof);
  
    // Now, verify the transaction with proof
    const isValid = tree.verify(proof, keccak256(selectedTransactionHash), storedMerkleRoot.toLowerCase());
    // console.log('Proof is valid:', isValid);
    // const isValid = await contract.verifyTransaction(selectedTransactionHash, formattedProof);
    console.log("Is transaction included in the Merkle Tree?", isValid);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
