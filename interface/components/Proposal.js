import {
    Box,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Select,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { BigNumber } from 'ethers';
import * as Yup from 'yup';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import {
    GovernorContractAddress, supportEnum, proposalStateEnum
} from '../shared/constants';
import { ProposalBlockTimestamp, ProposalVotes } from './index';

export function Proposal({ proposal, availableVoting = 0 }) {
    const { address } = useAccount();
    const [isLoading, setIsLoading] = useState(true);
    const [proposalState, setProposalState] = useState('');
    const [error, setError] = useState('');
    const [hasVoted, setHasVoted] = useState(false);

    const { deadline, description, snapshot, proposalId } = proposal;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const _availableVoting = Math.floor(Math.sqrt(availableVoting));
    const votingWeightOptions = [...Array(_availableVoting).keys()]
        .map(e => e.toString());
    const supportOptions = Object.keys(supportEnum);

    const VotingSchema = Yup.object().shape({
        support: Yup.string().oneOf(supportOptions).required('Required'),
        votingWeight: Yup.string().oneOf(votingWeightOptions).required('Required')
    });

    useContractRead({
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'state',
        args: proposalId,
        onSuccess(data) {
            setIsLoading(false);
            if (data) {
                setProposalState(proposalStateEnum[data]);
            };
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        },
        watch: true
    });

    useContractRead({
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'hasVoted',
        args: [proposalId, address],
        onSuccess(data) {
            setHasVoted(data);
        },
        watch: true
    });

    const { write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'vote',
        onSuccess() {
            setHasVoted(true);
            toast({
                title: 'Vote submitted succesfully',
                status: 'success',
                duration: 9000,
                isClosable: true
            });
        },
        onError(error) {
            toast({
                title: 'Error casting your vote',
                description: (error.message ? error.message : JSON.stringify(error)),
                status: 'error',
                duration: 9000,
                containerStyle: {
                    maxHeight: '500px'
                },
                isClosable: true
            });
        }
    });

    const canVote = proposalState === 'Active' && !hasVoted && _availableVoting !== 0;

    function handleVote() {
        if (canVote) { onOpen(); }
    }

    return (
        <>
            {error && error}
            {isLoading && <span>Loading proposal state ...</span>}
            <Box
                border='1px solid #2d2d2d'
                margin='12px'
                padding='24px'
                borderRadius='12px'
                cursor={canVote ? 'pointer' : address ? 'not-allowed' : 'auto'}
                _hover={{
                    border: canVote ? '1px solid white' : 'auto'
                }}
                onClick={handleVote}
            >
                <span>Proposal Id: {proposalId.toString()}</span>
                <span>Proposal description: {description}</span>
                <ProposalBlockTimestamp blockTimestamp={snapshot} />
                <ProposalBlockTimestamp blockTimestamp={deadline} deadline />
                <span>Proposal state: {proposalState}</span>
                <ProposalVotes proposalId={proposalId} />
                {hasVoted && <span>You have already voted for this proposal</span>}
            </Box>
            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay
                    bg='#211f24'
                    backdropFilter='auto'
                    backdropInvert='80%'
                    backdropBlur='2px'
                />
                <ModalContent bg='#211f24' border='white 1px solid'>
                    <ModalHeader>Vote for the proposal {proposalId.toString()}</ModalHeader>
                    <ModalCloseButton />
                    <Formik
                        initialValues={{
                            support: '',
                            votingWeight: ''
                        }}
                        validationSchema={VotingSchema}
                        onSubmit={(values, actions) => {
                            let { support, votingWeight } = values;
                            support = BigNumber.from(support);
                            votingWeight = BigNumber.from(votingWeight);

                            write({
                                recklesslySetUnpreparedArgs: [
                                    proposalId,
                                    votingWeight,
                                    support
                                ]
                            });
                            actions.setSubmitting(false);
                            onClose();
                        }}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <ModalBody pb={6}>

                                    <Field name='support'>
                                        {({ field }) => (
                                            <FormControl>
                                                <FormLabel>Your support for this proposal</FormLabel>
                                                <Select
                                                    id='support'
                                                    onChange={field.onChange}
                                                >
                                                    {supportOptions.map((key, i) =>
                                                        <option key={i} value={key}>
                                                            {supportEnum[key]}
                                                        </option>
                                                    )}
                                                </Select>
                                                {
                                                    errors.support
                                                    && touched.support
                                                    && <span>{errors.support}</span>
                                                }
                                            </FormControl>
                                        )}
                                    </Field>

                                    <Field name='votingWeight'>
                                        {({ field }) => (
                                            <FormControl>
                                                <FormLabel>Your voting weight for this proposal</FormLabel>
                                                <Select
                                                    id='votingWeight'
                                                    onChange={field.onChange}
                                                >
                                                    {votingWeightOptions.map((weight) =>
                                                        <option key={weight} value={weight}>
                                                            {weight}
                                                        </option>
                                                    )}
                                                </Select>
                                                {
                                                    errors.votingWeight
                                                    && touched.votingWeight
                                                    && <span>{errors.votingWeight}</span>
                                                }
                                            </FormControl>
                                        )}
                                    </Field>

                                </ModalBody>

                                <ModalFooter>
                                    <button type='submit'>Submit</button>
                                </ModalFooter>
                            </Form>
                        )}
                    </Formik>
                </ModalContent>
            </Modal>
        </>

    );
}