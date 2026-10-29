import React, { useState, useEffect, useContext } from 'react';

import { Box, styled, TextareaAutosize, Button, FormControl, InputBase, TextField, Typography } from '@mui/material';
import { AddCircle as Add } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '../../service/api';
import { DataContext } from '../../context/DataProvider';

const Container = styled(Box)(({ theme }) => ({
    margin: '50px 100px',
    [theme.breakpoints.down('md')]: {
        margin: 0
    }
}));

const Image = styled('img')({
    width: '100%',
    height: '50vh',
    objectFit: 'cover'
});

const StyledFormControl = styled(FormControl)`
    margin-top: 10px;
    display: flex;
    flex-direction: row;
`;

const InputTextField = styled(InputBase)`
    flex: 1;
    margin: 0 30px;
    font-size: 25px;
`;

const StyledTextArea = styled(TextareaAutosize)`
    width: 100%;
    border: none;
    margin-top: 50px;
    font-size: 18px;
    &:focus-visible {
        outline: none;
    }
`;

const TagsRow = styled(Box)`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    & > div {
        flex: 1;
        min-width: 200px;
    }
`;

const initialPost = {
    title: '',
    description: '',
    picture: '',
    username: '',
    company: '',
    role: '',
    categories: 'Tech',
    createdDate: new Date()
}

const Update = () => {
    const navigate = useNavigate();

    const [post, setPost] = useState(initialPost);
    const [file, setFile] = useState('');
    const [error, setError] = useState('');
    const { account } = useContext(DataContext);

    const { id } = useParams();

    const url = 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80';
    
    useEffect(() => {
        const fetchData = async () => {
            let response = await API.getPostById(id);
            if (response.isSuccess) {
                setPost(response.data);
            }
        }
        fetchData().catch(() => {});
    }, [id]);

    useEffect(() => {
        const getImage = async () => { 
            if(file) {
                const data = new FormData();
                data.append("name", file.name);
                data.append("file", file);
                
                try {
                    const response = await API.uploadFile(data);
                    setError('');
                    setPost(prev => ({ ...prev, picture: response.data }));
                } catch (error) {
                    const { serverMsg } = (await error) || {};
                    setError(serverMsg || 'Image upload failed');
                }
            }
        }
        getImage();
    }, [file])

    const updateBlogPost = async () => {
        try {
            await API.updatePost(post);
            navigate(`/details/${id}`);
        } catch (error) {
            const { serverMsg } = (await error) || {};
            setError(serverMsg || 'Could not update the post');
        }
    }

    const handleChange = (e) => {
        setPost({ ...post, [e.target.name]: e.target.value });
    }

    if (post._id && post.username !== account.username) {
        return <Container><Typography color="error">You can only edit your own posts.</Typography></Container>;
    }

    return (
        <Container>
            <Image src={post.picture || url} alt="post" />

            <StyledFormControl>
                <label htmlFor="fileInput">
                    <Add fontSize="large" color="action" />
                </label>
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <InputTextField onChange={(e) => handleChange(e)} value={post.title} name='title' placeholder="Title" />
                <Button onClick={() => updateBlogPost()} variant="contained" color="primary">Update</Button>
            </StyledFormControl>

            <TagsRow>
                <TextField variant="standard" onChange={(e) => handleChange(e)} value={post.company || ''} name='company' label='Company (e.g. Google)' />
                <TextField variant="standard" onChange={(e) => handleChange(e)} value={post.role || ''} name='role' label='Role / Job title (e.g. Software Engineer)' />
            </TagsRow>

            {error && <Typography color="error" style={{ marginTop: 10 }}>{error}</Typography>}

            <StyledTextArea
                rowsMin={5}
                placeholder="Share your experience, advice or opening..."
                name='description'
                onChange={(e) => handleChange(e)} 
                value={post.description}
            />
        </Container>
    )
}

export default Update;