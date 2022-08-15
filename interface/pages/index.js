import Head from 'next/head';
import * as React from 'react';
import { useAccount } from 'wagmi';
import {
    Account, AvailableVotingPower, Connect, DAOModerators, ListProposals,
    ProposeForm, TotalVotingPower
} from '../components';
import { useIsMounted } from '../hooks';
import { Container } from '@chakra-ui/react';

function Home() {
    const isMounted = useIsMounted();
    const { isConnected } = useAccount();

    return (
        <>
            <Head>
                <title>Quadratic voting DAO</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Container maxH='100vh' centerContent>
                    <h1>
                        Welcome to quadratic voting DAO
                    </h1>
                    <>
                        <Connect />
                        <DAOModerators />

                        {isMounted && isConnected
                            ? (
                                <>
                                    <Account />
                                    <TotalVotingPower />
                                    <AvailableVotingPower>
                                        <ListProposals onlyActive />
                                    </AvailableVotingPower>
                                    <ProposeForm />
                                </>
                            )
                            : <ListProposals />
                        }
                    </>
                </Container>
            </main>
        </>
    );
}

export default Home;