// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Example contract. Moderators of our DAO would be changed through quadratic
 * voting. Nonetheless, you can propose and vote to change whatever you want
 * through quadratic voting, this is just an example.
 */
contract DAOModerators is Ownable {
    struct Moderator {
        string name;
        string email;
        address modAdress;
    }
    Moderator[] public moderators;

    // TODO: frh -> develop moderators changed event
    event ModeratorsChanged();

    function setNewModerators(
        string memory _name,
        string memory _email,
        address _modAdress
    ) public onlyOwner {
        moderators.push(Moderator(_name, _email, _modAdress));
    }

    function deleteModerators() public onlyOwner {
        delete moderators;
    }

    function getModerators() public view returns (Moderator[] memory) {
        return moderators;
    }
}
