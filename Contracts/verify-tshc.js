const hre = require("hardhat");

async function main() {
  console.log("Attempting to verify SimpleTSHC contract with updated API key format...");
  
  try {
    // The contract address and constructor arguments
    const contractAddress = "0x0859D42FD008D617c087DD386667da51570B1aAB";
    const constructorArgs = ["0x4c7455eb3f73f761A2394699EA156196D8a0449D"];
    
    // Override the API key directly in the verification call
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/SimpleTSHC.sol:SimpleTSHC"
    });
    
    console.log("Verification successful!");
  } catch (error) {
    console.error("Verification failed:", error.message);
    
    // If we get an API key error, provide more guidance
    if (error.message.includes("Invalid API Key")) {
      console.log("\nAPI Key Issue Troubleshooting:");
      console.log("1. Base Sepolia uses a different API key system than Etherscan");
      console.log("2. Make sure you're using a BaseScan-specific API key");
      console.log("3. The API key format might need to be different");
      console.log("4. Consider using the BaseScan UI verification as an alternative");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in verification script:", error);
    process.exit(1);
  });
