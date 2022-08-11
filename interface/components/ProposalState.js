import { useState } from 'react';
import { useContractRead } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { GovernorContractAddress, proposalStateEnum } from '../shared/constants';

export function ProposalState({ proposalId }) {
    const [isLoading, setIsLoading] = useState(true);
    const [proposalState, setProposalState] = useState('');
    const [error, setError] = useState('');

    useContractRead({
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'state',
        args: proposalId,
        onSuccess(data) {
            setIsLoading(false);
            if (data) {
                setProposalState(proposalStateEnum[data]);
            };
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        }
    });

    return (
        <>
            {error && error}
            {isLoading && <span>Loading proposal state ...</span>}
            <span>Proposal state: {proposalState}</span>
        </>
    );
}