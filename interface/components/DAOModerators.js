import { useState } from 'react';
import { useContractRead } from 'wagmi';
import DAOModeratorsABI from '../../contracts/artifacts/contracts/DAOModerators.sol/DAOModerators.json';
import { DAOModeratorsAddress } from '../shared/constants';
import { Heading, Grid, GridItem } from '@chakra-ui/react';

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
        },
        watch: true
    });

    return (
        <>
            {
                error && <span className='error'>
                    Error: {error.message ? error.message : JSON.stringify(error)}
                </span>
            }
            {isLoading && <span>Loading DAO Moderators ...</span>}
            <Heading
                as='h2'
                size='lg'
                noOfLines={1}
                padding='16px 0'
                textAlign='center'
            >
                Current DAO moderators
            </Heading>
            {data.length > 0 && data.map((moderator, i) =>
                <Grid
                    templateColumns='repeat(12, 1fr)'
                    gap={4}
                    key={i}
                    border='1px solid #2d2d2d'
                    margin='12px'
                    padding='24px'
                    borderRadius='12px'
                    alignItems='center'
                >
                    <GridItem>
                        <span style={{ fontSize: '48px' }}>{i + 1}</span>
                    </GridItem>
                    <GridItem colSpan={9} >
                        <p><b>Name:</b> {moderator.name}</p>
                        <p><b>Email:</b> {moderator.email}</p>
                        <p><b>Wallet Address:</b> {moderator.moderatorAddress}</p>
                    </GridItem>
                </Grid>
            )}
        </>
    );
}