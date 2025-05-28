// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimplePaymaster
 * @notice A simplified paymaster for NEDA Pay that enables gasless transactions
 * @dev This contract allows users to pay gas fees in TSHC instead of ETH
 */
contract SimplePaymaster is Ownable {
    // The TSHC token used for gas payments
    IERC20 public tshc;
    
    // Fee configuration
    uint256 public gasPrice = 1 gwei;
    uint256 public exchangeRate = 100; // 1 ETH = 100 TSHC
    
    // Deposit tracking
    mapping(address => uint256) public deposits;
    
    // Events
    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event GasPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event TransactionSponsored(address indexed user, uint256 tshcAmount, uint256 gasUsed);
    
    /**
     * @dev Constructor initializes the contract
     * @param _tshc The TSHC token contract address
     */
    constructor(address _tshc) Ownable(msg.sender) {
        require(_tshc != address(0), "TSHC address cannot be zero");
        tshc = IERC20(_tshc);
    }
    
    /**
     * @dev Deposit TSHC tokens to cover gas fees
     * @param _amount The amount of TSHC to deposit
     */
    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        
        // Transfer TSHC from user to this contract
        require(tshc.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Update deposit balance
        deposits[msg.sender] += _amount;
        
        emit Deposited(msg.sender, _amount);
    }
    
    /**
     * @dev Withdraw TSHC tokens
     * @param _amount The amount of TSHC to withdraw
     */
    function withdraw(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        require(deposits[msg.sender] >= _amount, "Insufficient balance");
        
        // Update deposit balance
        deposits[msg.sender] -= _amount;
        
        // Transfer TSHC from this contract to user
        require(tshc.transfer(msg.sender, _amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, _amount);
    }
    
    /**
     * @dev Sponsor a transaction for a user
     * @param _user The user to sponsor
     * @param _gasUsed The amount of gas used
     */
    function sponsorTransaction(address _user, uint256 _gasUsed) external onlyOwner {
        uint256 ethCost = _gasUsed * gasPrice;
        uint256 tshcCost = (ethCost * exchangeRate) / 1 ether;
        
        require(deposits[_user] >= tshcCost, "Insufficient TSHC balance");
        
        // Deduct TSHC from user's deposit
        deposits[_user] -= tshcCost;
        
        emit TransactionSponsored(_user, tshcCost, _gasUsed);
    }
    
    /**
     * @dev Update the gas price
     * @param _newGasPrice The new gas price in wei
     */
    function updateGasPrice(uint256 _newGasPrice) external onlyOwner {
        require(_newGasPrice > 0, "Gas price must be greater than zero");
        
        uint256 oldGasPrice = gasPrice;
        gasPrice = _newGasPrice;
        
        emit GasPriceUpdated(oldGasPrice, _newGasPrice);
    }
    
    /**
     * @dev Update the exchange rate
     * @param _newExchangeRate The new exchange rate (1 ETH = X TSHC)
     */
    function updateExchangeRate(uint256 _newExchangeRate) external onlyOwner {
        require(_newExchangeRate > 0, "Exchange rate must be greater than zero");
        
        uint256 oldExchangeRate = exchangeRate;
        exchangeRate = _newExchangeRate;
        
        emit ExchangeRateUpdated(oldExchangeRate, _newExchangeRate);
    }
    
    /**
     * @dev Calculate the TSHC cost for a given gas amount
     * @param _gasAmount The amount of gas
     * @return The cost in TSHC tokens
     */
    function calculateTSHCCost(uint256 _gasAmount) external view returns (uint256) {
        uint256 ethCost = _gasAmount * gasPrice;
        return (ethCost * exchangeRate) / 1 ether;
    }
    
    /**
     * @dev Get the TSHC balance of this contract
     * @return The TSHC balance
     */
    function getTSHCBalance() external view returns (uint256) {
        return tshc.balanceOf(address(this));
    }
}
