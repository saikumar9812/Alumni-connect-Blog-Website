import React, { useState, useEffect, useContext } from 'react';

import { TextField, Box, Button, Typography, styled, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { API } from '../../service/api';
import { DataContext } from '../../context/DataProvider';

const Component = styled(Box)`
    width: 400px;
    margin: auto;
    box-shadow: 5px 2px 5px 2px rgb(0 0 0/ 0.6);
`;

const Brand = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px 0 0;
    color: #2874f0;
`;

const Wrapper = styled(Box)`
    padding: 25px 35px;
    display: flex;
    flex: 1;
    overflow: auto;
    flex-direction: column;
    & > div, & > button, & > p {
        margin-top: 20px;
    }
`;

const LoginButton = styled(Button)`
    text-transform: none;
    background: #FB641B;
    color: #fff;
    height: 48px;
    border-radius: 2px;
`;

const SignupButton = styled(Button)`
    text-transform: none;
    background: #fff;
    color: #2874f0;
    height: 48px;
    border-radius: 2px;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 20%);
`;

const Text = styled(Typography)`
    color: #878787;
    font-size: 12px;
`;

const Error = styled(Typography)`
    font-size: 10px;
    color: #ff6161;
    line-height: 0;
    margin-top: 10px;
    font-weight: 600;
`

const loginInitialValues = {
    username: '',
    password: ''
};

const signupInitialValues = {
    name: '',
    username: '',
    password: '',
    role: '',
    graduationYear: '',
    currentCompany: '',
    currentRole: ''
};

const Login = ({ isUserAuthenticated }) => {
    const [login, setLogin] = useState(loginInitialValues);
    const [signup, setSignup] = useState(signupInitialValues);
    const [error, showError] = useState('');
    const [account, toggleAccount] = useState('login');

    const navigate = useNavigate();
    const { setAccount } = useContext(DataContext);

    useEffect(() => {
        showError(false);
    }, [login])

    const onValueChange = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value });
    }

    const onInputChange = (e) => {
        setSignup({ ...signup, [e.target.name]: e.target.value });
    }

    const loginUser = async () => {
        let response;
        try {
            response = await API.userLogin(login);
        } catch (error) {
            const { serverMsg } = (await error) || {};
            return showError(serverMsg || 'Something went wrong! please try again later');
        }
        if (response.isSuccess) {
            showError('');

            sessionStorage.setItem('accessToken', `Bearer ${response.data.accessToken}`);
            sessionStorage.setItem('refreshToken', `Bearer ${response.data.refreshToken}`);
            setAccount({ name: response.data.name, username: response.data.username, role: response.data.role });
            
            isUserAuthenticated(true)
            setLogin(loginInitialValues);
            navigate('/');
        } else {
            showError('Something went wrong! please try again later');
        }
    }

    const signupUser = async () => {
        if (!signup.name || !signup.username || !signup.password) {
            return showError('Name, username and password are required');
        }
        if (!signup.role) {
            return showError('Please choose whether you are an alumnus or a current student');
        }
        try {
            let response = await API.userSignup(signup);
            if (response.isSuccess) {
                showError('');
                setSignup(signupInitialValues);
                toggleAccount('login');
            } else {
                showError('Something went wrong! please try again later');
            }
        } catch (error) {
            const { serverMsg } = (await error) || {};
            showError(serverMsg || 'Something went wrong! please try again later');
        }
    }

    const toggleSignup = () => {
        account === 'signup' ? toggleAccount('login') : toggleAccount('signup');
    }

    return (
        <Component>
            <Box>
                <Brand>
                    <School style={{ fontSize: 60 }} />
                    <Typography variant="h5">Alumni Connect</Typography>
                </Brand>
                {
                    account === 'login' ?
                        <Wrapper>
                            <TextField variant="standard" value={login.username} onChange={(e) => onValueChange(e)} name='username' label='Enter Username' />
                            <TextField variant="standard" value={login.password} onChange={(e) => onValueChange(e)} name='password' type='password' label='Enter Password' />

                            {error && <Error>{error}</Error>}

                            <LoginButton variant="contained" onClick={() => loginUser()} >Login</LoginButton>
                            <Text style={{ textAlign: 'center' }}>OR</Text>
                            <SignupButton onClick={() => toggleSignup()} style={{ marginBottom: 50 }}>Create an account</SignupButton>
                        </Wrapper> :
                        <Wrapper>
                            <TextField variant="standard" value={signup.name} onChange={(e) => onInputChange(e)} name='name' label='Enter Name' />
                            <TextField variant="standard" value={signup.username} onChange={(e) => onInputChange(e)} name='username' label='Enter Username' />
                            <TextField variant="standard" value={signup.password} onChange={(e) => onInputChange(e)} name='password' type='password' label='Enter Password' />

                            <FormControl>
                                <FormLabel>I am</FormLabel>
                                <RadioGroup row name='role' value={signup.role} onChange={(e) => onInputChange(e)}>
                                    <FormControlLabel value='alumni' control={<Radio />} label='Alumni' />
                                    <FormControlLabel value='student' control={<Radio />} label='Current Student' />
                                </RadioGroup>
                            </FormControl>
                            {
                                signup.role &&
                                <TextField variant="standard" type='number' value={signup.graduationYear} onChange={(e) => onInputChange(e)} name='graduationYear' 
                                    label={signup.role === 'alumni' ? 'Graduation Year' : 'Expected Graduation Year'} />
                            }
                            {
                                signup.role === 'alumni' && 
                                <>
                                    <TextField variant="standard" value={signup.currentCompany} onChange={(e) => onInputChange(e)} name='currentCompany' label='Current Company' />
                                    <TextField variant="standard" value={signup.currentRole} onChange={(e) => onInputChange(e)} name='currentRole' label='Current Role / Job Title' />
                                </>
                            }

                            {error && <Error>{error}</Error>}

                            <SignupButton onClick={() => signupUser()} >Signup</SignupButton>
                            <Text style={{ textAlign: 'center' }}>OR</Text>
                            <LoginButton variant="contained" onClick={() => toggleSignup()}>Already have an account</LoginButton>
                        </Wrapper>
                }
            </Box>
        </Component>
    )
}

export default Login;