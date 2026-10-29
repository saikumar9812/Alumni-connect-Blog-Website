import { createContext, useState, useEffect } from "react";


export const DataContext = createContext(null);

const emptyAccount = { name: '', username: '', role: '' };

// Restore the logged-in account after a page refresh (sessionStorage is cleared on logout / failed token refresh)
const loadAccount = () => {
    try {
        return JSON.parse(sessionStorage.getItem('account')) || emptyAccount;
    } catch (error) {
        return emptyAccount;
    }
}

const DataProvider = ({ children }) => {
    const [ account, setAccount ] = useState(loadAccount);

    useEffect(() => {
        if (account.username) sessionStorage.setItem('account', JSON.stringify(account));
    }, [account]);
        
    return (
        <DataContext.Provider value={{ 
            account, 
            setAccount 
        }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataProvider;
