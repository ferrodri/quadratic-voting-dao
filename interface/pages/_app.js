import '../styles/globals.css';
import * as React from 'react';
import { WagmiConfig, chain, configureChains, createClient } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { provider, webSocketProvider } = configureChains(
    [chain.hardhat],
    [
        jsonRpcProvider({
            rpc: () => ({
                http: 'http://127.0.0.1:8545/'
            })
        })
    ]
);

const client = createClient({
    connectors: [new InjectedConnector({ chains: [chain.hardhat] })],
    provider,
    webSocketProvider
});

function App({ Component, pageProps }) {
    return (
        <WagmiConfig client={client}>
            <Component {...pageProps} />
        </WagmiConfig>
    );
}

export default App;