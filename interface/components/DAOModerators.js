import { useState } from 'react';
import { useContractRead } from 'wagmi';
import DAOModeratorsABI from '../../contracts/artifacts/contracts/DAOModerators.sol/DAOModerators.json';

export function DAOModerators() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useContractRead({
        addressOrName: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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
            {data.length > 0 && data.map(moderator =>
                <>
                    <span>Name: {moderator.name}</span>
                    <span>Email: {moderator.email}</span>
                    <span>Address: {moderator.moderatorAddress}</span>
                </>
            )}
        </>
    );
}