import {
    Box,
    Container,
    FormControl,
    FormLabel,
    Grid,
    GridItem,
    Heading,
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
import { CheckIcon, InfoIcon, UnlockIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { BigNumber, ethers } from 'ethers';
import * as Yup from 'yup';
import { useContractRead, useContractWrite } from 'wagmi';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import {
    DAOModeratorsAddress, GovernorContractAddress, supportEnum, proposalStateEnum
} from '../shared/constants';
import { ProposalBlockTimestamp, ProposalVotes, TotalVotingPower } from './index';

export function Proposal(
    { availableVoting = 0, hasVoted = false, proposal, onlySuccessful, }
) {
    const [isLoading, setIsLoading] = useState(true);
    const [proposalState, setProposalState] = useState('');
    const [error, setError] = useState('');

    const { calldatas, deadline, description, proposalId, snapshot } = proposal;
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
            if (data || data === 0) {
                setProposalState(proposalStateEnum[data]);
            };
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
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

    const descriptionHash = ethers.utils.id(description);

    const { write: execute } = useContractWrite({
        mode: 'recklesslyUnprepared',
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'execute',
        onSuccess() {
            setHasVoted(true);
            toast({
                title: 'Proposal executed succesfully',
                status: 'success',
                duration: 9000,
                isClosable: true
            });
        },
        onError(error) {
            toast({
                title: 'Error executing proposal',
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
            {
                (
                    (onlySuccessful && proposalState === 'Succeeded')
                    || !onlySuccessful
                )
                && <Box
                    border='1px solid #2d2d2d'
                    margin='12px'
                    padding='24px'
                    borderRadius='12px'
                >
                    <Heading as='h3' size='sm' marginBottom='16px'>
                        {description}
                    </Heading>
                    <Grid templateColumns='repeat(12, 1fr)' gap={4} >
                        <GridItem colSpan={6} >
                            <ProposalVotes proposalId={proposalId} />
                        </GridItem>
                        <GridItem colSpan={6} >
                            <ProposalBlockTimestamp blockTimestamp={snapshot} />
                            <ProposalBlockTimestamp blockTimestamp={deadline} deadline />
                            <p>
                                <InfoIcon /> {proposalState}
                            </p>
                            {
                                hasVoted && <p>
                                    <CheckIcon color='blue' /> Vote casted
                                </p>
                            }
                        </GridItem>
                    </Grid>

                    {
                        canVote &&
                        <Container display='flex' justifyContent='space-around' marginTop='16px'>
                            <div>
                                <TotalVotingPower />
                                <p><UnlockIcon /> <b>Available votes:</b> {availableVoting} votes</p>
                            </div>
                            <button className='primary-button' onClick={handleVote}>
                                Vote
                            </button>
                        </Container>
                    }
                    {
                        onlySuccessful && proposalState === 'Succeeded'
                        && <Container display='flex' justifyContent='center' marginTop='16px'>
                            <button className='primary-button'
                                onClick={() => execute({
                                    recklesslySetUnpreparedArgs: [
                                        [DAOModeratorsAddress],
                                        [0],
                                        calldatas,
                                        descriptionHash
                                    ]
                                })}
                            >
                                Execute proposal
                            </button>
                        </Container>
                    }
                </Box>
            }
            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay
                    bg='#211f24'
                    backdropFilter='auto'
                    backdropInvert='80%'
                    backdropBlur='2px'
                />
                <ModalContent bg='#211f24' border='white 1px solid'>
                    <ModalHeader>
                        Vote for &quot;{description.substring(0, 80)}{description.length > 80 && '...'}&quot;
                    </ModalHeader>
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