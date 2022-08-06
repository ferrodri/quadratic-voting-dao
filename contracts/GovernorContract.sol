// SPDX-License-Identifier: MIT
pragma solidity =0.8.9;

/**
 * The core contract that contains all the logic and primitives. It is abstract
 * and requires choosing some of the modules below, or custom ones
 */
import '@openzeppelin/contracts/governance/Governor.sol';
// Extracts voting weight from an ERC20Votes token
import '@openzeppelin/contracts/governance/extensions/GovernorVotes.sol';
/**
 * Combines with GovernorVotes to set the quorum as a fraction of the total
 * token supply
 */
import '@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol';
// Simple voting mechanism with 3 voting options: Against, For and Abstain
import './GovernorCountingSimple.sol';
/**
 * Manages some of the settings (voting delay, initial and minimum voting period
 * duration, and proposal threshold) in a way that can be updated through a
 * governance proposal, without requiring an upgrade
 */
import './GovernorSettings.sol';

/// Utils
import '@openzeppelin/contracts/utils/Timers.sol';
import '@openzeppelin/contracts/utils/math/SafeCast.sol';

contract GovernorContract is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    using SafeCast for uint256;
    using Timers for Timers.BlockNumber;

    /**
     * @dev Emitted when a vote is casted
     */
    event LogVoteCasted(
        address voter,
        uint256 proposalId,
        uint8 support,
        uint256 weight
    );

    mapping(uint256 => ProposalCore) private _proposals;

    constructor(
        IVotes tokenAddress,
        string memory name_,
        uint256 initialVotingDelay,
        uint256 initialVotingPeriod,
        uint256 initialMinimumVotingPeriod,
        uint256 initialProposalThreshold,
        uint256 quorumNumeratorValue
    )
        Governor(name_)
        GovernorSettings(
            initialVotingDelay,
            initialVotingPeriod,
            initialMinimumVotingPeriod,
            initialProposalThreshold
        )
        GovernorVotes(tokenAddress)
        GovernorVotesQuorumFraction(quorumNumeratorValue)
    // solhint-disable-next-line no-empty-blocks
    {

    }

    function vote(
        uint256 proposalId,
        uint256 weight,
        uint8 support
    ) public {
        address account = _msgSender();
        uint256 _totalWeight = _getVotes(
            account,
            _currentPeriodVoteStart.getDeadline(),
            _defaultParams()
        );
        uint256 _quadraticWeight = weight**2;

        require(
            state(proposalId) == ProposalState.Active,
            'Proposal not active'
        );
        require(
            _castedVotes[_currentPeriodVoteStart.getDeadline()][account] +
                _quadraticWeight <
                _totalWeight,
            'Exceeded voting power'
        );

        emit LogVoteCasted(msg.sender, proposalId, support, weight);
        _countVote(
            proposalId,
            account,
            support,
            _quadraticWeight,
            _defaultParams()
        );
    }

    /**
     * @dev Create a new proposal.
     *
     * Emits a {ProposalCreated} event.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256) {
        require(
            getVotes(_msgSender(), block.number - 1) >= proposalThreshold(),
            'Votes below proposal threshold'
        );

        uint256 proposalId = hashProposal(
            targets,
            values,
            calldatas,
            keccak256(bytes(description))
        );

        require(targets.length == values.length, 'Invalid proposal length');
        require(targets.length == calldatas.length, 'Invalid proposal length');
        require(targets.length > 0, 'Empty proposal');

        ProposalCore storage proposal = _proposals[proposalId];

        require(proposal.voteStart.isUnset(), 'Proposal already exists');

        uint64 snapshot = block.number.toUint64() + votingDelay().toUint64();
        proposal.voteStart.setDeadline(snapshot);

        /**
         * @dev Proposals voting period should end at {_currentPeriodVoteEnd}.
         * If {_currentPeriodVoteEnd} already expired, first proposal of a new
         * voting period should establish a new {_currentPeriodVoteEnd}.
         */
        uint64 deadline;
        if (
            _currentPeriodVoteEnd.isStarted() &&
            !_currentPeriodVoteEnd.isExpired()
        ) {
            deadline = _currentPeriodVoteEnd.getDeadline();

            require(
                deadline - block.number > minimumVotingPeriod(),
                'Voting period should be longer'
            );

            proposal.voteEnd.setDeadline(deadline);
        } else {
            deadline = snapshot + votingPeriod().toUint64();
            proposal.voteEnd.setDeadline(deadline);
            _currentPeriodVoteEnd.setDeadline(deadline);
            /// @dev {_currentPeriodVoteStart} would be taken into account as
            /// so to extract voting weight from token
            _currentPeriodVoteStart.setDeadline(snapshot);
        }

        emit ProposalCreated(
            proposalId,
            _msgSender(),
            targets,
            values,
            new string[](targets.length),
            calldatas,
            snapshot,
            deadline,
            description
        );

        return proposalId;
    }

    /// @dev See {IGovernor-state}.
    function state(uint256 proposalId)
        public
        view
        override(Governor)
        returns (ProposalState)
    {
        ProposalCore storage proposal = _proposals[proposalId];

        if (proposal.executed) {
            return ProposalState.Executed;
        }

        if (proposal.canceled) {
            return ProposalState.Canceled;
        }

        uint256 snapshot = proposalSnapshot(proposalId);

        if (snapshot == 0) {
            revert('Governor: unknown proposal id');
        }

        if (snapshot >= block.number) {
            return ProposalState.Pending;
        }

        uint256 deadline = proposalDeadline(proposalId);

        if (deadline >= block.number) {
            return ProposalState.Active;
        }

        if (_quorumReached(proposalId) && _voteSucceeded(proposalId)) {
            return ProposalState.Succeeded;
        } else {
            return ProposalState.Defeated;
        }
    }

    /// @dev See {IGovernor-proposalSnapshot}.
    function proposalSnapshot(uint256 proposalId)
        public
        view
        override(Governor)
        returns (uint256)
    {
        return _proposals[proposalId].voteStart.getDeadline();
    }

    /// @dev See {IGovernor-proposalDeadline}.
    function proposalDeadline(uint256 proposalId)
        public
        view
        override(Governor)
        returns (uint256)
    {
        return _proposals[proposalId].voteEnd.getDeadline();
    }

    /// @dev See {GovernorSettings-proposalThreshold}.
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return GovernorSettings.proposalThreshold();
    }

    /// @dev Override and disable this function
    function castVote(uint256, uint8)
        public
        pure
        override(Governor)
        returns (uint256)
    {
        // solhint-disable-next-line reason-string
        revert();
    }

    /// @dev Override and disable this function
    function castVoteWithReason(
        uint256,
        uint8,
        string memory
    ) public pure override(Governor) returns (uint256) {
        // solhint-disable-next-line reason-string
        revert();
    }

    /// @dev Override and disable this function
    function castVoteWithReasonAndParams(
        uint256,
        uint8,
        string calldata,
        bytes memory
    ) public pure override(Governor) returns (uint256) {
        // solhint-disable-next-line reason-string
        revert();
    }

    /// @dev Override and disable this function
    function castVoteBySig(
        uint256,
        uint8,
        uint8,
        bytes32,
        bytes32
    ) public pure override(Governor) returns (uint256) {
        // solhint-disable-next-line reason-string
        revert();
    }

    /// @dev Override and disable this function
    function castVoteWithReasonAndParamsBySig(
        uint256,
        uint8,
        string calldata,
        bytes memory,
        uint8,
        bytes32,
        bytes32
    ) public pure override(Governor) returns (uint256) {
        // solhint-disable-next-line reason-string
        revert();
    }

    /// @dev See {IERC165-supportsInterface}.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
