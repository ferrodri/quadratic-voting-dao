import { useEffect, useState } from 'react';
import { useProvider, useBlockNumber } from 'wagmi';;

export function ProposalBlockTimestamp({ blockTimestamp, deadline }) {
    const _blockTimestamp = blockTimestamp._isBigNumber
        ? blockTimestamp.toNumber() : blockTimestamp;
    const provider = useProvider();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const [timestamp, setTimestamp] = useState('');

    useEffect(() => {
        if (blockNumber > _blockTimestamp) {
            provider.getBlock(_blockTimestamp).then(block => {
                const _timestamp = new Date(block.timestamp).toDateString();
                setTimestamp(_timestamp);
            });
        }
    }, [_blockTimestamp, blockNumber, provider]);

    return (
        <>
            <span>
                {blockNumber > _blockTimestamp
                    ? `Proposal ${deadline ? 'ended' : 'started'} on ${timestamp}`
                    : `Proposal will ${deadline ? 'end' : 'start'} on block ${_blockTimestamp}, current block number ${blockNumber}`
                }
            </span>
        </>
    );
}