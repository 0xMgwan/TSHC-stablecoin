// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SimpleBatchPayment
 * @notice Enables efficient batch payments for the NEDA Pay platform
 * @dev This contract allows users to send TSHC to multiple recipients in a single transaction
 */
contract SimpleBatchPayment is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant BATCH_ADMIN_ROLE = keccak256("BATCH_ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // TSHC token contract
    IERC20 public tshc;
    
    // Pause state
    bool public paused;
    
    // Batch payment data
    struct BatchPaymentData {
        address sender;
        address[] recipients;
        uint256[] amounts;
        string paymentReference;
        uint256 timestamp;
        bool processed;
        uint256 totalAmount;
        uint256 totalFee;
    }

    // Batch payment storage
    uint256 public batchCount;
    mapping(uint256 => BatchPaymentData) public batchPayments;

    // Limits
    uint256 public maxRecipientsPerBatch = 100;
    uint256 public minAmountPerRecipient = 1 * 10**18; // 1 TSHC

    // Events
    event BatchPaymentCreated(uint256 indexed batchId, address indexed sender, uint256 totalAmount, uint256 totalFee, string paymentReference);
    event BatchPaymentProcessed(uint256 indexed batchId);
    event MaxRecipientsUpdated(uint256 oldMax, uint256 newMax);
    event MinAmountUpdated(uint256 oldMin, uint256 newMin);
    event Paused(address account);
    event Unpaused(address account);

    /**
     * @dev Modifier to make a function callable only when the contract is not paused
     */
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused
     */
    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    /**
     * @dev Constructor initializes the contract with basic roles
     * @param _admin The address that will have the admin role
     * @param _tshc The TSHC token contract address
     */
    constructor(address _admin, address _tshc) {
        require(_admin != address(0), "Admin address cannot be zero");
        require(_tshc != address(0), "TSHC address cannot be zero");
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(BATCH_ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
        
        // Set admin role as the admin for all other roles
        _setRoleAdmin(BATCH_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, BATCH_ADMIN_ROLE);
        
        tshc = IERC20(_tshc);
    }

    /**
     * @dev Create a new batch payment
     * @param _recipients Array of recipient addresses
     * @param _amounts Array of amounts to send to each recipient
     * @param _paymentReference Reference information for the batch payment
     * @return batchId The ID of the created batch payment
     */
    function createBatchPayment(
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        string calldata _paymentReference
    ) 
        external 
        whenNotPaused 
        returns (uint256 batchId) 
    {
        require(_recipients.length > 0, "No recipients provided");
        require(_recipients.length == _amounts.length, "Recipients and amounts length mismatch");
        require(_recipients.length <= maxRecipientsPerBatch, "Too many recipients");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid recipient address");
            require(_amounts[i] >= minAmountPerRecipient, "Amount below minimum");
            
            totalAmount += _amounts[i];
        }
        
        require(totalAmount > 0, "Total amount must be greater than zero");
        
        // Calculate fee (0 for simplicity in this version)
        uint256 totalFee = 0;
        
        // Create batch payment
        batchId = batchCount++;
        batchPayments[batchId] = BatchPaymentData({
            sender: msg.sender,
            recipients: _recipients,
            amounts: _amounts,
            paymentReference: _paymentReference,
            timestamp: block.timestamp,
            processed: false,
            totalAmount: totalAmount,
            totalFee: totalFee
        });
        
        // Transfer total amount plus fee from sender to this contract
        tshc.safeTransferFrom(msg.sender, address(this), totalAmount + totalFee);
        
        emit BatchPaymentCreated(batchId, msg.sender, totalAmount, totalFee, _paymentReference);
        
        return batchId;
    }
    
    /**
     * @dev Process a batch payment
     * @param _batchId The ID of the batch payment to process
     */
    function processBatchPayment(uint256 _batchId) 
        external 
        whenNotPaused
        onlyRole(OPERATOR_ROLE) 
    {
        BatchPaymentData storage batch = batchPayments[_batchId];
        
        require(!batch.processed, "Batch already processed");
        require(
            batch.sender != address(0), 
            "Batch does not exist"
        );
        
        batch.processed = true;
        
        // Process payments
        for (uint256 i = 0; i < batch.recipients.length; i++) {
            tshc.safeTransfer(batch.recipients[i], batch.amounts[i]);
        }
        
        emit BatchPaymentProcessed(_batchId);
    }
    
    /**
     * @dev Get batch payment details
     * @param _batchId The ID of the batch payment
     * @return sender The address of the sender
     * @return recipients Array of recipient addresses
     * @return amounts Array of amounts sent to each recipient
     * @return paymentReference Reference information for the batch payment
     * @return timestamp Timestamp when the batch payment was created
     * @return processed Whether the batch payment has been processed
     * @return totalAmount Total amount of the batch payment
     * @return totalFee Total fee for the batch payment
     */
    function getBatchPayment(uint256 _batchId) 
        external 
        view 
        returns (
            address sender,
            address[] memory recipients,
            uint256[] memory amounts,
            string memory paymentReference,
            uint256 timestamp,
            bool processed,
            uint256 totalAmount,
            uint256 totalFee
        ) 
    {
        BatchPaymentData storage batch = batchPayments[_batchId];
        
        return (
            batch.sender,
            batch.recipients,
            batch.amounts,
            batch.paymentReference,
            batch.timestamp,
            batch.processed,
            batch.totalAmount,
            batch.totalFee
        );
    }
    
    /**
     * @dev Update the maximum recipients per batch
     * @param _newMax The new maximum number of recipients
     */
    function updateMaxRecipientsPerBatch(uint256 _newMax) 
        external 
        onlyRole(BATCH_ADMIN_ROLE) 
    {
        require(_newMax > 0, "Max recipients must be greater than zero");
        
        uint256 oldMax = maxRecipientsPerBatch;
        maxRecipientsPerBatch = _newMax;
        
        emit MaxRecipientsUpdated(oldMax, _newMax);
    }
    
    /**
     * @dev Update the minimum amount per recipient
     * @param _newMin The new minimum amount
     */
    function updateMinAmountPerRecipient(uint256 _newMin) 
        external 
        onlyRole(BATCH_ADMIN_ROLE) 
    {
        uint256 oldMin = minAmountPerRecipient;
        minAmountPerRecipient = _newMin;
        
        emit MinAmountUpdated(oldMin, _newMin);
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() 
        external 
        onlyRole(BATCH_ADMIN_ROLE) 
        whenNotPaused
    {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() 
        external 
        onlyRole(BATCH_ADMIN_ROLE) 
        whenPaused
    {
        paused = false;
        emit Unpaused(msg.sender);
    }
}
