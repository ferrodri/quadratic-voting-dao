import * as React from 'react';
import { useAccount } from 'wagmi';
import { Connect, ProposeForm } from '../components';
import { Heading, Grid, GridItem } from '@chakra-ui/react';

export function Header() {
    const { isConnected } = useAccount();

    return (
        <Grid
            templateColumns='repeat(12, 1fr)'
            gap={4}
            width='100vw'
            padding='16px 0'
            borderBottom='1px solid #2d2d2d'
            alignItems='center'
        >
            <GridItem colSpan={1} />
            <GridItem colSpan={3}>
                <Heading as='h1' size='md' noOfLines={1}>
                    Quadratic Voting DAO
                </Heading>
            </GridItem>
            <GridItem colSpan={2}>
            </GridItem>
            <GridItem
                colSpan={5}
                display='flex'
                justifyContent='flex-end'
            >
                {isConnected && <ProposeForm />}
                <Connect />
            </GridItem>
            <GridItem colSpan={1} />
        </Grid>
    );
}