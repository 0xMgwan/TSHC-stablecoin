// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TSHCForwarder
 * @notice A minimal meta-transaction forwarder for the TSHC token
 * @dev Implements ERC-2771 to enable gasless transactions
 */
contract TSHCForwarder is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Mapping of used nonces
    mapping(address => mapping(uint256 => bool)) private _usedNonces;
    
    // Events
    event MetaTransactionExecuted(address indexed from, address indexed to, bytes data, bool success);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Execute a meta-transaction
     * @param from The address that signed the meta-transaction
     * @param to The target contract address
     * @param data The function call data
     * @param nonce A unique nonce to prevent replay attacks
     * @param signature The signature of the meta-transaction
     * @return success Whether the execution was successful
     * @return returnData The return data from the function call
     */
    function execute(
        address from,
        address to,
        bytes memory data,
        uint256 nonce,
        bytes memory signature
    ) external returns (bool success, bytes memory returnData) {
        // Verify the signature
        require(!_usedNonces[from][nonce], "TSHCForwarder: nonce already used");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                from,
                to,
                data,
                nonce
            )
        );
        bytes32 digest = messageHash.toEthSignedMessageHash();
        address signer = digest.recover(signature);
        
        require(signer == from, "TSHCForwarder: invalid signature");
        
        // Mark nonce as used
        _usedNonces[from][nonce] = true;
        
        // Execute the transaction
        (success, returnData) = to.call(abi.encodePacked(data, from));
        
        emit MetaTransactionExecuted(from, to, data, success);
        
        return (success, returnData);
    }
    
    /**
     * @dev Check if a nonce has been used
     * @param from The address that signed the meta-transaction
     * @param nonce The nonce to check
     * @return bool Whether the nonce has been used
     */
    function isNonceUsed(address from, uint256 nonce) external view returns (bool) {
        return _usedNonces[from][nonce];
    }
}
