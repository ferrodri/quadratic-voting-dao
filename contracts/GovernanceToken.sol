// SPDX-License-Identifier: MIT
pragma solidity =0.8.9;
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';

contract GovernanceToken is ERC20Votes {

    /// @dev Sets ERC20Votes total supply through ERC20Votes mint function, 
    /// total supply will be assigned to contract owner
    constructor(uint256 _totalSupply)
        ERC20('GovernanceToken', 'GT')
        ERC20Permit('GovernanceToken')
    {
        _mint(msg.sender, _totalSupply);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }
}
