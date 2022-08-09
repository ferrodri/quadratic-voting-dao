import { useState } from 'react';
import { useContractRead } from 'wagmi';
import DAOModeratorsABI from '../../contracts/artifacts/contracts/DAOModerators.sol/DAOModerators.json';
import { DAOModeratorsAddress } from '../shared/constants';

export function DAOModerators() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useContractRead({
        addressOrName: DAOModeratorsAddress,
        contractInterface: DAOModeratorsABI.abi,
        functionName: 'getModerators',
        onSuccess(data) {
            setIsLoading(false);
            setData(data);
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        }
        // TODO: frh -> styles and test if needed watch: true
    });

    return (
        <>
            {error && error}
            {isLoading && <span>Loading DAO Moderators ...</span>}
            {data.length > 0 && data.map((moderator, i) =>
                <div key={i}>
                    <span>Name: {moderator.name}</span>
                    <span>Email: {moderator.email}</span>
                    <span>Address: {moderator.moderatorAddress}</span>
                </div>
            )}
        </>
    );
}