import Head from 'next/head';
import * as React from 'react';
import { useAccount } from 'wagmi';
import {
    AvailableVotingPower, DAOModerators, Header, ListProposals
} from '../components';
import { useIsMounted } from '../hooks';
import { Heading, Grid, GridItem } from '@chakra-ui/react';

function Home() {
    const isMounted = useIsMounted();
    const { isConnected } = useAccount();

    return (
        <>
            <Head>
                <title>Quadratic voting DAO</title>
                <meta name="description" content="Election of the moderators of the DAO through quadratic voting" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />

            <main>
                <Grid
                    templateColumns='repeat(12, 1fr)'
                    width='100vw'
                    height='100vh'
                >
                    <GridItem colSpan={1} />
                    <GridItem
                        colSpan={5}
                        borderRight='1px solid #2d2d2d'
                        padding='0 16px 16px 16px'
                    >
                        <DAOModerators />
                    </GridItem>

                    <GridItem colSpan={5} padding='0 16px 16px 16px'>

                        {isMounted && isConnected
                            ? (
                                <>
                                    <Heading
                                        as='h2'
                                        size='lg'
                                        noOfLines={1}
                                        padding='16px 0'
                                        textAlign='center'
                                    >
                                        Active or successful proposals
                                    </Heading>
                                    <AvailableVotingPower>
                                        <ListProposals onlyActive />
                                    </AvailableVotingPower>
                                    <ListProposals onlySuccessful />
                                </>
                            )
                            : <>
                                <Heading
                                    as='h2'
                                    size='lg'
                                    noOfLines={1}
                                    padding='16px 0'
                                    textAlign='center'
                                >
                                    DAO proposals
                                </Heading>
                                <ListProposals />
                            </>
                        }
                    </GridItem>
                    <GridItem colSpan={1} />
                </Grid>
            </main>
        </>
    );
}

export default Home;