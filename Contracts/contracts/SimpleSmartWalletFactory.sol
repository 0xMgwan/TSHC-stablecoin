// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SimpleSmartWallet.sol";

/**
 * @title SimpleSmartWalletFactory
 * @notice Factory contract for creating SimpleSmartWallet instances
 * @dev This contract allows users to create their own smart wallets for account abstraction
 */
contract SimpleSmartWalletFactory is Ownable {
    // The paymaster contract
    address public paymaster;
    
    // Mapping from owner to smart wallet
    mapping(address => address) public wallets;
    
    // Events
    event WalletCreated(address indexed owner, address indexed wallet);
    event PaymasterUpdated(address indexed oldPaymaster, address indexed newPaymaster);
    
    /**
     * @dev Constructor initializes the contract
     * @param _paymaster The paymaster contract address
     */
    constructor(address _paymaster) Ownable(msg.sender) {
        require(_paymaster != address(0), "Paymaster address cannot be zero");
        paymaster = _paymaster;
    }
    
    /**
     * @dev Create a new smart wallet for a user
     * @param _owner The owner of the smart wallet
     * @return wallet The address of the created smart wallet
     */
    function createWallet(address _owner) external returns (address wallet) {
        require(_owner != address(0), "Owner address cannot be zero");
        require(wallets[_owner] == address(0), "Wallet already exists for this owner");
        
        // Create new smart wallet
        SimpleSmartWallet newWallet = new SimpleSmartWallet(_owner, paymaster);
        wallet = address(newWallet);
        
        // Register wallet
        wallets[_owner] = wallet;
        
        emit WalletCreated(_owner, wallet);
        
        return wallet;
    }
    
    /**
     * @dev Get the smart wallet for a user
     * @param _owner The owner of the smart wallet
     * @return The address of the smart wallet
     */
    function getWallet(address _owner) external view returns (address) {
        return wallets[_owner];
    }
    
    /**
     * @dev Check if a user has a smart wallet
     * @param _owner The owner to check
     * @return Whether the owner has a smart wallet
     */
    function hasWallet(address _owner) external view returns (bool) {
        return wallets[_owner] != address(0);
    }
    
    /**
     * @dev Update the paymaster contract
     * @param _newPaymaster The new paymaster contract address
     */
    function updatePaymaster(address _newPaymaster) external onlyOwner {
        require(_newPaymaster != address(0), "Paymaster address cannot be zero");
        
        address oldPaymaster = paymaster;
        paymaster = _newPaymaster;
        
        emit PaymasterUpdated(oldPaymaster, _newPaymaster);
    }
}
