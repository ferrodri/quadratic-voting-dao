module.exports = {
    DAO_MODERATORS: {
        NAME: 'Fernando Rodriguez Hervias',
        EMAIL: 'f.rodriguez.hervias@gmail.com',
        MODERATOR_ADDRESS: '0xC776cBDDeA014889E8BaB4323C894C5c34DB214D',
        NEW_MODERATORS: [
            {
                NAME: 'Tom Sawyer',
                EMAIL: 'tom@gmail.com',
                MODERATOR_ADDRESS: '0x820fb393d946194BFd5d3e07475c84a812f0C176'
            },
            {
                NAME: 'Nicolas Cage',
                EMAIL: 'nicolas@gmail.com',
                MODERATOR_ADDRESS: '0x82e67Fb485B9E29A3cd2E6FDfa789e4220324671'
            }
        ],
        SET_NEW_MODERATOR_FN: 'setNewModerator'
    },
    GOVERNANCE_TOKEN: {
        NAME: 'GovernanceToken',
        SYMBOL: 'GT',
        // Total supply of ERC20Votes
        TOTAL_SUPPLY: 300
    },
    GOVERNOR_CONTRACT: {
        NAME: 'QuadraticVoting',
        /**
         * Delay, in number of block, between the proposal is created and the vote 
         * starts. This can be increassed to leave time for users to buy voting power, 
         * or delegate it, before the voting of a proposal starts.
         */
        INITIAL_VOTING_DELAY: 1,
        /**
         * Delay, in number of blocks, between the vote start and vote ends. 
         * 45115 blocks is approximately one week.
         * 
         * For testing purposes, we are using lower values.
         */
        INITIAL_VOTING_PERIOD: 100,
        /**
         * Minimum delay, in number of blocks, between the vote start and vote 
         * ends. 25780 blocks is approximately 4 days.
         * 
         * For testing purposes, we are using lower values.
         */
        INITIAL_MINIMUM_VOTING_PERIOD: 60,
        // The number of votes required in order for a voter to become a proposer
        INITIAL_PROPOSAL_THRESHOLD: 10,
        // Quorum is specified as `numerator / denominator`. By default the denominator 
        // is 100.
        QUORUM_NUMERATOR_VALUE: 4
    }
};