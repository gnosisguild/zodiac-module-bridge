# Zodiac Bridge Module

[![Build Status](https://github.com/gnosis/zodiac-module-bridge/actions/workflows/ci.yml/badge.svg)](https://github.com/gnosis/zodiac-module-bridge/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/zodiac-module-bridge/badge.svg?branch=mainache_bust=1)](https://coveralls.io/github/gnosis/zodiac-module-bridge?branch=main)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosis/CODE_OF_CONDUCT)

The Bridge Module belongs to the [Zodiac](https://github.com/gnosis/zodiac) collection of tools, which can be accessed through the Zodiac App available on [Gnosis Safe](https://gnosis-safe.io/), as well as in this repository. 

If you have any questions about Zodiac, join the [Gnosis Guild Discord](https://discord.gg/wwmBWTgyEq). Follow [@GnosisGuild](https://twitter.com/gnosisguild) on Twitter for updates.

### About the Bridge Module

This module allows an address on one chain to control an avatar on another chain using an Arbitrary Message Bridge (AMB). This enables a DAO on one chain to control assets and interact with systems like a Gnosis Safe on a different chain.

This module is intended to be used with the [Gnosis Safe](https://github.com/gnosis/safe-contracts).

### Features

- Execute transactions initiated by an approved address on an approved chainId using an approved AMB

### Flow

- On chain (A), deploy a Gnosis Safe and then enable the Bridge Module on the Gnosis Safe.
- On chain (B), call `requireToPassMessage()` on the Bridge contract.
- On chain (a), call `executeSignatures()` on the Bridge contract.

### Solidity Compiler

The contracts have been developed with [Solidity 0.8.0](https://github.com/ethereum/solidity/releases/tag/v0.8.0) in mind. This version of Solidity made all arithmetic checked by default, therefore eliminating the need for explicit overflow or underflow (or other arithmetic) checks.

### Setup Guide

Follow our [Bridge Module Setup Guide](./docs/setup_guide.md).


### Audits

An audit has been performed by the [G0 group](https://github.com/g0-group). No issues have been discovered. The audit results are available as a pdf in [this repo](audits/ZodiacAMBModuleSep2021.pdf) or on the [g0-group repo](https://github.com/g0-group/Audits/blob/e11752abb010f74e32a6fc61142032a10deed578/ZodiacAMBModuleSep2021.pdf).

### Security and Liability

All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

### License

Created under the [LGPL-3.0+ license](LICENSE).
