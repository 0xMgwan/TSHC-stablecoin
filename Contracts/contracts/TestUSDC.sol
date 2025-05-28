// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestUSDC
 * @notice A test USDC token for testing the NEDA Pay platform
 */
contract TestUSDC is ERC20, Ownable {
    /**
     * @dev Constructor initializes the token with name and symbol
     * @param initialOwner The address that will have ownership
     */
    constructor(address initialOwner) 
        ERC20("Test USDC", "TUSDC") 
        Ownable(initialOwner) 
    {
        // Mint 1,000,000 tokens to the owner (with 6 decimals like real USDC)
        _mint(initialOwner, 1_000_000 * 10**6);
    }
    
    /**
     * @dev Mint tokens to a specified address
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
