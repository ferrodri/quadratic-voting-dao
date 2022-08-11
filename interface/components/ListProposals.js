import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useBlockNumber, useContractRead, useProvider } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { GovernorContractAddress } from '../shared/constants';
import { ProposalBlockTimestamp, ProposalState } from './index';

export function ListProposals({ onlyActive }) {
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

        provider.getLogs({
            ...eventFilter,
            fromBlock:
                onlyActive && votingPeriod !== 0
                    ? blockNumber - votingPeriod
                    : 'earliest',
            toBlock: 'latest'
        }).then(logs => {
            let proposals = logs.filter(log => {
                const deadline =
                    governorContract.interface.parseLog(log).args[7].toNumber();
                return onlyActive ? deadline >= blockNumber : true;
            });

            proposals = proposals.map(log => {
                const [proposalId, , , , , , snapshot, deadline, description] =
                    governorContract.interface.parseLog(log).args;

                return {
                    proposalId,
                    snapshot,
                    deadline,
                    description
                };
            });
            setProposals(proposals);
        });
    }, [blockNumber, onlyActive, provider, votingPeriod]);

    return (
        <>
            {proposals.length > 0 && proposals.map((proposal, i) =>
                <div key={i}>
                    <span>Proposal Id: {proposal.proposalId.toString()}</span>
                    <span>Proposal description: {proposal.description}</span>
                    <ProposalBlockTimestamp blockTimestamp={proposal.snapshot} />
                    <ProposalBlockTimestamp blockTimestamp={proposal.deadline} deadline />
                    <ProposalState proposalId={proposal.proposalId} />
                </div>
            )}
        </>
    );
}