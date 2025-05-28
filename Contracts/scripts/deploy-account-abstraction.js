// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  console.log("Deploying NEDA Pay Account Abstraction contracts to", network.name);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Read existing deployment info to get TSHC address
  const fs = require("fs");
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
  
  // Check if we have TSHC address from previous deployments
  let tshcAddress;
  if (deploymentInfo.tshc) {
    tshcAddress = deploymentInfo.tshc;
    console.log("Using existing TSHC address:", tshcAddress);
  } else {
    // Check older deployment files
    try {
      const oldDeploymentFile = `deployment-${network.name}-2025-04-15.json`;
      if (fs.existsSync(oldDeploymentFile)) {
        const oldFileContent = fs.readFileSync(oldDeploymentFile, 'utf8');
        const oldDeploymentInfo = JSON.parse(oldFileContent);
        if (oldDeploymentInfo.tshc) {
          tshcAddress = oldDeploymentInfo.tshc;
          console.log("Using TSHC address from older deployment:", tshcAddress);
        }
      }
    } catch (error) {
      console.error("Error reading older deployment file:", error);
    }
  }
  
  if (!tshcAddress) {
    throw new Error("TSHC address not found in deployment files");
  }
  
  // Deploy SimplePaymaster
  console.log("Deploying SimplePaymaster...");
  const SimplePaymaster = await ethers.getContractFactory("SimplePaymaster");
  const paymaster = await SimplePaymaster.deploy(tshcAddress);
  await paymaster.waitForDeployment();
  const paymasterAddress = await paymaster.getAddress();
  console.log("SimplePaymaster deployed to:", paymasterAddress);
  
  // Deploy SimpleSmartWalletFactory
  console.log("Deploying SimpleSmartWalletFactory...");
  const SimpleSmartWalletFactory = await ethers.getContractFactory("SimpleSmartWalletFactory");
  const factory = await SimpleSmartWalletFactory.deploy(paymasterAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("SimpleSmartWalletFactory deployed to:", factoryAddress);
  
  // Update deployment info
  deploymentInfo = {
    ...deploymentInfo,
    network: network.name,
    deployer: deployer.address,
    paymaster: paymasterAddress,
    smartWalletFactory: factoryAddress,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment information saved to", deploymentFile);
  
  // Wait for block confirmations for Etherscan verification
  console.log("Waiting for block confirmations...");
  await paymaster.deploymentTransaction().wait(5);
  await factory.deploymentTransaction().wait(5);
  
  // Verify contracts on Etherscan
  console.log("Verifying SimplePaymaster on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: paymasterAddress,
      constructorArguments: [tshcAddress],
    });
    
    console.log("SimplePaymaster verified successfully!");
  } catch (error) {
    console.error("Error verifying SimplePaymaster:", error);
  }
  
  console.log("Verifying SimpleSmartWalletFactory on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [paymasterAddress],
    });
    
    console.log("SimpleSmartWalletFactory verified successfully!");
  } catch (error) {
    console.error("Error verifying SimpleSmartWalletFactory:", error);
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
