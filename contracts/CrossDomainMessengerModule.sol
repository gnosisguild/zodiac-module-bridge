// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;

import "@gnosis.pm/zodiac/contracts/core/Module.sol";

interface ICrossDomainMessenger {
  function xDomainMessageSender() external view returns (address);
}

contract CrossDomainMessengerModule is Module {
  event CrossDomainMessengerModuleSetup(
    address indexed initiator,
    address indexed owner,
    address indexed avatar,
    address target
  );

  ICrossDomainMessenger public crossDomainMessenger;
  address public controller;

  /// @param _owner Address of the  owner
  /// @param _avatar Address of the avatar (e.g. a Safe)
  /// @param _target Address of the contract that will call exec function
  /// @param _crossDomainMessenger Address of the CrossDomainMessenger contract
  /// @param _controller Address of the authorized controller contract on the other side of the bridge
  constructor(
    address _owner,
    address _avatar,
    address _target,
    ICrossDomainMessenger _crossDomainMessenger,
    address _controller
  ) {
    bytes memory initParams = abi.encode(
      _owner,
      _avatar,
      _target,
      _crossDomainMessenger,
      _controller
    );
    setUp(initParams);
  }

  function setUp(bytes memory initParams) public override {
    (
      address _owner,
      address _avatar,
      address _target,
      ICrossDomainMessenger _crossDomainMessenger,
      address _controller
    ) = abi.decode(
        initParams,
        (address, address, address, ICrossDomainMessenger, address)
      );
    __Ownable_init();

    require(_avatar != address(0), "Avatar can not be zero address");
    require(_target != address(0), "Target can not be zero address");
    avatar = _avatar;
    target = _target;
    crossDomainMessenger = _crossDomainMessenger;
    controller = _controller;

    transferOwnership(_owner);

    emit CrossDomainMessengerModuleSetup(msg.sender, _owner, _avatar, _target);
  }

  /// @dev Check that the crossDomainMessenger, and owner are valid
  modifier onlyValid() {
    require(
      msg.sender == address(crossDomainMessenger),
      "Unauthorized crossDomainMessenger"
    );
    require(
      crossDomainMessenger.xDomainMessageSender() == controller,
      "Unauthorized controller"
    );
    _;
  }

  /// @dev Set the CrossDomainMessenger contract address
  /// @param _crossDomainMessenger Address of the CrossDomainMessenger contract
  /// @notice This can only be called by the owner
  function setCrossDomainMessenger(address _crossDomainMessenger)
    public
    onlyOwner
  {
    require(
      address(crossDomainMessenger) != _crossDomainMessenger,
      "CrossDomainMessenger address already set to this"
    );
    crossDomainMessenger = ICrossDomainMessenger(_crossDomainMessenger);
  }

  /// @dev Set the controller address
  /// @param _controller Set the address of controller on the other side of the bridge
  /// @notice This can only be called by the owner
  function setController(address _controller) public onlyOwner {
    require(controller != _controller, "controller already set to this");
    controller = _controller;
  }

  /// @dev Executes a transaction initated by the CrossDomainMessenger
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
