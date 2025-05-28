// deploy_tshc_forwarder.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TSHCForwarder contract...");

  // Get the contract factory
  const TSHCForwarder = await ethers.getContractFactory("TSHCForwarder");
  
  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy the forwarder
  const forwarder = await TSHCForwarder.deploy();
  await forwarder.deployed();
  
  console.log("TSHCForwarder deployed to:", forwarder.address);
  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
