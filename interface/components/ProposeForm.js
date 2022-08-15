import {
    FormControl,
    FormLabel,
    Input,
    Container,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { useContractWrite } from 'wagmi';
import { ethers } from 'ethers';
import * as Yup from 'yup';
import GovernorContractABI from '../../contracts/artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import DAOModeratorsABI from '../../contracts/artifacts/contracts/DAOModerators.sol/DAOModerators.json';
import { GovernorContractAddress, DAOModeratorsAddress } from '../shared/constants';

const ProposeSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    moderatorAddress: Yup
        .string()
        // TODO: frh -> improve wallet address regex
        .matches(/^0x[a-fA-F0-9]{40}$/g, 'Wallet address not correct')
        .required('Required')
});

const getCalldata = (name, email, moderatorAddress) => {
    const _interface = new ethers.utils.Interface(DAOModeratorsABI.abi);
    return _interface.encodeFunctionData(
        'setNewModerator', [name, email, moderatorAddress]
    );
};


export function ProposeForm() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const { write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        addressOrName: GovernorContractAddress,
        contractInterface: GovernorContractABI.abi,
        functionName: 'propose',
        onSuccess() {
            toast({
                title: 'Proposal submitted correctly!',
                status: 'success',
                duration: 9000,
                containerStyle: {
                    maxHeight: '500px'
                },
                isClosable: true
            });
        },
        onError(error) {
            toast({
                title: 'Error submitting the proposal',
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

    return (
        <>
            <Container centerContent margin='32px auto'>
                Propose a new moderator for the DAO
                <button onClick={onOpen}>Propose</button>
            </Container>
            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay
                    bg='#211f24'
                    backdropFilter='auto'
                    backdropInvert='80%'
                    backdropBlur='2px'
                />
                <ModalContent bg='#211f24' border='white 1px solid'>
                    <ModalHeader>Propose a new moderator for the DAO</ModalHeader>
                    <ModalCloseButton />
                    <Formik
                        initialValues={{
                            name: '',
                            email: '',
                            moderatorAddress: '',
                        }}
                        validationSchema={ProposeSchema}
                        onSubmit={(values, actions) => {
                            const {
                                name,
                                email,
                                moderatorAddress,
                            } = values;
                            write({
                                recklesslySetUnpreparedArgs: [
                                    [DAOModeratorsAddress],
                                    [0],
                                    [getCalldata(name, email, moderatorAddress)],
                                    `Proposing moderator ${name} with email ${email} and wallet address ${moderatorAddress}`
                                ]
                            });
                            actions.setSubmitting(false);
                            onClose();
                        }}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <ModalBody pb={6}>

                                    <Field name='name'>
                                        {({ field }) => (
                                            <FormControl>
                                                <FormLabel>Name</FormLabel>
                                                <Input
                                                    {...field}
                                                    placeholder='Name'
                                                />
                                                {
                                                    errors.name
                                                    && touched.name
                                                    && <span>{errors.name}</span>
                                                }
                                            </FormControl>
                                        )}
                                    </Field>

                                    <Field name='email'>
                                        {({ field }) => (
                                            <FormControl mt={4}>
                                                <FormLabel>Email</FormLabel>
                                                <Input
                                                    {...field}
                                                    placeholder='Email'
                                                />
                                                {
                                                    errors.email
                                                    && touched.email
                                                    && <span>{errors.email}</span>
                                                }
                                            </FormControl>
                                        )}
                                    </Field>


                                    <Field name='moderatorAddress'>
                                        {({ field }) => (
                                            <FormControl>
                                                <FormLabel>Wallet address</FormLabel>
                                                <Input
                                                    {...field}
                                                    placeholder='Wallet address'
                                                />
                                                {
                                                    errors.moderatorAddress
                                                    && touched.moderatorAddress
                                                    && <span>{errors.moderatorAddress}</span>
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
};