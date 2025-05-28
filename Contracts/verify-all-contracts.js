const hre = require("hardhat");

async function main() {
  console.log("Starting verification of all contracts on BaseScan...");
  
  // List of all contracts with their addresses and constructor arguments
  const contracts = [
    {
      name: "SimpleTSHC",
      address: "0x0859D42FD008D617c087DD386667da51570B1aAB",
      constructorArgs: ["0x4c7455eb3f73f761A2394699EA156196D8a0449D"],
      contractPath: "contracts/SimpleTSHC.sol:SimpleTSHC"
    },
    {
      name: "SimpleReserve",
      address: "0x72Ff093CEA6035fa395c0910B006af2DC4D4E9F5",
      constructorArgs: ["0x0859D42FD008D617c087DD386667da51570B1aAB", "0x4c7455eb3f73f761A2394699EA156196D8a0449D"],
      contractPath: "contracts/SimpleReserve.sol:SimpleReserve"
    },
    {
      name: "TestUSDC",
      address: "0x4ecD2810a6A412fdc95B71c03767068C35D23fE3",
      constructorArgs: ["0x4c7455eb3f73f761A2394699EA156196D8a0449D"],
      contractPath: "contracts/TestUSDC.sol:TestUSDC"
    },
    {
      name: "SimplePriceOracle",
      address: "0xe4A05fca88C4F10fe6d844B75025E3415dFe6170",
      constructorArgs: ["0x4c7455eb3f73f761A2394699EA156196D8a0449D"],
      contractPath: "contracts/SimplePriceOracle.sol:SimplePriceOracle"
    },
    {
      name: "SimpleFeeManager",
      address: "0x46358DA741d3456dBAEb02995979B2722C3b8722",
      constructorArgs: ["0x4c7455eb3f73f761A2394699EA156196D8a0449D", "0x4c7455eb3f73f761A2394699EA156196D8a0449D"],
      contractPath: "contracts/SimpleFeeManager.sol:SimpleFeeManager"
    },
    {
      name: "SimpleBatchPayment",
      address: "0x9E1e03b06FB36364b3A6cbb6AbEC4f6f2B9C8DdC",
      constructorArgs: ["0x0859D42FD008D617c087DD386667da51570B1aAB", "0x4c7455eb3f73f761A2394699EA156196D8a0449D"],
      contractPath: "contracts/SimpleBatchPayment.sol:SimpleBatchPayment"
    },
    {
      name: "SimplePaymaster",
      address: "0x7d9687c95831874926bbc9476844674D6B943464",
      constructorArgs: ["0x0859D42FD008D617c087DD386667da51570B1aAB"],
      contractPath: "contracts/SimplePaymaster.sol:SimplePaymaster"
    },
    {
      name: "SimpleSmartWalletFactory",
      address: "0x10dE41927cdD093dA160E562630e0efC19423869",
      constructorArgs: ["0x4c7455eb3f73f761A2394699EA156196D8a0449D"],
      contractPath: "contracts/SimpleSmartWalletFactory.sol:SimpleSmartWalletFactory"
    }
  ];

  // Verify each contract
  for (const contract of contracts) {
    try {
      console.log(`Verifying ${contract.name} at ${contract.address}...`);
      
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArgs,
        contract: contract.contractPath
      });
      
      console.log(`✅ ${contract.name} verification successful!`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contract.name} is already verified.`);
      } else {
        console.error(`❌ ${contract.name} verification failed:`, error.message);
      }
    }
    
    // Add a small delay between verifications to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log("Verification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in verification script:", error);
    process.exit(1);
  });
