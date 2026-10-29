
import { useContext } from 'react';

import { AppBar, Toolbar, styled } from '@mui/material'; 
import { Link } from 'react-router-dom';

import { DataContext } from '../../context/DataProvider';
import { API } from '../../service/api';
import { getRefreshToken } from '../../utils/common-utils';
import RoleBadge from '../common/RoleBadge';

import { useNavigate } from 'react-router-dom';


const Component = styled(AppBar)`
    background: #FFFFFF;
    color: black;
`;

const Container = styled(Toolbar)`
    justify-content: center;
    & > a {
        padding: 20px;
        color: #000;
        text-decoration: none;
    }
`

const Header = () => {

    const navigate = useNavigate();
    const { account, setAccount } = useContext(DataContext);

    const logout = async (e) => {
        e.preventDefault();
        try {
            await API.userLogout({ token: getRefreshToken() });
        } catch (error) {}
        sessionStorage.clear();
        setAccount({ name: '', username: '', role: '' });
        navigate('/account');
    }
        
    return (
        <Component>
            <Container>
                <Link to='/'>HOME</Link>
                <Link to='/about'>ABOUT</Link>
                <Link to='/contact'>CONTACT</Link>
                <Link to={`/profile/${account.username}`}>PROFILE</Link>
                <Link to='/account' onClick={logout}>LOGOUT</Link>
                <RoleBadge role={account.role} />
            </Container>
        </Component>
    )
}

export default Header;