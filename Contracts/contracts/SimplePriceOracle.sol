// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SimplePriceOracle
 * @notice Simplified price oracle for NEDA Pay platform
 * @dev This contract provides price data for various asset pairs
 */
contract SimplePriceOracle is AccessControl {
    bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");
    bytes32 public constant PRICE_FEEDER_ROLE = keccak256("PRICE_FEEDER_ROLE");

    // Price data structure
    struct PriceData {
        uint256 price;      // Price with 8 decimals (e.g., 100000000 = 1.00)
        uint256 timestamp;  // Last update timestamp
        bool active;        // Whether this price feed is active
    }

    // Asset pairs
    mapping(bytes32 => PriceData) public priceFeeds;
    
    // Heartbeat - maximum time between updates
    uint256 public heartbeat = 1 hours;

    // Events
    event PriceUpdated(bytes32 indexed pair, uint256 price, uint256 timestamp);
    event HeartbeatUpdated(uint256 oldHeartbeat, uint256 newHeartbeat);

    /**
     * @dev Constructor initializes the contract with basic roles
     * @param _admin The address that will have the admin role
     */
    constructor(address _admin) {
        require(_admin != address(0), "Admin address cannot be zero");

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ORACLE_ADMIN_ROLE, _admin);
        _grantRole(PRICE_FEEDER_ROLE, _admin);

        // Set admin role as the admin for all other roles
        _setRoleAdmin(ORACLE_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PRICE_FEEDER_ROLE, ORACLE_ADMIN_ROLE);
    }

    /**
     * @dev Update price data for an asset pair
     * @param _pair The asset pair (e.g., "TZS/USD")
     * @param _price The new price (with 8 decimals)
     */
    function updatePrice(bytes32 _pair, uint256 _price) 
        external 
        onlyRole(PRICE_FEEDER_ROLE) 
    {
        require(_price > 0, "Price must be greater than zero");

        priceFeeds[_pair] = PriceData({
            price: _price,
            timestamp: block.timestamp,
            active: true
        });

        emit PriceUpdated(_pair, _price, block.timestamp);
    }

    /**
     * @dev Get the latest price for an asset pair
     * @param _pair The asset pair
     * @return price The latest price (with 8 decimals)
     * @return timestamp The timestamp of the latest update
     */
    function getLatestPrice(bytes32 _pair) 
        external 
        view 
        returns (uint256 price, uint256 timestamp) 
    {
        PriceData memory data = priceFeeds[_pair];
        require(data.active, "No active price feed for this pair");
        require(block.timestamp - data.timestamp <= heartbeat, "Price data too old");
        
        return (data.price, data.timestamp);
    }

    /**
     * @dev Update the heartbeat (maximum time between updates)
     * @param _newHeartbeat New heartbeat in seconds
     */
    function updateHeartbeat(uint256 _newHeartbeat) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(_newHeartbeat > 0, "Heartbeat must be greater than zero");
        
        uint256 oldHeartbeat = heartbeat;
        heartbeat = _newHeartbeat;
        
        emit HeartbeatUpdated(oldHeartbeat, _newHeartbeat);
    }

    /**
     * @dev Deactivate a price feed
     * @param _pair The asset pair to deactivate
     */
    function deactivatePriceFeed(bytes32 _pair) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(priceFeeds[_pair].active, "Price feed not active");
        
        priceFeeds[_pair].active = false;
    }

    /**
     * @dev Activate a price feed
     * @param _pair The asset pair to activate
     */
    function activatePriceFeed(bytes32 _pair) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(!priceFeeds[_pair].active, "Price feed already active");
        require(priceFeeds[_pair].price > 0, "Price feed not initialized");
        
        priceFeeds[_pair].active = true;
    }
}
