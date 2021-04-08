# SafeBridge Module
[![Build Status](https://github.com/gnosis/dao-module/workflows/amb-module/badge.svg?branch=main)](https://github.com/gnosis/amb-module/actions)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/amb-module/badge.svg?branch=main)](https://coveralls.io/github/gnosis/amb-module)

This module allows for execution of transactions initiated by a designated address on the other side of a designated arbitrary message bridge (AMB).

This module is intended to be used with the [Gnosis Safe](https://github.com/gnosis/safe-contracts).

### Features
- Execute transactions initiated by an approved address on an approved chainId via an approved AMB.

### Flow
- On chain (a), deploy a Gnosis Safe and SafeBridge Module. Enable Safe Bridge Module on the Safe.
- On chain (b), call `requireToPassMessage()`

### Solidity Compiler

The contracts have been developed with [Solidity 0.8.0](https://github.com/ethereum/solidity/releases/tag/v0.8.0) in mind. This version of Solidity made all arithmetic checked by default, therefore eliminating the need for explicit overflow or underflow (or other arithmetic) checks.

### Setup Guide

Follow our [SafeSnap Setup Guide](./docs/setup_guide.md) to setup a SafeBridge module.
