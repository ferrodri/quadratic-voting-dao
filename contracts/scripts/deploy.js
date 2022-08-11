// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { deployGovernorContractFixture } = require('../test/shared/fixtures');
const {
    DAO_MODERATORS: { NEW_MODERATORS, SET_NEW_MODERATOR_FN }
} = require('../test/shared/constants');
const proposalDescription = 'Example proposal description';

async function main() {
    const {
        GovernorContract, GovernanceToken, DAOModerators
    } = await deployGovernorContractFixture();
    // eslint-disable-next-line no-undef
    const [{ address: owner }] = await ethers.getSigners();
    await GovernanceToken.delegate(owner);

    // Mine a block every second
    // eslint-disable-next-line no-undef
    await network.provider.send('evm_setIntervalMining', [15000]);

    // TODO: frh -> decide deploy, maybe some defeated and so on
    // const createProposal = async (
    //     GovernorContract, GovernanceToken, DAOModerators, moderatorIndex
    // ) => {
    
    //     const calldata = getCalldata(DAOModerators, moderatorIndex);
    //     // eslint-disable-next-line no-undef
    //     const [{ address: owner }] = await ethers.getSigners();
    
    //     const tx = await GovernorContract.propose(
    //         [DAOModerators.address], [0], [calldata],
    //         `${proposalDescription} ${moderatorIndex}`
    //     );
    //     const receipt = await tx.wait();
    
    //     const createProposalEvent = receipt.events?.filter(
    //         (e) => e.event === 'ProposalCreated'
    //     );
    
    //     return {
    //         calldata,
    //         status: receipt.status,
    //         owner,
    //         proposalId: createProposalEvent[0].args.proposalId
    //     };
    // };
    
    // const getCalldata = (DAOModerators, moderatorIndex) => {
    //     const { NAME, EMAIL, MODERATOR_ADDRESS } = NEW_MODERATORS[moderatorIndex];
    //     return DAOModerators.interface.encodeFunctionData(
    //         SET_NEW_MODERATOR_FN, [NAME, EMAIL, MODERATOR_ADDRESS]
    //     );
    // };

    // const { proposalId } = await createProposal(
    //     GovernorContract, GovernanceToken, DAOModerators, 0
    // );
    // console.log('proposalId: ', proposalId);

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
