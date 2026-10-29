import { useState, useEffect } from 'react';

import { Box, TextField, Button, styled } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const Container = styled(Box)`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin: 20px 10px 10px;
`;

const Filters = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({ company: '', role: '' });

    useEffect(() => {
        setFilters({ company: searchParams.get('company') || '', role: searchParams.get('role') || '' });
    }, [searchParams]);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    }

    const applyFilters = (e) => {
        e.preventDefault();
        const params = Object.fromEntries(searchParams.entries());
        ['company', 'role'].forEach(key => {
            if (filters[key].trim()) params[key] = filters[key].trim();
            else delete params[key];
        });
        setSearchParams(params);
    }

    const clearFilters = () => {
        const params = Object.fromEntries(searchParams.entries());
        delete params.company;
        delete params.role;
        setSearchParams(params);
    }

    return (
        <Container component="form" onSubmit={applyFilters}>
            <TextField size="small" name="company" label="Company" value={filters.company} onChange={handleChange} />
            <TextField size="small" name="role" label="Role / Job title" value={filters.role} onChange={handleChange} />
            <Button type="submit" variant="contained">Filter</Button>
            <Button onClick={clearFilters}>Clear</Button>
        </Container>
    )
}

export default Filters;
