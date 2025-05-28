// deploy_upgradeable_tshc.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying UpgradeableTSHC contract...");

  // Get the contract factory
  const UpgradeableTSHC = await ethers.getContractFactory("UpgradeableTSHC");
  
  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // For this example, we'll use the deployer as the trusted forwarder
  // In production, you would use a proper meta-transaction forwarder contract
  const trustedForwarder = deployer.address;
  
  // Deploy as upgradeable using the UUPS proxy pattern
  const tshc = await upgrades.deployProxy(
    UpgradeableTSHC, 
    [deployer.address, trustedForwarder], 
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  
  await tshc.deployed();
  
  console.log("UpgradeableTSHC deployed to:", tshc.address);
  console.log("Implementation address:", await upgrades.erc1967.getImplementationAddress(tshc.address));
  console.log("Admin address:", await upgrades.erc1967.getAdminAddress(tshc.address));
  
  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
