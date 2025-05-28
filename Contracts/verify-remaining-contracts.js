const hre = require("hardhat");

async function main() {
  console.log("Verifying remaining contracts on BaseScan...");
  
  // List of remaining contracts with corrected constructor arguments
  const contracts = [
    {
      name: "SimpleBatchPayment",
      address: "0x9E1e03b06FB36364b3A6cbb6AbEC4f6f2B9C8DdC",
      constructorArgs: ["0x4c7455eb3f73f761A2394699EA156196D8a0449D", "0x0859D42FD008D617c087DD386667da51570B1aAB"],
      contractPath: "contracts/SimpleBatchPayment.sol:SimpleBatchPayment"
    },
    {
      name: "SimpleSmartWalletFactory",
      address: "0x10dE41927cdD093dA160E562630e0efC19423869",
      constructorArgs: ["0x7d9687c95831874926bbc9476844674D6B943464"],
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
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log("Verification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in verification script:", error);
    process.exit(1);
  });
