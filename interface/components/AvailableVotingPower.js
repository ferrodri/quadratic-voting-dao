import { useState } from 'react';
import { useContractRead } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { GovernorContractAddress } from '../shared/constants';

export function AvailableVotingPower() {
    const [isLoading, setIsLoading] = useState(true);
    const [availableVoting, setAvailableVoting] = useState(0);
    const [error, setError] = useState('');

    useContractRead({
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'getAvailableVotingPower',
        onSuccess(data) {
            setIsLoading(false);
            setAvailableVoting(data.toNumber());
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        }
    });

    return (
        <>
            {error && error}
            {isLoading && <span>Loading available voting power...</span>}
            <span>Available voting power: {availableVoting} votes</span>
        </>
    );
}