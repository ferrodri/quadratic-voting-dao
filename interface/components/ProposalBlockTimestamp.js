import { useEffect, useState } from 'react';
import { useProvider, useBlockNumber } from 'wagmi';;
import { TimeIcon } from '@chakra-ui/icons';

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
            <p>
                <TimeIcon />
                {blockNumber > _blockTimestamp
                    ? `${deadline ? ' Ended' : ' Started'} on ${timestamp}`
                    : ` Proposal will ${deadline ? 'end' : 'start'} in ${_blockTimestamp - blockNumber} blocks`
                }
            </p>
        </>
    );
}