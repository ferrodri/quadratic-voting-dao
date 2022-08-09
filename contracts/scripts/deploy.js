// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { deployGovernorContractFixture } = require('../test/shared/fixtures');
const { moveBlocks } = require('../test/shared/utilities');

async function main() {
    const {
        GovernorContract, GovernanceToken, DAOModerators
    } = await deployGovernorContractFixture();
    // eslint-disable-next-line no-undef
    const [{ address: owner }] = await ethers.getSigners();
    await GovernanceToken.delegate(owner);
    await moveBlocks(1);

    console.log('GovernorContract deployed to:', GovernorContract.address);
    console.log('GovernanceToken deployed to:', GovernanceToken.address);
    console.log('DAOModerators deployed to:', DAOModerators.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
