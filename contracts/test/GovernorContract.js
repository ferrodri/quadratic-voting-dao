const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { moveBlocks } = require('./shared/utilities');
const { deployGovernorContractFixture } = require('./shared/fixtures');
const {
    DAO_MODERATORS: { NEW_MODERATORS, SET_NEW_MODERATOR_FN },
    GOVERNANCE_TOKEN: { TOTAL_SUPPLY },
    GOVERNOR_CONTRACT: {
        INITIAL_VOTING_DELAY, INITIAL_VOTING_PERIOD, INITIAL_MINIMUM_VOTING_PERIOD
    }
} = require('./shared/constants');

// Example proposal description
const proposalDescription = 'Example proposal description';
const weight = {
    sufficient: 15,
    sufficientTwoProposals: 10,
    exceeded: 20,
    notQuorum: 2
};
const support = {
    against: 0,
    for: 1,
    abstain: 2
};
const proposalState = {
    pending: 0,
    active: 1,
    canceled: 2,
    defeated: 3,
    succeeded: 4,
    queued: 5,
    expired: 6,
    executed: 7
};

const createProposal = async (
    GovernorContract, GovernanceToken, DAOModerators, moderatorIndex
) => {

    const calldata = getCalldata(DAOModerators, moderatorIndex);
    // eslint-disable-next-line no-undef
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
        calldata,
        status: receipt.status,
        owner,
        proposalId: createProposalEvent[0].args.proposalId
    };
};

const getCalldata = (DAOModerators, moderatorIndex) => {
    const { NAME, EMAIL, MODERATOR_ADDRESS } = NEW_MODERATORS[moderatorIndex];
    return DAOModerators.interface.encodeFunctionData(
        SET_NEW_MODERATOR_FN, [NAME, EMAIL, MODERATOR_ADDRESS]
    );
};

