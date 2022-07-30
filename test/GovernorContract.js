const { loadFixture, } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { moveBlocks } = require('./shared/utilities');
const { deployGovernorContractFixture } = require('./shared/fixtures');
const {
    DAO_MODERATORS: { NEW_MODERATORS, SET_NEW_MODERATOR_FN },
    GOVERNANCE_TOKEN: { TOTAL_SUPPLY },
    GOVERNOR_CONTRACT: { INITIAL_VOTING_DELAY }
} = require('./shared/constants');

// Example proposal description
const proposalDescription = 'Example proposal description';
// Vote with 'For' support, enum is Against (0), For(1), Abstain(2)
// TODO: frh -> check to see if test this types and leave this in constans
const supportFor = 1;
// enum ProposalState {
//     Pending,
//     Active,
//     Canceled,
//     Defeated,
//     Succeeded,
//     Queued,
//     Expired,
//     Executed
// }

const createProposal = async (
    GovernorContract, GovernanceToken, DAOModerators
) => {

    const calldata = getCalldata(DAOModerators);

    const [{ address: owner }] = await ethers.getSigners();
    await GovernanceToken.delegate(owner);

    const tx = await GovernorContract.propose(
        [DAOModerators.address], [0], [calldata],
        proposalDescription
    );
    const receipt = await tx.wait();

    const createProposalEvent = receipt.events?.filter(
        (e) => e.event === 'ProposalCreated'
    );

    return {
        status: receipt.status,
        proposalId: createProposalEvent[0].args.proposalId
    };
}

const getCalldata = (DAOModerators) => {
    const { NAME, EMAIL, MODERATOR_ADDRESS } = NEW_MODERATORS[0];
    return DAOModerators.interface.encodeFunctionData(
        SET_NEW_MODERATOR_FN, [NAME, EMAIL, MODERATOR_ADDRESS]
    );
}

describe('GovernorContract', function () {
    // TODO: frh -> do deployment
    // describe('Deployment', function () {
    // });

    describe('Creation of proposals', function () {
        it('Should create a proposal', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { status } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators
            );
            expect(status).to.equal(1);
        });

        it('Proposal should fail if proposer has no voting power', async function () {
            const { GovernorContract, DAOModerators } =
                await loadFixture(deployGovernorContractFixture);

            const calldata = getCalldata(DAOModerators);

            await expect(
                GovernorContract.propose(
                    [DAOModerators.address], [0], [calldata], proposalDescription
                )
            ).to.be.reverted;
        });

        it('Proposal should fail if proposer votes are below proposal threshold',
            async function () {
                const { GovernorContract, DAOModerators, GovernanceToken } =
                    await loadFixture(deployGovernorContractFixture);

                const [{ address: owner }, { address: to }] =
                    await ethers.getSigners();
                await GovernanceToken.delegate(owner);

                // Transfer all votes except one to a second address
                await GovernanceToken
                    .transfer(to, BigNumber.from(TOTAL_SUPPLY - 1));

                const calldata = getCalldata(DAOModerators);

                await expect(
                    GovernorContract.propose(
                        [DAOModerators.address], [0], [calldata],
                        proposalDescription
                    )
                ).to.be.reverted;
            }
        );
    });

    describe('Voting', function () {
        it('Should vote for a proposal', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { owner, proposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators
            );

            console.log('proposalId: ', proposalId);

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            // TODO: frh -> weight
            const tx = await GovernorContract.vote(proposalId, 300, supportFor);

            const receipt = await tx.wait();
            console.log('receipt: ', receipt.events);

            const hola = await GovernorContract.state(proposalId);
            console.log('hola: ', hola);



        });

        it('Should fail if voter casts more votes that he has to one proposal',
            async function () {
            }
        );

        it('Should fail if voter casts more votes that he has to two proposals',
            async function () {
            }
        );
    });

    describe('Events', function () {
        it('Should emit an event when a vote is casted', async () => {
        });
    });

    describe('Disabled functions', function () {
        it('Function castVote should be disabled', async () => {
            const { GovernorContract } =
                await loadFixture(deployGovernorContractFixture);
            await expect(
                GovernorContract.castVote(2, 1)
            ).to.be.reverted;
        });

        it('Function castVoteWithReason should be disabled', async () => {
            const { GovernorContract } =
                await loadFixture(deployGovernorContractFixture);
            await expect(
                GovernorContract.castVoteWithReason(2, 1, 'fail')
            ).to.be.reverted;
        });

        it('Function castVoteWithReasonAndParams should be disabled', async () => {
            const { GovernorContract } =
                await loadFixture(deployGovernorContractFixture);
            await expect(
                GovernorContract.castVoteWithReasonAndParams(2, 1, 'fail', 1)
            ).to.be.reverted;
        });

        it('Function castVoteBySig should be disabled', async () => {
            const { GovernorContract } =
                await loadFixture(deployGovernorContractFixture);
            await expect(
                GovernorContract.castVoteBySig(
                    2, 1, 1,
                    '0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0',
                    '0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0'
                )
            ).to.be.reverted;
        });

        it('Function castVoteWithReasonAndParamsBySig should be disabled', async () => {
            const { GovernorContract } =
                await loadFixture(deployGovernorContractFixture);
            await expect(
                GovernorContract.castVoteWithReasonAndParamsBySig(
                    2, 1, 'fail', 1, 1,
                    '0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0',
                    '0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0'
                )
            ).to.be.reverted;
        });
    });
    
});