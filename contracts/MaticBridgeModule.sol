// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;

import "@gnosis.pm/zodiac/contracts/core/Module.sol";


/***
 * @dev A receiver on the Polygon (or Mumbai) network of a message sent over the
 * "Fx-Portal" (a PoS bridge run by the Polygon team) must implement this interface
 * See https://docs.polygon.technology/docs/develop/l1-l2-communication/fx-portal
 */
interface IFxMessageProcessor {
    function processMessageFromRoot(
        uint256 stateId,
        address rootMessageSender,
        bytes calldata data
    ) external;
}

/***
 * @title PolyFxPortalModule
 * @notice A module for Gnosys Safe, compatible to Zodiac extension pack, that allows
 * an address on the mainnet (or Goerli) to control an avatar on Polygon (or Mumbai)
 * sending messages via the "Fx-Portal", a message bridge run by the Polygon team
 * @dev This contract is supposed to run on the Polygon (or Mumbai) chain and be enabled
 * as the "module" with the avatar (i.e. the Gnosys Safe on the Polygon/Mumbai).
 */
contract MaticBridgeModule is Module, IFxMessageProcessor {
    event MaticBridgeModuleSetup(
        address indexed initiator,
        address indexed owner,
        address indexed avatar,
        address target,
        address controller
    );

    /// @notice Address of the `FxChild` contract on the Polygon/Mumbai chain
    /// @dev `FxChild` is the contract of the "Fx-Portal" (PoS) Bridge on the Polygon/Mumbai side
    address public immutable fxChild;

    /// @notice Address on the mainnet/Goerli that is authorized to control the avatar
    /// @dev It sends messages calling the `FxRoot` contract on the mainnet/Goerli
    /// `FxRoot` is the contract of the "Fx-Portal" (PoS) Bridge on the mainnet/Goerli side
    address public controller;

    /// @notice Transaction nonce (i.e. sequential number of the next transaction)
    uint256 public nonce;

    /// @param _owner Address of the  owner
    /// @param _avatar Address of the avatar (e.g. a Safe)
    /// @param _target Address of the contract that will call exec function
    /// @param _controller Address of the controller contract on the mainnet/Goerli
    /// @param _fxChild Address of the `FxChild` (Bridge) contract on Polygon/Mumbai
    constructor(
        address _owner,
        address _avatar,
        address _target,
        address _controller,
        address _fxChild
    ) {
        require(_fxChild != address(0), "FX_CHILD_ZERO_ADDRESS");
        fxChild = _fxChild;

        _setUp(_owner, _avatar, _target, _controller);
    }

    function setUp(bytes memory initParams) public override {
        (
        address _owner,
        address _avatar,
        address _target,
        address _controller
        ) = abi.decode(initParams, (address, address, address, address));
        _setUp(_owner, _avatar, _target, _controller);
    }

    function _setUp(
        address _owner,
        address _avatar,
        address _target,
        address _controller
    ) internal {
        __Ownable_init();

        require(_avatar != address(0), "Avatar can not be zero address");
        require(_target != address(0), "Target can not be zero address");
        require(_controller != address(0), "Controller can not be zero address");
        avatar = _avatar;
        target = _target;
        controller = _controller;

        transferOwnership(_owner);

        emit MaticBridgeModuleSetup(msg.sender, _owner, _avatar, _target, _controller);
    }

    /// @dev Executes a transaction initated by the `FxChild` (Polygon PoS Bridge)
    /// @param rootMessageSender Address on the mainnet/Goerli that sent the message
    /// @param _data Data of the transaction that should be executed
    function processMessageFromRoot(
        uint256, // stateId (Polygon PoS Bridge state sync ID, unused)
        address rootMessageSender,
        bytes calldata _data
    ) external override {
        require(msg.sender == fxChild, "INVALID_CALLER");
        require(rootMessageSender == controller, "INVALID_SENDER");

        (
            // target of the transaction that should be executed
            address to,
            // Wei value of the transaction that should be executed
            uint256 value,
            // data of the transaction that should be executed
            bytes memory data,
            // Operation (Call or Delegatecall) of the transaction
            Enum.Operation operation,
            uint256 _nonce
        ) = abi.decode(_data, (address, uint256, bytes, Enum.Operation, uint256));

        // Protection against replay attacks/errors
        require(nonce++ == _nonce, "INVALID_NONCE");

        require(exec(to, value, data, operation), "Module transaction failed");
    }
}
