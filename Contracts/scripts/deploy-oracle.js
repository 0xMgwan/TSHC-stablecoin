// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  console.log("Deploying NEDA Pay SimplePriceOracle to", network.name);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy SimplePriceOracle
  console.log("Deploying SimplePriceOracle...");
  const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
  const priceOracle = await SimplePriceOracle.deploy(deployer.address);
  await priceOracle.waitForDeployment();
  const priceOracleAddress = await priceOracle.getAddress();
  console.log("SimplePriceOracle deployed to:", priceOracleAddress);
  
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
    priceOracle: priceOracleAddress,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment information saved to", deploymentFile);
  
  // Wait for block confirmations for Etherscan verification
  console.log("Waiting for block confirmations...");
  await priceOracle.deploymentTransaction().wait(5);
  
  // Verify contract on Etherscan
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: priceOracleAddress,
      constructorArguments: [deployer.address],
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
