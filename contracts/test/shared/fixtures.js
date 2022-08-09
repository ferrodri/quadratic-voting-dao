const {
    DAO_MODERATORS: { NAME, EMAIL, MODERATOR_ADDRESS },
    GOVERNANCE_TOKEN: { NAME: GOVERNANCE_TOKEN_NAME, SYMBOL, TOTAL_SUPPLY },
    GOVERNOR_CONTRACT: {
        NAME: GOVERNOR_CONTRACT_NAME, INITIAL_VOTING_DELAY,
        INITIAL_VOTING_PERIOD, INITIAL_MINIMUM_VOTING_PERIOD,
        INITIAL_PROPOSAL_THRESHOLD, QUORUM_NUMERATOR_VALUE
    }
} = require('./constants');

const deployDAOModeratorsFixture = async () => {
    // eslint-disable-next-line no-undef
    const DAOModeratorsFactory = await ethers
        .getContractFactory('DAOModerators');

    const DAOModerators = await DAOModeratorsFactory.deploy(
        NAME, EMAIL, MODERATOR_ADDRESS
    );

    await DAOModerators.deployed();

    return DAOModerators;
};

const deployGovernanceTokenFixture = async () => {
    // eslint-disable-next-line no-undef
    const governanceTokenFactory = await ethers
        .getContractFactory('GovernanceToken');

    const GovernanceToken =
        await governanceTokenFactory.deploy(
            GOVERNANCE_TOKEN_NAME, SYMBOL, TOTAL_SUPPLY
        );

    await GovernanceToken.deployed();

    return GovernanceToken;
};

const deployGovernorContractFixture = async () => {
    const DAOModerators = await deployDAOModeratorsFixture();
    const GovernanceToken = await deployGovernanceTokenFixture();

    // eslint-disable-next-line no-undef
    const GovernorFactory = await ethers.getContractFactory('GovernorContract');

    const GovernorContract =
        await GovernorFactory.deploy(
            GovernanceToken.address,
            GOVERNOR_CONTRACT_NAME,
            INITIAL_VOTING_DELAY,
            INITIAL_VOTING_PERIOD,
            INITIAL_MINIMUM_VOTING_PERIOD,
            INITIAL_PROPOSAL_THRESHOLD,
            QUORUM_NUMERATOR_VALUE
        );

    await GovernorContract.deployed();

    // Transfer ownership of DAOModerators to Governor
    await DAOModerators.transferOwnership(GovernorContract.address);

    return { GovernorContract, GovernanceToken, DAOModerators };
};

module.exports = {
    deployDAOModeratorsFixture, deployGovernanceTokenFixture,
    deployGovernorContractFixture
};