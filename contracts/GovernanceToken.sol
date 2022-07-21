// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    uint256 public maxSupply = 10;

    // TODO: frh -> explain this on the email and test you can sign with no gas and look at overrides again, https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit
    constructor()
        ERC20("GovernanceToken", "GT")
        ERC20Permit("GovernanceToken")
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
