// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimpleFeeManager
 * @notice Manages fees for the NEDA Pay platform
 * @dev This contract handles fee collection and distribution
 */
contract SimpleFeeManager is AccessControl {
    bytes32 public constant FEE_ADMIN_ROLE = keccak256("FEE_ADMIN_ROLE");
    bytes32 public constant FEE_DISTRIBUTOR_ROLE = keccak256("FEE_DISTRIBUTOR_ROLE");
    
    // Fee configuration
    uint256 public transferFeeRate = 25; // 0.25% (in basis points, 10000 = 100%)
    uint256 public minTransferFee = 1 * 10**16; // 0.01 TSHC
    uint256 public maxTransferFee = 100 * 10**18; // 100 TSHC
    
    // Fee collection
    uint256 public collectedFees;
    address public feeCollector;
    
    // Pause state
    bool public paused;
    
    // Events
    event FeeCollected(address indexed from, uint256 amount);
    event FeeDistributed(address indexed to, uint256 amount);
    event FeeRateUpdated(uint256 oldRate, uint256 newRate);
    event MinFeeUpdated(uint256 oldMin, uint256 newMin);
    event MaxFeeUpdated(uint256 oldMax, uint256 newMax);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event Paused(address account);
    event Unpaused(address account);
    
    /**
     * @dev Constructor initializes the contract with basic roles
     * @param _admin The address that will have the admin role
     * @param _feeCollector The address that will collect fees
     */
    constructor(address _admin, address _feeCollector) {
        require(_admin != address(0), "Admin address cannot be zero");
        require(_feeCollector != address(0), "Fee collector address cannot be zero");
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(FEE_ADMIN_ROLE, _admin);
        _grantRole(FEE_DISTRIBUTOR_ROLE, _admin);
        
        // Set admin role as the admin for all other roles
        _setRoleAdmin(FEE_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(FEE_DISTRIBUTOR_ROLE, FEE_ADMIN_ROLE);
        
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Calculate the fee for a given amount
     * @param _amount The amount to calculate fee for
     * @return fee The calculated fee
     */
    function calculateFee(uint256 _amount) 
        public 
        view 
        returns (uint256 fee) 
    {
        fee = (_amount * transferFeeRate) / 10000;
        
        if (fee < minTransferFee) {
            fee = minTransferFee;
        } else if (fee > maxTransferFee) {
            fee = maxTransferFee;
        }
        
        // If the fee is greater than the amount, cap it at the amount
        if (fee > _amount) {
            fee = _amount;
        }
        
        return fee;
    }
    
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
     * @dev Collect fee from a transaction
     * @param _from The address to collect fee from
     * @param _amount The amount of fee to collect
     */
    function collectFee(address _from, uint256 _amount) 
        external 
        whenNotPaused 
    {
        require(_amount > 0, "Fee amount must be greater than zero");
        
        collectedFees += _amount;
        emit FeeCollected(_from, _amount);
    }
    
    /**
     * @dev Distribute collected fees to the fee collector
     * @param _token The token to distribute
     */
    function distributeFees(IERC20 _token) 
        external 
        onlyRole(FEE_DISTRIBUTOR_ROLE) 
    {
        uint256 amount = collectedFees;
        require(amount > 0, "No fees to distribute");
        
        collectedFees = 0;
        
        // Transfer fees to the fee collector
        require(_token.transfer(feeCollector, amount), "Fee distribution failed");
        
        emit FeeDistributed(feeCollector, amount);
    }
    
    /**
     * @dev Update the transfer fee rate
     * @param _newRate The new fee rate in basis points (10000 = 100%)
     */
    function updateTransferFeeRate(uint256 _newRate) 
        external 
        onlyRole(FEE_ADMIN_ROLE) 
    {
        require(_newRate <= 1000, "Fee rate cannot exceed 10%");
        
        uint256 oldRate = transferFeeRate;
        transferFeeRate = _newRate;
        
        emit FeeRateUpdated(oldRate, _newRate);
    }
    
    /**
     * @dev Update the minimum transfer fee
     * @param _newMin The new minimum fee
     */
    function updateMinTransferFee(uint256 _newMin) 
        external 
        onlyRole(FEE_ADMIN_ROLE) 
    {
        require(_newMin <= maxTransferFee, "Min fee cannot exceed max fee");
        
        uint256 oldMin = minTransferFee;
        minTransferFee = _newMin;
        
        emit MinFeeUpdated(oldMin, _newMin);
    }
    
    /**
     * @dev Update the maximum transfer fee
     * @param _newMax The new maximum fee
     */
    function updateMaxTransferFee(uint256 _newMax) 
        external 
        onlyRole(FEE_ADMIN_ROLE) 
    {
        require(_newMax >= minTransferFee, "Max fee cannot be less than min fee");
        
        uint256 oldMax = maxTransferFee;
        maxTransferFee = _newMax;
        
        emit MaxFeeUpdated(oldMax, _newMax);
    }
    
    /**
     * @dev Update the fee collector address
     * @param _newCollector The new fee collector address
     */
    function updateFeeCollector(address _newCollector) 
        external 
        onlyRole(FEE_ADMIN_ROLE) 
    {
        require(_newCollector != address(0), "Fee collector cannot be zero address");
        
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() 
        external 
        onlyRole(FEE_ADMIN_ROLE) 
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
        onlyRole(FEE_ADMIN_ROLE) 
        whenPaused
    {
        paused = false;
        emit Unpaused(msg.sender);
    }
}
