import React from 'react';
import { useState } from 'react';
import { useContractRead } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { GovernorContractAddress } from '../shared/constants';

export function AvailableVotingPower({ children }) {
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
        },
        watch: true
    });

    return (
        <>
            {error && error}
            {isLoading && <span>Loading available voting power...</span>}
            {React.cloneElement(children, { availableVoting: availableVoting })}
        </>
    );
}