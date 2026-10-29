import { useState, useEffect } from 'react';

import { Box, Typography, Grid, styled } from '@mui/material';
import { useParams } from 'react-router-dom';

import { API } from '../../service/api';

//components
import RoleBadge from '../common/RoleBadge';
import Posts from '../home/post/Posts';

const Container = styled(Box)(({ theme }) => ({
    margin: '50px 100px',
    [theme.breakpoints.down('md')]: {
        margin: '20px'
    }
}));

const Header = styled(Box)`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const Text = styled(Typography)`
    color: #878787;
    margin-top: 5px;
`;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const { username } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await API.getUserProfile(username);
                if (response.isSuccess) {
                    setUser(response.data);
                }
            } catch (error) {
                setError('User not found');
            }
        }
        fetchData();
    }, [username]);

    if (error) return <Container><Typography>{error}</Typography></Container>;
    if (!user) return null;

    return (
        <Container>
            <Header>
                <Typography variant="h4">{user.name}</Typography>
                <RoleBadge role={user.role} />
            </Header>
            <Text>@{user.username}</Text>
            {
                user.role === 'alumni' ?
                    <>
                        { user.graduationYear && <Text>Class of {user.graduationYear}</Text> }
                        { (user.currentRole || user.currentCompany) &&
                            <Text>{[user.currentRole, user.currentCompany].filter(Boolean).join(' at ')}</Text> }
                    </> :
                    user.graduationYear && <Text>Expected graduation: {user.graduationYear}</Text>
            }

            <Typography variant="h5" style={{ marginTop: 40 }}>Posts</Typography>
            <Grid container>
                <Posts username={user.username} />
            </Grid>
        </Container>
    )
}

export default Profile;
