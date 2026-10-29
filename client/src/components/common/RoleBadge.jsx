import { Chip } from '@mui/material';

const ROLE_LABELS = {
    alumni: 'Alumni',
    student: 'Student'
};

const RoleBadge = ({ role, ...props }) => {
    if (!ROLE_LABELS[role]) return null;

    return (
        <Chip
            label={ROLE_LABELS[role]}
            size="small"
            color={role === 'alumni' ? 'primary' : 'secondary'}
            {...props}
        />
    )
}

export default RoleBadge;
