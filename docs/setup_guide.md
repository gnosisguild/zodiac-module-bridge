# AMB Setup Guide

This guide shows how to setup the AMB (Arbitrary Message Bridge) module with a Gnosis Safe on the Rinkeby testnetwork and an owner address on the xDai network.

## Prerequisites

To start the process you need to create a Safe on the Rinkeby test network (e.g. via https://rinkeby.gnosis-safe.io).

For the hardhat tasks to work the environment needs to be properly configured. See the [sample env file](../.env.sample) for more information.

The guide will use the Rinkeby AMB contract at [`0xD4075FB57fCf038bFc702c915Ef9592534bED5c1`](https://rinkeby.etherscan.io/address/0xD4075FB57fCf038bFc702c915Ef9592534bED5c1#code). The corresponding AMB contract on xDai can be found at [`0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A`](https://blockscout.com/poa/xdai/address/0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A/contracts).

DISCLAIMER: Check the deployed AMB contracts before using them.

## Deploying the module

The module has six attributes which are:
- Owner: address that can call setter functions
- Avatar: address of the DAO (e.g Safe)
- Target: address that the module will call `execModuleTransaction()` on.
- AMB: address of the AMB contract
- Controller: address of the controller on the other chain
- Chain ID: ID of the other chain

Hardhat tasks can be used to deploy an AMB instance. There are two different ways to deploy the module, the first one is through a normal deployment and passing arguments to the constructor (without the `proxied` flag), or, deploy the Module through a [Minimal Proxy Factory](https://eips.ethereum.org/EIPS/eip-1167) and save on gas costs (with the `proxied` flag) -  The master copy and factory address can be found in the [zodiac repository](https://github.com/gnosis/zodiac/blob/master/src/factory/constants.ts) and these are the addresses that are going to be used when deploying the module through factory.

These setup tasks requires the following parameters:

- `owner` (the address of the owner)
- `avatar` (the address of the avatar)
- `target` (the address of the target)
- `amb` (the address of the AMB contract)
- `controller` (the address of the controller on the other side of the AMB)
- `chainId` (the chain ID on the other side of the AMB)

An example for this on Rinkeby would be:
`yarn hardhat --network rinkeby setup --owner <owner_address> --avatar <avatar_address> --target <target_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --controller <xDai controller address> --chainid 100`

or

`yarn hardhat --network rinkeby setup --owner <owner_address> --avatar <avatar_address> --target <target_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --controller <xDai controller address> --chainid 100 --proxied true`

This should return the address of the deployed AMB Module. For this guide we assume this to be `0x4242424242424242424242424242424242424242`

Once the module is deployed you should verify the source code (Note: If you used the factory deployment the contract should be already verified). If you use a network that is Etherscan compatible and you configure the `ETHERSCAN_API_KEY` in your environment you can use the provided hardhat task to do this.

An example for this on Rinkeby would be:
`yarn hardhat --network rinkeby verifyEtherscan --module 0x4242424242424242424242424242424242424242 --owner <owner_address> --avatar <avatar_address> --target <target_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --controller <xDai controller address> --chainid 0x0000000000000000000000000000000000000000000000000000000000000064`

## Enabling the module

To allow the AMB Module to actually execute transaction it is required to enable it on the Safe that it is connected to. For this it is possible to use the Transaction Builder on https://rinkeby.gnosis-safe.io. For this you can follow our tutorial on [adding a module](https://help.gnosis-safe.io/en/articles/4934427-add-a-module).

## Executing a transactions

To execute a transaction, call the `requireToPassMessage(address _contract, bytes _data, uint256 _gas)` function on the AMB contract deployed to xDai at [`0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A`](https://blockscout.com/poa/xdai/address/0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A/contracts) from the `controller` address set in your AMB module.

## Deploy a master copy

The master copy contracts can be deployed through `yarn deploy` command. Note that this only should be done if the AMBModule contract gets an update and the ones referred on the (zodiac repository)[https://github.com/gnosis/zodiac/blob/master/src/factory/constants.ts] should be used.
