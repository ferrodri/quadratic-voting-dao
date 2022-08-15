import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useIsMounted } from '../hooks';

export function Connect() {
    const isMounted = useIsMounted();
    const { connector, isConnected } = useAccount();
    const { connect, connectors, error, isLoading, pendingConnector } =
        useConnect();
    const { disconnect } = useDisconnect();

    return (
        <>
            <>
                {isConnected && (
                    <button onClick={() => disconnect()}>
                        Logout
                    </button>
                )}

                {connectors
                    .filter((x) => isMounted && x.ready && x.id !== connector?.id)
                    .map((x) => (
                        <button key={x.id} onClick={() => connect({ connector: x })}>
                            Connect with {x.name}
                            {isLoading && x.id === pendingConnector?.id && ' (connecting)'}
                        </button>
                    ))}
            </>

            {error && <div>{error.message}</div>}
        </>
    );
}