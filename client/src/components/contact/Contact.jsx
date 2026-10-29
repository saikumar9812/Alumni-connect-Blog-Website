
import { Box, styled, Typography, Link } from '@mui/material';
import { Email } from '@mui/icons-material';

const Banner = styled(Box)`
    background-image: url(http://mrtaba.ir/image/bg2.jpg);
    width: 100%;
    height: 50vh;
    background-position: left 0px top -100px;
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

const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL || 'alumni-office@example.com';

const Contact = () => {
    return (
        <Box>
            <Banner />
            <Wrapper>
                <Typography variant="h3">Getting in touch is easy!</Typography>
                <Text variant="h5">
                    Questions, feedback or want to help mentor students? Email the alumni team at
                    <Link href={`mailto:${CONTACT_EMAIL}`} target="_blank" color="inherit" style={{ marginLeft: 5 }}>
                        <Email style={{ verticalAlign: 'middle' }} /> {CONTACT_EMAIL}
                    </Link>.
                </Text>
            </Wrapper>
        </Box>
    );
}

export default Contact;
