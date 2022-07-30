// SPDX-License-Identifier: MIT
pragma solidity =0.8.9;
import '@openzeppelin/contracts/governance/TimelockController.sol';

contract Timelock is TimelockController {
    /// @param minDelay Minimum delay in seconds for a timelock operation to become valid
    /* solhint-disable no-empty-blocks */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
    ) TimelockController(minDelay, proposers, executors) {}
}
