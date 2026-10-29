import { Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { Business, Work } from '@mui/icons-material';

// Company / job-title tags; pass `linked` to make them filter links (avoid inside other links)
const PostTags = ({ company, role, linked = false }) => {
    if (!company && !role) return null;

    const linkProps = (key, value) => linked ? { component: Link, to: `/?${key}=${encodeURIComponent(value)}`, clickable: true } : {};

    return (
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
            { company && <Chip icon={<Business />} label={company} size="small" variant="outlined" {...linkProps('company', company)} /> }
            { role && <Chip icon={<Work />} label={role} size="small" variant="outlined" {...linkProps('role', role)} /> }
        </Box>
    )
}

export default PostTags;
