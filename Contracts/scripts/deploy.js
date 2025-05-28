// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  console.log("Deploying NEDA Pay minimal contracts to", network.name);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy SimpleTSHC token
  console.log("Deploying SimpleTSHC token...");
  const SimpleTSHC = await ethers.getContractFactory("SimpleTSHC");
  const tshc = await SimpleTSHC.deploy(deployer.address);
  await tshc.waitForDeployment();
  const tshcAddress = await tshc.getAddress();
  console.log("SimpleTSHC deployed to:", tshcAddress);
  
  // Deploy SimpleReserve contract
  console.log("Deploying SimpleReserve contract...");
  const SimpleReserve = await ethers.getContractFactory("SimpleReserve");
  const reserve = await SimpleReserve.deploy(tshcAddress, deployer.address);
  await reserve.waitForDeployment();
  const reserveAddress = await reserve.getAddress();
  console.log("SimpleReserve deployed to:", reserveAddress);
  
  // Grant MINTER_ROLE to Reserve contract
  console.log("Granting MINTER_ROLE to SimpleReserve contract...");
  const MINTER_ROLE = await tshc.MINTER_ROLE();
  const grantTx = await tshc.grantRole(MINTER_ROLE, reserveAddress);
  await grantTx.wait();
  console.log("MINTER_ROLE granted to SimpleReserve contract");
  
  // Deploy TestUSDC token for collateral
  console.log("Deploying TestUSDC for collateral...");
  const TestUSDC = await ethers.getContractFactory("TestUSDC");
  const testUSDC = await TestUSDC.deploy(deployer.address);
  await testUSDC.waitForDeployment();
  const testUSDCAddress = await testUSDC.getAddress();
  console.log("TestUSDC deployed to:", testUSDCAddress);
  
  // Add TestUSDC as collateral to Reserve
  console.log("Adding TestUSDC as collateral to SimpleReserve...");
  // Set collateral ratio to 150% (15000)
  const collateralRatio = 15000;
  const addCollateralTx = await reserve.addCollateralAsset(testUSDCAddress, collateralRatio);
  await addCollateralTx.wait();
  console.log("TestUSDC added as collateral with ratio:", collateralRatio);
  
  console.log("Deployment completed!");
  console.log("SimpleTSHC Token:", tshcAddress);
  console.log("SimpleReserve:", reserveAddress);
  console.log("TestUSDC:", testUSDCAddress);
  
  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    tshc: tshcAddress,
    reserve: reserveAddress,
    testUSDC: testUSDCAddress,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    `deployment-${network.name}-${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment information saved to file");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
