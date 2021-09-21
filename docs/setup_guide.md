# Zodiac Bridge Module Setup Guide

This guide shows how to setup the Bridge Module with a Gnosis Safe on the Rinkeby testnetwork and an owner address on the xDai network.

The Bridge Module belongs to the [Zodiac](https://github.com/gnosis/zodiac) collection of tools. If you have any questions about Zodiac, join the [Gnosis Guild Discord](https://discord.gg/wwmBWTgyEq). Follow [@GnosisGuild](https://twitter.com/gnosisguild) on Twitter for updates. 

## Prerequisites

To start the process, you need to create a Safe on the Rinkeby test etwork (e.g. via https://rinkeby.gnosis-safe.io).

For the hardhat tasks to work the environment needs to be properly configured. See the [sample env file](../.env.sample) for more information.

The guide will use the Rinkeby AMB contract at [`0xD4075FB57fCf038bFc702c915Ef9592534bED5c1`](https://rinkeby.etherscan.io/address/0xD4075FB57fCf038bFc702c915Ef9592534bED5c1#code). The corresponding AMB contract on xDai can be found at [`0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A`](https://blockscout.com/poa/xdai/address/0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A/contracts).

DISCLAIMER: Check the deployed AMB contracts before using them.

## Deploying the module

The module has six attributes which are:
- `Owner`: Address that can call setter functions
- `Avatar`: Address of the DAO (e.g Safe)
- `Target`: Address on which the module will call `execModuleTransaction()`
- `AMB`: Address of the AMB contract
- `Controller`: Address of the controller on the other chain
- `Chain ID`: ID of the other chain

Hardhat tasks can be used to deploy a Bridge Module instance. There are two different ways to deploy the module. The first one is through a normal deployment and passing arguments to the constructor (without the `proxied` flag), or to deploy the Module through a [Minimal Proxy Factory](https://eips.ethereum.org/EIPS/eip-1167) (with the `proxied` flag) to save on gas costs. 

The master copy and factory address can be found in the [Zodiac repository](https://github.com/gnosis/zodiac/blob/master/src/factory/constants.ts). These are the addresses used when deploying the module through the factory.


These setup tasks requires the following parameters (also mentioned above):

- `Owner`: Address that can call setter functions
- `Avatar`: Address of the DAO (e.g Safe)
- `Target`: Address on which the module will call `execModuleTransaction()`
- `AMB`: Address of the AMB contract
- `Controller`: Address of the controller on the other chain
- `Chain ID`: ID of the other chain

An example for this on Rinkeby would be:
`yarn hardhat --network rinkeby setup --owner <owner_address> --avatar <avatar_address> --target <target_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --controller <xDai controller address> --chainid 100`

or

`yarn hardhat --network rinkeby setup --owner <owner_address> --avatar <avatar_address> --target <target_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --controller <xDai controller address> --chainid 100 --proxied true`

This should return the address of the deployed Bridge Module. For this guide we assume this to be `0x4242424242424242424242424242424242424242`.

Once the module has been deployed, you should verify the source code. (Note: It is likely that Etherscan will verify it automatically, but just in case, you should verify it yourself.) If you use a network that is Etherscan compatible, and you configure the `ETHERSCAN_API_KEY` in your environment, you can use the provided hardhat task to do this.

An example for this on Rinkeby would be:
`yarn hardhat --network rinkeby verifyEtherscan --module 0x4242424242424242424242424242424242424242 --owner <owner_address> --avatar <avatar_address> --target <target_address> --amb  0xD4075FB57fCf038bFc702c915Ef9592534bED5c1 --controller <xDai controller address> --chainid 0x0000000000000000000000000000000000000000000000000000000000000064`

## Enabling the module

To allow the Bridge Module to actually execute transactions, you must enable it on the Gnosis Safe to which it is connected. For this, it is possible to use the Bundle Transactions tab on [https://rinkeby.gnosis-safe.io](https://rinkeby.gnosis-safe.io), which is accompanied by our tutorial on [adding a module](https://help.gnosis-safe.io/en/articles/4934427-add-a-module).


## Executing a transactions

To execute a transaction, call the `requireToPassMessage(address _contract, bytes _data, uint256 _gas)` function on the AMB contract deployed to xDai at [`0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A`](https://blockscout.com/poa/xdai/address/0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A/contracts) from the `Controller` address set in your Bridge Module.

## Deploy a master copy

The master copy contracts can be deployed through the `yarn deploy` command. Note that this only should be done if the Bridge Module contracts are updated. The ones referred to on the [Zodiac repository](https://github.com/gnosis/zodiac/blob/master/src/factory/constants.ts) should be used.