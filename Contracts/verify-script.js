const hre = require("hardhat");

async function main() {
  console.log("Verifying SimpleTSHC contract...");
  
  try {
    // The contract address and constructor arguments
    const contractAddress = "0x0859D42FD008D617c087DD386667da51570B1aAB";
    const constructorArgs = ["0x4c7455eb3f73f761A2394699EA156196D8a0449D"];
    
    // Verify the contract
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/SimpleTSHC.sol:SimpleTSHC"
    });
    
    console.log("Verification successful!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
