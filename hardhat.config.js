require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.0",  // Ensure you're using a compatible Solidity version
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, // Replace with your Infura project ID
      accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY}`], // Use your private key (set this in your .env file)
    },
  },
};
