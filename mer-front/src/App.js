import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Replace with your deployed contract address
const contractAddress = "0x5D6a769a212Bcbbe20CCca1C0F60ecc8423f11d8";

// Replace with your contract's ABI (this is just a simplified example, you should use the actual ABI of your contract)
const abi = [
  "function verifyTransaction(bytes32 transactionHash, bytes32[] calldata proof) public view returns (bool)",
  "function getMerkleRoot() public view returns (bytes32)"
];

function App() {
  const [transactionHash, setTransactionHash] = useState('');
  const [proof, setProof] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [merkleRoot, setMerkleRoot] = useState('');
  const [contract, setContract] = useState(null);

  // Initialize the provider and contract inside useEffect
  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/40b58eb3ecec453fa24d172bc65fad6c');
    const contractInstance = new ethers.Contract(contractAddress, abi, provider);
    setContract(contractInstance);
    
    // Fetch the stored Merkle root when the component mounts
    async function fetchMerkleRoot() {
      if (contractInstance) {
        try {
          const root = await contractInstance.getMerkleRoot();
          setMerkleRoot(root);
        } catch (error) {
          console.error('Error fetching Merkle root:', error);
        }
      }
    }
    fetchMerkleRoot();
  }, []); // Empty dependency array to run once on mount

// Frontend Component (React)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!contract) return;

  try {
    // Convert proof into an array of hex values and transaction hash to hex format
    const formattedProof = proof.split(',').map((item) => ethers.utils.hexlify(item.trim()));
    const txHashBytes = ethers.utils.hexlify(transactionHash);

    // Send the data to the backend
    const response = await fetch('http://localhost:5000/verifyTransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionHash: txHashBytes,
        proof: formattedProof,
      }),
    });

    const data = await response.json();
    setVerificationResult(data.isValid ? "Transaction is valid!" : "Transaction is not valid.");
  } catch (error) {
    console.error('Error verifying transaction:', error);
    setVerificationResult("Error during verification.");
  }
};

  
  return (
    <div>
      <h1>Merkle Transaction Verification</h1>
      <p>Stored Merkle Root: {merkleRoot}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Transaction Hash:
            <input
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Enter Transaction Hash"
              required
            />
          </label>
        </div>
        <div>
          <label>
            Merkle Proof (comma-separated):
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Enter Merkle proof as comma-separated hashes"
              required
            />
          </label>
        </div>
        <button type="submit">Verify Transaction</button>
      </form>

      {verificationResult && <p>{verificationResult}</p>}
    </div>
  );
}

export default App;
