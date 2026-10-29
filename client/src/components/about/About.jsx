
import { Box, styled, Typography } from '@mui/material';

const Banner = styled(Box)`
    background-image: url(https://www.wallpapertip.com/wmimgs/23-236943_us-wallpaper-for-website.jpg);
    width: 100%;
    height: 50vh;
    background-position: left 0px bottom 0px;
    background-size: cover;
`;

const Wrapper = styled(Box)`
    padding: 20px;
    & > h3, & > h5 {
        margin-top: 50px;
    }
`;

const Text = styled(Typography)`
    color: #878787;
`;

const About = () => {

    return (
        <Box>
            <Banner/>
            <Wrapper>
                <Typography variant="h3">About Alumni Connect</Typography>
                <Text variant="h5">Alumni Connect brings graduates and current students of our institute together. 
                    Alumni share interview experiences, career advice and job openings, tagged with the company and role they relate to.
                </Text>
                <Text variant="h5">
                    Students can browse posts by company or job title, read about real hiring processes and ask alumni for guidance in the comments.
                </Text>
            </Wrapper>
        </Box>
    )
}

export default About;