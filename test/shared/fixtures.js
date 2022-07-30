const {
    DAO_MODERATORS: { NAME, EMAIL, MODERATOR_ADDRESS },
    GOVERNANCE_TOKEN: { NAME: GOVERNANCE_TOKEN_NAME, SYMBOL, TOTAL_SUPPLY },
    GOVERNOR_CONTRACT: { 
        NAME: GOVERNOR_CONTRACT_NAME,  INITIAL_VOTING_DELAY, 
        INITIAL_VOTING_PERIOD, INITIAL_PROPOSAL_THRESHOLD, QUORUM_NUMERATOR_VALUE
    },
    TIMELOCK: { MIN_DELAY }
} = require('./constants');

const deployDAOModeratorsFixture = async () => {
    const DAOModeratorsFactory = await ethers
        .getContractFactory('DAOModerators');

    const DAOModerators = await DAOModeratorsFactory.deploy(
        NAME, EMAIL, MODERATOR_ADDRESS
    );

    await DAOModerators.deployed();

    return DAOModerators;
};

const deployGovernanceTokenFixture = async () => {
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
    const Timelock = await deployTimelockFixture();

    const GovernorFactory = await ethers.getContractFactory('GovernorContract');

    const GovernorContract =
        await GovernorFactory.deploy(
            GovernanceToken.address,
            Timelock.address,
            GOVERNOR_CONTRACT_NAME,
            INITIAL_VOTING_DELAY,
            INITIAL_VOTING_PERIOD,
            INITIAL_PROPOSAL_THRESHOLD,
            QUORUM_NUMERATOR_VALUE
        );

    await GovernorContract.deployed();

    return { GovernorContract, GovernanceToken, DAOModerators };
};

const deployTimelockFixture = async () => {
    const timelockFactory = await ethers.getContractFactory('Timelock');

    const Timelock =
        await timelockFactory.deploy(MIN_DELAY, [], []);

    await Timelock.deployed();

    return Timelock;
};

module.exports = {
    deployDAOModeratorsFixture, deployGovernanceTokenFixture,
    deployGovernorContractFixture, deployTimelockFixture
}