// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;

import "../AMBModule.sol";

contract AMBModuleMock is AMBModule {
    constructor() AMBModule() {
        isInitialized = false;
    }
}
