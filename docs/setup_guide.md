# SafeBridge Setup Guide

This guide shows how to setup the SafeBridge module with a Gnosis Safe on the Rinkeby testnetwork and an owner address on the xDai network.

## Prerequisites

To start the process you need to create a Safe on the Rinkeby test network (e.g. via https://rinkeby.gnosis-safe.io).

For the hardhat tasks to work the environment needs to be properly configured. See the [sample env file](../.env.sample) for more information.

The guide will use the Rinkeby AMB contract at [`0xD4075FB57fCf038bFc702c915Ef9592534bED5c1`](https://rinkeby.etherscan.io/address/0xD4075FB57fCf038bFc702c915Ef9592534bED5c1#code). The corresponding AMB contract on xDai can be found at [`0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A`](https://blockscout.com/poa/xdai/address/0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A/contracts).

DISCLAIMER: Check the deployed AMB contracts before using them.

## Setting up the module

The first step is to deploy the module. Every Safe will have their own module. The module is linked to a Safe (called executor in the contract) and an AMB contract. The Safe cannot be changed after deployment.

### Deploying the module



A hardhat task can be used to deploy a DAO module instance. This setup task requires the following parameters:
- `dao` (the address of the Safe)
- `amb` (the address of the AMB contract)
- `owner` (the address of the owner on the other side of the AMB)
- `chainId` (the chain ID on the other side of the AMB)

An example for this on Rinkeby would be:
`yarn hardhat --network rinkeby setup --dao <safe_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --owner <xDai owner address> --chainid 0x0000000000000000000000000000000000000000000000000000000000000064`

This should return the address of the deployed SafeBridge module. For this guide we assume this to be `0x4242424242424242424242424242424242424242`

Once the module is deployed you should verify the source code. If you use a network that is Etherscan compatible and you configure the `ETHERSCAN_API_KEY` in your environment you can use the provided hardhat task to do this.

An example for this on Rinkeby would be:
`yarn hardhat --network rinkeby verifyEtherscan --module 0x4242424242424242424242424242424242424242 --dao <safe_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --owner <xDai owner address> --chainid 0x0000000000000000000000000000000000000000000000000000000000000064`

### Enabling the module

To allow the SafeBridge module to actually execute transaction it is required to enable it on the Safe that it is connected to. For this it is possible to use the Transaction Builder on https://rinkeby.gnosis-safe.io. For this you can follow our tutorial on [adding a module](https://help.gnosis-safe.io/en/articles/4934427-add-a-module).

### Executing a transactions

To execute a transaction, call the `requireToPassMessage(address _contract, bytes _data, uint256 _gas)` function on the AMB contract deployed to xDai at [`0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A`](https://blockscout.com/poa/xdai/address/0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A/contracts) from the `owner` address set in your AMB module.
