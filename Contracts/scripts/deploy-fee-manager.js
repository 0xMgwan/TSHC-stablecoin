// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  console.log("Deploying NEDA Pay SimpleFeeManager to", network.name);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy SimpleFeeManager
  console.log("Deploying SimpleFeeManager...");
  const SimpleFeeManager = await ethers.getContractFactory("SimpleFeeManager");
  const feeManager = await SimpleFeeManager.deploy(deployer.address, deployer.address);
  await feeManager.waitForDeployment();
  const feeManagerAddress = await feeManager.getAddress();
  console.log("SimpleFeeManager deployed to:", feeManagerAddress);
  
  // Save deployment addresses to a file
  const fs = require("fs");
  
  // Read existing deployment info if it exists
  let deploymentInfo = {};
  const deploymentFile = `deployment-${network.name}-latest.json`;
  
  try {
    if (fs.existsSync(deploymentFile)) {
      const fileContent = fs.readFileSync(deploymentFile, 'utf8');
      deploymentInfo = JSON.parse(fileContent);
      console.log("Loaded existing deployment information");
    }
  } catch (error) {
    console.log("No existing deployment file found, creating new one");
  }
  
  // Update with new contract address
  deploymentInfo = {
    ...deploymentInfo,
    network: network.name,
    deployer: deployer.address,
    feeManager: feeManagerAddress,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment information saved to", deploymentFile);
  
  // Wait for block confirmations for Etherscan verification
  console.log("Waiting for block confirmations...");
  await feeManager.deploymentTransaction().wait(5);
  
  // Verify contract on Etherscan
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: feeManagerAddress,
      constructorArguments: [deployer.address, deployer.address],
    });
    
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
