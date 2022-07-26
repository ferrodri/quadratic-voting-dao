// SPDX-License-Identifier: MIT
pragma solidity =0.8.9;
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';

contract GovernanceToken is ERC20Votes {
    uint256 public maxSupply = 3000000000000000000;

    /**
     * Implementation of the ERC20 Permit extension allowing approvals to be 
     * made via signatures, as defined in EIP-2612. Adds the permit method, 
     * which can be used to change an account’s ERC20 allowance 
     * (see IERC20.allowance) by presenting a message signed by the account. 
     * By not relying on IERC20.approve, the token holder account doesn’t need 
     * to send a transaction, and thus is not required to hold Ether at all.
     */
    constructor()
        ERC20('GovernanceToken', 'GT')
        ERC20Permit('GovernanceToken')
    {
        _mint(msg.sender, maxSupply);
    }

    // The functions below are overrides required by Solidity.
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    // Creates amount tokens and assigns them to account, increasing the total
    // supply. Emits a transfer event with from set to the zero address.
    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    // Destroys amount tokens from account, reducing the total supply.
    // Emits a transfer event with to set to the zero address.
    function _burn(address account, uint256 amount)
        internal
        override(ERC20Votes)
    {
        super._burn(account, amount);
    }
}
