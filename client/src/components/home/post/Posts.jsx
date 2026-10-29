import { useEffect, useState } from 'react';

import { Grid, Box } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';

// import { getAllPosts } from '../../../service/api';
import { API } from '../../../service/api';

//components
import Post from './Post';

const Posts = ({ username: profileUsername }) => {
    const [posts, getPosts] = useState([]);
    
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const username = profileUsername || searchParams.get('username');
    const company = searchParams.get('company');
    const role = searchParams.get('role');

    useEffect(() => {
        const fetchData = async () => { 
            let response = await API.getAllPosts({ category : category || '', username: username || '', company: company || '', role: role || '' });
            if (response.isSuccess) {
                getPosts(response.data);
            }
        }
        fetchData().catch(() => {});
    }, [category, username, company, role]);

    return (
        <>
            {
                posts?.length ? posts.map(post => (
                    <Grid item lg={3} sm={4} xs={12} key={post._id}>
                        <Link style={{textDecoration: 'none', color: 'inherit'}} to={`/details/${post._id}`}>
                            <Post post={post} />
                        </Link>
                    </Grid>
                )) : <Box style={{color: '878787', margin: '30px 80px', fontSize: 18}}>
                        No posts match the selected filters
                    </Box>
            }
        </>
    )
}

export default Posts;