describe('GovernorContract', function () {

    describe('Creation of proposals', function () {
        it('Should create a proposal', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { proposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );

            let _proposalState = await GovernorContract.state(proposalId);
            expect(_proposalState).to.equal(proposalState.pending);

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            _proposalState = await GovernorContract.state(proposalId);
            expect(_proposalState).to.equal(proposalState.active);
        });

        it('Proposal should fail if proposer has no voting power', async function () {
            const { GovernorContract, DAOModerators } =
                await loadFixture(deployGovernorContractFixture);

            const calldata = getCalldata(DAOModerators, 0);

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
                    // eslint-disable-next-line no-undef
                    await ethers.getSigners();
                await GovernanceToken.delegate(owner);

                // Transfer all votes except one to a second address
                await GovernanceToken
                    .transfer(to, BigNumber.from(TOTAL_SUPPLY - 1));

                const calldata = getCalldata(DAOModerators, 0);

                await expect(
                    GovernorContract.propose(
                        [DAOModerators.address], [0], [calldata],
                        proposalDescription
                    )
                ).to.be.reverted;
            }
        );

        it('Should create two proposals', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { status } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );
            expect(status).to.equal(1);

            await moveBlocks(INITIAL_VOTING_DELAY + 2);

            const proposal = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 1
            );
            expect(proposal.status).to.equal(1);
        });

        it('Second proposal should fail if minimum voting period cannot be reached',
            async function () {
                const {
                    GovernorContract, GovernanceToken, DAOModerators
                } = await loadFixture(deployGovernorContractFixture);
                const { status } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                );
                expect(status).to.equal(1);

                await moveBlocks(
                    INITIAL_VOTING_PERIOD - INITIAL_MINIMUM_VOTING_PERIOD + 1
                );

                await expect(
                    createProposal(
                        GovernorContract, GovernanceToken, DAOModerators, 1
                    )
                ).to.be.reverted;
            }
        );

        it('Should create two proposals in different voting periods',
            async function () {
                const {
                    GovernorContract, GovernanceToken, DAOModerators
                } = await loadFixture(deployGovernorContractFixture);
                const { status } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                );
                expect(status).to.equal(1);

                await moveBlocks(INITIAL_VOTING_PERIOD + 10);

                const proposal = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 1
                );
                expect(proposal.status).to.equal(1);
            }
        );

        it('Should fail when creating two equal proposals', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { status } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );
            expect(status).to.equal(1);
            await expect(
                createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                )
            ).to.be.reverted;
        });
    });

    describe('Voting', function () {
        it('Should vote for a proposal', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { owner, proposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            await GovernorContract.vote(
                proposalId, weight.sufficient, support.for
            );
            expect(
                await GovernorContract.hasVoted(proposalId, owner)
            ).to.be.true;
        });

        it('Should fail if voter casts more votes that he has to one proposal',
            async function () {
                const {
                    GovernorContract, GovernanceToken, DAOModerators
                } = await loadFixture(deployGovernorContractFixture);
                const { proposalId } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                );

                await moveBlocks(INITIAL_VOTING_DELAY + 1);

                await expect(
                    GovernorContract
                        .vote(proposalId, weight.exceeded, support.for)
                ).to.be.reverted;
            }
        );

        it('Should vote for two proposals', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { owner, proposalId: firstProposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );
            const { proposalId: secondProposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 1
            );

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            await GovernorContract.vote(
                firstProposalId, weight.sufficientTwoProposals, support.for
            );
            expect(
                await GovernorContract.hasVoted(firstProposalId, owner)
            ).to.be.true;

            await GovernorContract.vote(
                secondProposalId, weight.sufficientTwoProposals, support.for
            );
            expect(
                await GovernorContract.hasVoted(secondProposalId, owner)
            ).to.be.true;
        });

        it('Should fail if voter casts more votes that he has for two proposals',
            async function () {
                const {
                    GovernorContract, GovernanceToken, DAOModerators
                } = await loadFixture(deployGovernorContractFixture);
                const { proposalId: firstProposalId } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                );
                const { proposalId: secondProposalId } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 1
                );

                await moveBlocks(INITIAL_VOTING_DELAY + 1);

                await GovernorContract.vote(
                    firstProposalId, weight.sufficient, support.for
                );

                await expect(
                    GovernorContract.vote(
                        secondProposalId, weight.sufficient, support.for
                    )
                ).to.be.reverted;
            }
        );

        it('Voting weight between voting periods should be cleaned', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { owner, proposalId: firstProposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            await GovernorContract.vote(
                firstProposalId, weight.sufficient, support.for
            );

            expect(
                await GovernorContract.hasVoted(firstProposalId, owner)
            ).to.be.true;

            await moveBlocks(INITIAL_VOTING_PERIOD + 100);

            const { proposalId: secondProposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 1
            );

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            await GovernorContract.vote(
                secondProposalId, weight.sufficient, support.for
            );
            expect(
                await GovernorContract.hasVoted(secondProposalId, owner)
            ).to.be.true;
        });

        it('Should not be able to vote if received ERC20Votes during the voting period',
            async function () {
                const {
                    GovernorContract, GovernanceToken, DAOModerators
                } = await loadFixture(deployGovernorContractFixture);
                const { proposalId } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                );

                await moveBlocks(INITIAL_VOTING_DELAY + 1);

                // eslint-disable-next-line no-undef
                const [, other] = await ethers.getSigners();

                const amount = TOTAL_SUPPLY / 3;
                await GovernanceToken.transfer(
                    other.address, BigNumber.from(amount)
                );
                expect(
                    await GovernanceToken.balanceOf(other.address)
                ).to.equal(amount);

                await expect(
                    GovernorContract.connect(other).vote(
                        proposalId, weight.sufficient, support.for
                    )
                ).to.be.reverted;
            }
        );

        it('Should get available votes', async function () {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);

            // eslint-disable-next-line no-undef
            const [{ address: owner }] = await ethers.getSigners();
            await GovernanceToken.delegate(owner);

            await moveBlocks(1);

            expect(
                await GovernorContract.getAvailableVotingPower()
            ).to.equal(TOTAL_SUPPLY);

            const calldata = getCalldata(DAOModerators, 0);

            const tx = await GovernorContract.propose(
                [DAOModerators.address], [0], [calldata],
                proposalDescription
            );
            const receipt = await tx.wait();

            const createProposalEvent = receipt.events?.filter(
                (e) => e.event === 'ProposalCreated'
            );

            const proposalId = createProposalEvent[0].args.proposalId;

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            expect(
                await GovernorContract.getAvailableVotingPower()
            ).to.equal(TOTAL_SUPPLY);

            await GovernorContract.vote(
                proposalId, weight.sufficient, support.for
            );

            expect(
                await GovernorContract.getAvailableVotingPower()
            ).to.equal(TOTAL_SUPPLY - weight.sufficient ** 2);
        });
    });

    describe('Proposal outcome', function () {
        it('Proposal should be defeated if quorum is not reached', async () => {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { proposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            await GovernorContract.vote(
                proposalId, weight.notQuorum, support.for
            );

            await moveBlocks(INITIAL_VOTING_PERIOD + 1);

            const _proposalState = await GovernorContract.state(proposalId);
            expect(_proposalState).to.equal(proposalState.defeated);
        });

        it('Proposal should be defeated if majority is not reached', async () => {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { proposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            await GovernorContract.vote(
                proposalId, weight.sufficient, support.against
            );

            await moveBlocks(INITIAL_VOTING_PERIOD + 1);

            const _proposalState = await GovernorContract.state(proposalId);
            expect(_proposalState).to.equal(proposalState.defeated);
        });

        it('Proposal should be successful if quorum and majority is reached',
            async () => {
                const {
                    GovernorContract, GovernanceToken, DAOModerators
                } = await loadFixture(deployGovernorContractFixture);
                const { proposalId } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                );

                await moveBlocks(INITIAL_VOTING_DELAY + 1);

                await GovernorContract.vote(
                    proposalId, weight.sufficient, support.for
                );

                await moveBlocks(INITIAL_VOTING_PERIOD + 1);

                const _proposalState = await GovernorContract.state(proposalId);
                expect(_proposalState).to.equal(proposalState.succeeded);
            }
        );

        it('Proposal should be executed and DAOModerators should be appointed',
            async () => {
                const {
                    GovernorContract, GovernanceToken, DAOModerators
                } = await loadFixture(deployGovernorContractFixture);
                const { proposalId, calldata } = await createProposal(
                    GovernorContract, GovernanceToken, DAOModerators, 0
                );

                await moveBlocks(INITIAL_VOTING_DELAY + 1);

                await GovernorContract.vote(
                    proposalId, weight.sufficient, support.for
                );

                await moveBlocks(INITIAL_VOTING_PERIOD + 1);

                // eslint-disable-next-line no-undef
                const descriptionHash = ethers.utils.id(proposalDescription);

                await GovernorContract.execute(
                    [DAOModerators.address], [0], [calldata], descriptionHash
                );

                const _proposalState = await GovernorContract.state(proposalId);
                expect(_proposalState).to.equal(proposalState.executed);

                const moderators = await DAOModerators.getModerators();
                expect(moderators).to.have.lengthOf(2);
            }
        );
    });

    describe('Events', function () {
        it('Should emit an event when a vote is casted', async () => {
            const {
                GovernorContract, GovernanceToken, DAOModerators
            } = await loadFixture(deployGovernorContractFixture);
            const { owner, proposalId } = await createProposal(
                GovernorContract, GovernanceToken, DAOModerators, 0
            );

            await moveBlocks(INITIAL_VOTING_DELAY + 1);

            await expect(
                GovernorContract.vote(
                    proposalId, weight.sufficient, support.for
                )
            )
                .to.emit(GovernorContract, 'LogVoteCasted')
                .withArgs(owner, proposalId, support.for, weight.sufficient);
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