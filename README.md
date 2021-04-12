# SafeBridge Module
[![Build Status](https://github.com/gnosis/amb-module/workflows/amb-module/badge.svg?branch=safebridge)](https://github.com/gnosis/amb-module/actions)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/amb-module/badge.svg?branch=safebridge)](https://coveralls.io/github/gnosis/amb-module?branch=safebridge)

This module allows for execution of transactions initiated by a designated address on the other side of a designated arbitrary message bridge (AMB).

This module is intended to be used with the [Gnosis Safe](https://github.com/gnosis/safe-contracts).

### Features
- Execute transactions initiated by an approved address on an approved chainId via an approved AMB.

### Flow
- On chain (a), deploy a Gnosis Safe and SafeBridge Module. Enable Safe Bridge Module on the Safe.
- On chain (b), call `requireToPassMessage()` on the bridge contract.
- On chain (a), call `executeSignatures()` on the bridge contract.

### Solidity Compiler

The contracts have been developed with [Solidity 0.8.0](https://github.com/ethereum/solidity/releases/tag/v0.8.0) in mind. This version of Solidity made all arithmetic checked by default, therefore eliminating the need for explicit overflow or underflow (or other arithmetic) checks.

### Setup Guide

Follow our [Setup Guide](./docs/setup_guide.md) to setup a SafeBridge module.
