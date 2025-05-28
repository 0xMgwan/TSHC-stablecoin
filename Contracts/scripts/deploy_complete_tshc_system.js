// deploy_complete_tshc_system.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying complete TSHC system...");

  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // 1. Deploy the TSHCForwarder first
  console.log("\nDeploying TSHCForwarder...");
  const TSHCForwarder = await ethers.getContractFactory("TSHCForwarder");
  const forwarder = await TSHCForwarder.deploy();
  await forwarder.deployed();
  console.log("TSHCForwarder deployed to:", forwarder.address);
  
  // 2. Deploy the UpgradeableTSHC with the forwarder address
  console.log("\nDeploying UpgradeableTSHC...");
  const UpgradeableTSHC = await ethers.getContractFactory("UpgradeableTSHC");
  
  // Deploy as upgradeable using the UUPS proxy pattern
  const tshc = await upgrades.deployProxy(
    UpgradeableTSHC, 
    [deployer.address, forwarder.address], // Use the forwarder as the trusted forwarder
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  
  await tshc.deployed();
  
  console.log("UpgradeableTSHC deployed to:", tshc.address);
  console.log("Implementation address:", await upgrades.erc1967.getImplementationAddress(tshc.address));
  console.log("Admin address:", await upgrades.erc1967.getAdminAddress(tshc.address));
  
  console.log("\nDeployment complete!");
  console.log("\nSummary:");
  console.log("- TSHCForwarder: ", forwarder.address);
  console.log("- UpgradeableTSHC (Proxy): ", tshc.address);
  console.log("- UpgradeableTSHC (Implementation): ", await upgrades.erc1967.getImplementationAddress(tshc.address));
  
  // Additional instructions
  console.log("\nNext steps:");
  console.log("1. Mint some TSHC tokens using: npx hardhat run scripts/mint_tshc.js --network base-sepolia");
  console.log("2. Update the admin portal with the new contract addresses");
  console.log("3. Test gasless transactions using the forwarder");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
