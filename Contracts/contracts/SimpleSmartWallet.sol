// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./SimplePaymaster.sol";

/**
 * @title SimpleSmartWallet
 * @notice A simplified smart wallet for NEDA Pay that enables account abstraction
 * @dev This contract allows users to execute transactions without ETH through a paymaster
 */
contract SimpleSmartWallet is Ownable {
    using ECDSA for bytes32;
    
    // The paymaster contract
    SimplePaymaster public paymaster;
    
    // Nonce for replay protection
    uint256 public nonce;
    
    // Events
    event TransactionExecuted(address indexed target, uint256 value, bytes data, uint256 nonce);
    event PaymasterUpdated(address indexed oldPaymaster, address indexed newPaymaster);
    
    /**
     * @dev Constructor initializes the contract
     * @param _owner The owner of this smart wallet
     * @param _paymaster The paymaster contract address
     */
    constructor(address _owner, address _paymaster) Ownable(_owner) {
        require(_paymaster != address(0), "Paymaster address cannot be zero");
        paymaster = SimplePaymaster(_paymaster);
    }
    
    /**
     * @dev Execute a transaction with a signature
     * @param _target The target contract to call
     * @param _value The ETH value to send (usually 0)
     * @param _data The calldata for the transaction
     * @param _signature The signature from the wallet owner
     */
    function executeTransaction(
        address _target,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _signature
    ) external returns (bytes memory) {
        // Verify signature
        bytes32 messageHash = getMessageHash(_target, _value, _data, nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        
        address signer = ethSignedMessageHash.recover(_signature);
        require(signer == owner(), "Invalid signature");
        
        // Increment nonce
        nonce++;
        
        // Execute transaction
        uint256 gasStart = gasleft();
        (bool success, bytes memory result) = _target.call{value: _value}(_data);
        require(success, "Transaction execution failed");
        
        // Calculate gas used and sponsor transaction
        uint256 gasUsed = gasStart - gasleft();
        paymaster.sponsorTransaction(owner(), gasUsed);
        
        emit TransactionExecuted(_target, _value, _data, nonce - 1);
        
        return result;
    }
    
    /**
     * @dev Update the paymaster contract
     * @param _newPaymaster The new paymaster contract address
     */
    function updatePaymaster(address _newPaymaster) external onlyOwner {
        require(_newPaymaster != address(0), "Paymaster address cannot be zero");
        
        address oldPaymaster = address(paymaster);
        paymaster = SimplePaymaster(_newPaymaster);
        
        emit PaymasterUpdated(oldPaymaster, _newPaymaster);
    }
    
    /**
     * @dev Get the message hash for signing
     * @param _target The target contract to call
     * @param _value The ETH value to send
     * @param _data The calldata for the transaction
     * @param _nonce The current nonce
     * @return The message hash
     */
    function getMessageHash(
        address _target,
        uint256 _value,
        bytes calldata _data,
        uint256 _nonce
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(
            address(this),
            _target,
            _value,
            keccak256(_data),
            _nonce,
            block.chainid
        ));
    }
    
    /**
     * @dev Get the Ethereum signed message hash
     * @param _messageHash The message hash
     * @return The Ethereum signed message hash
     */
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            _messageHash
        ));
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
