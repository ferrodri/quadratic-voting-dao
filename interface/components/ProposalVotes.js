import { useState } from 'react';
import { useContractRead } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { GovernorContractAddress } from '../shared/constants';

export function ProposalVotes({ proposalId }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [abstainVotes, setAbstainVotes] = useState(0);
    const [againstVotes, setAgainstVotes] = useState(0);
    const [forVotes, setForVotes] = useState(0);


    useContractRead({
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'proposalVotes',
        args: proposalId,
        onSuccess(data) {
            const {
                abstainVotes: _abstainVotes,
                againstVotes: _againstVotes,
                forVotes: _forVotes
            } = data;
            setAbstainVotes(_abstainVotes.toNumber());
            setAgainstVotes(_againstVotes.toNumber());
            setForVotes(_forVotes.toNumber());
            setIsLoading(false);
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        },
        watch: true
    });

    return (
        <>
            {error && error}
            {isLoading && <span>Loading proposal votes ...</span>}
            <span>Abstain votes {abstainVotes}</span>
            <span>Against votes {againstVotes}</span>
            <span>For votes {forVotes}</span>
        </>
    );
}