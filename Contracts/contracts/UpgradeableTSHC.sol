// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";

/**
 * @title UpgradeableTSHC - Enhanced Tanzania Shilling Stablecoin
 * @notice A stablecoin pegged 1:1 to the Tanzania Shilling (TSH) with advanced features:
 * - Blacklisting for regulatory compliance
 * - Pausability for emergency situations
 * - ERC-2771 meta-transactions for gasless transactions
 * - UUPS upgradability for future improvements
 */
contract UpgradeableTSHC is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ERC2771ContextUpgradeable(address(0)), // Pass a dummy address, will be set in initialize
    UUPSUpgradeable 
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // Mapping of blacklisted addresses
    mapping(address => bool) private _blacklisted;
    
    // Events
    event Blacklisted(address indexed account);
    event BlacklistRemoved(address indexed account);
    event TrustedForwarderChanged(address indexed oldForwarder, address indexed newForwarder);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initializes the contract with roles and settings
     * @param defaultAdmin The address that will have the DEFAULT_ADMIN_ROLE
     * @param trustedForwarder The address of the trusted forwarder for meta-transactions
     */
    function initialize(address defaultAdmin, address trustedForwarder) public initializer {
        __ERC20_init("Tanzania Shilling Stablecoin", "TSHC");
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        // Initialize the trusted forwarder
        _trustedForwarder = trustedForwarder;
        
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
        _grantRole(BLACKLISTER_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, defaultAdmin);
    }
    
    /**
     * @dev Returns the number of decimals used for token - override to use 2 decimals for TSH
     */
    function decimals() public view virtual override returns (uint8) {
        return 2; // TSH typically uses 2 decimal places
    }
    
    /**
     * @dev Mint tokens to a specified address
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(!isBlacklisted(to), "UpgradeableTSHC: recipient is blacklisted");
        _mint(to, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Add an address to the blacklist
     * @param account The address to blacklist
     */
    function blacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        require(!_blacklisted[account], "UpgradeableTSHC: account already blacklisted");
        _blacklisted[account] = true;
        emit Blacklisted(account);
    }
    
    /**
     * @dev Remove an address from the blacklist
     * @param account The address to remove from the blacklist
     */
    function removeFromBlacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        require(_blacklisted[account], "UpgradeableTSHC: account not blacklisted");
        _blacklisted[account] = false;
        emit BlacklistRemoved(account);
    }
    
    /**
     * @dev Check if an address is blacklisted
     * @param account The address to check
     * @return bool True if the address is blacklisted
     */
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }
    
    // Store the trusted forwarder address
    address private _trustedForwarder;
    
    /**
     * @dev Returns the address of the trusted forwarder
     */
    function getTrustedForwarder() public view returns (address) {
        return _trustedForwarder;
    }
    
    /**
     * @dev Sets the trusted forwarder address
     */
    function setTrustedForwarder(address newTrustedForwarder) public onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldForwarder = _trustedForwarder;
        _trustedForwarder = newTrustedForwarder;
        emit TrustedForwarderChanged(oldForwarder, newTrustedForwarder);
    }
    
    /**
     * @dev Override _msgSender to support meta-transactions
     */
    function _msgSender() internal view virtual override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address sender) {
        return ERC2771ContextUpgradeable._msgSender();
    }
    
    /**
     * @dev Override _msgData to support meta-transactions
     */
    function _msgData() internal view virtual override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (bytes calldata) {
        return ERC2771ContextUpgradeable._msgData();
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens
     * @param from The address tokens are transferred from
     * @param to The address tokens are transferred to
     * @param amount The amount of tokens being transferred
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        require(!isBlacklisted(from), "UpgradeableTSHC: sender is blacklisted");
        require(!isBlacklisted(to), "UpgradeableTSHC: recipient is blacklisted");
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
    
    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[50] private __gap;
}
