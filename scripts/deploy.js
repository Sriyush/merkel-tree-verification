async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const MerkleVerification = await ethers.getContractFactory("MerkleVerification");
    const merkleVerification = await MerkleVerification.deploy();
    console.log("MerkleVerification contract deployed to:", merkleVerification.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  

  