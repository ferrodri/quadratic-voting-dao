import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Heading } from '@chakra-ui/react';
import { useBlockNumber, useContractRead, useProvider } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { GovernorContractAddress } from '../shared/constants';
import { Proposal } from './index';

export function ListProposals({ onlyActive, availableVoting }) {
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
            <Heading as='h2' size='lg' noOfLines={1} padding='16px 0' textAlign='center'>
                {onlyActive ? 'Active proposals' : 'DAO proposals'}
            </Heading>
            {proposals.length > 0 && proposals.map((proposal, i) =>
                <Proposal
                    key={i}
                    proposal={proposal}
                    availableVoting={availableVoting}
                />
            )}
        </>
    );
}