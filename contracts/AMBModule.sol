// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;

import "@gnosis/zodiac/contracts/core/Module.sol";

interface IAMB {
    function messageSender() external view returns (address);

    function messageId() external view returns (bytes32);

    function messageSourceChainId() external view returns (bytes32);

    function requireToPassMessage(
        address _contract,
        bytes memory _data,
        uint256 _gas
    ) external returns (bytes32);
}

contract AMBModule is Module {
    event AmbModuleSetup(address indexed initiator, address indexed safe);

    IAMB public amb;
    address public controller;
    bytes32 public chainId;

    constructor(
        address _owner,
        address _executor,
        IAMB _amb,
        address _controller,
        bytes32 _chainId
    ) {
        setUp(_owner, _executor, _amb, _controller, _chainId);
    }

    /// @param _owner Address of the  owner
    /// @param _executor Address of the executor (e.g. a Safe)
    /// @param _amb Address of the AMB contract
    /// @param _controller Address of the authorized controller contract on the other side of the bridge
    /// @param _chainId Address of the authorized chainId from which owner can initiate transactions
    function setUp(
        address _owner,
        address _executor,
        IAMB _amb,
        address _controller,
        bytes32 _chainId
    ) public {
        require(
            address(executor) == address(0),
            "Module is already initialized"
        );
        executor = _executor;
        amb = _amb;
        controller = _controller;
        chainId = _chainId;

        if (_executor != address(0)) {
            __Ownable_init();
            transferOwnership(_owner);
        }

        emit AmbModuleSetup(msg.sender, address(_executor));
    }

    /// @dev Check that the amb, chainId, and owner are valid
    modifier onlyValid() {
        require(msg.sender == address(amb), "Unauthorized amb");
        require(amb.messageSourceChainId() == chainId, "Unauthorized chainId");
        require(amb.messageSender() == controller, "Unauthorized controller");
        _;
    }

    /// @dev Set the AMB contract address
    /// @param _amb Address of the AMB contract
    /// @notice This can only be called by the executor
    function setAmb(address _amb) public onlyOwner {
        require(address(amb) != _amb, "AMB address already set to this");
        amb = IAMB(_amb);
    }

    /// @dev Set the approved chainId
    /// @param _chainId ID of the approved network
    /// @notice This can only be called by the executor
    function setChainId(bytes32 _chainId) public onlyOwner {
        require(chainId != _chainId, "chainId already set to this");
        chainId = _chainId;
    }

    /// @dev Set the controller address
    /// @param _controller Set the address of controller on the other side of the bridge
    /// @notice This can only be called by the executor
    function setController(address _controller) public onlyOwner {
        require(controller != _controller, "controller already set to this");
        controller = _controller;
    }

    /// @dev Executes a transaction initated by the AMB
    /// @param to Target of the transaction that should be executed
    /// @param value Wei value of the transaction that should be executed
    /// @param data Data of the transaction that should be executed
    /// @param operation Operation (Call or Delegatecall) of the transaction that should be executed
    function executeTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) public onlyValid {
        require(exec(to, value, data, operation), "Module transaction failed");
    }
}