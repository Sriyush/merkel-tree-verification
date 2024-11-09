const hre = require("hardhat");
const cors = require('cors');
const app = express();
async function main() {
  const contractAddress = "0x5D6a769a212Bcbbe20CCca1C0F60ecc8423f11d8";
  const MerkleVerification = await hre.ethers.getContractFactory("MerkleVerification");
  const contract = MerkleVerification.attach(contractAddress);

//   console.log("Available functions:", Object.keys(contract.functions));

  // Replace with a valid Merkle root (example value provided here)
  const merkleRoot = "0x7bcda188deef98143c99492d46e8a280a60fad6ee3f1bd128002ae93961d91a0";

  // Call setMerkleRoot
  const tx = await contract.setMerkleRoot(merkleRoot);
  await tx.wait();
  console.log("Merkle root set successfully");
  console.log("Transaction hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
