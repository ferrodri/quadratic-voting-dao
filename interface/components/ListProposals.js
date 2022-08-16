import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, useBlockNumber, useContractRead, useProvider } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { GovernorContractAddress } from '../shared/constants';
import { HasVoted, Proposal } from './index';


export function ListProposals({ onlyActive, onlySuccessful, availableVoting }) {
    const { isConnected } = useAccount();
    const provider = useProvider();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const [proposals, setProposals] = useState([]);
    const [votingPeriod, setVotingPeriod] = useState(0);

    useContractRead({
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'votingPeriod',
        onSuccess(data) {
            setVotingPeriod(data.toNumber());
        }
    });

    useEffect(() => {
        const governorContract = new ethers.Contract(
            GovernorContractAddress, GovernorContractABI.abi, provider
        );
        let eventFilter = governorContract.filters.ProposalCreated();
        const blockMinusVotingPeriod = blockNumber - votingPeriod;

        provider.getLogs({
            ...eventFilter,
            fromBlock:
                onlyActive && votingPeriod !== 0
                    ? blockMinusVotingPeriod > 0 ? blockMinusVotingPeriod : 0
                    : 'earliest',
            toBlock: 'latest'
        }).then(logs => {
            let proposals = logs.filter(log => {
                const deadline =
                    governorContract.interface.parseLog(log).args[7].toNumber();
                return onlyActive ? deadline >= blockNumber : true;
            });

            proposals = proposals.map(log => {
                const [
                    proposalId, , , , , calldatas, snapshot,
                    deadline, description
                ] =
                    governorContract.interface.parseLog(log).args;

                return {
                    calldatas, deadline, description, proposalId, snapshot
                };
            });
            setProposals(proposals);
        });
    }, [blockNumber, onlyActive, provider, votingPeriod]);

    return (
        <>
            {proposals.length > 0 && proposals.map((proposal, i) =>
                isConnected
                    ? <HasVoted proposalId={proposal.proposalId} key={i}>
                        <Proposal
                            key={i}
                            proposal={proposal}
                            availableVoting={availableVoting}
                            onlySuccessful={onlySuccessful}
                        />
                    </HasVoted>
                    : <Proposal
                        key={i}
                        proposal={proposal}
                        availableVoting={availableVoting}
                        onlySuccessful={onlySuccessful}
                    />
            )}
        </>
    );
}