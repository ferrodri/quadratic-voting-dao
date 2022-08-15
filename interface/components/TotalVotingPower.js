import { useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import GovernanceTokenABI from '../../contracts/artifacts/contracts/GovernanceToken.sol/GovernanceToken.json';
import { GovernanceTokenAddress } from '../shared/constants';

export function TotalVotingPower() {
    const { address } = useAccount();
    const [isLoading, setIsLoading] = useState(true);
    const [totalVoting, setTotalVoting] = useState(0);
    const [error, setError] = useState('');

    useContractRead({
        addressOrName: GovernanceTokenAddress,
        contractInterface: GovernanceTokenABI.abi,
        functionName: 'balanceOf',
        args: address,
        onSuccess(data) {
            setIsLoading(false);
            setTotalVoting(data.toNumber());
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
            {isLoading && <span>Loading total voting power balance ...</span>}
            <span>Total voting power: {totalVoting} votes</span>
        </>
    );
}