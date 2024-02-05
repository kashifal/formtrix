
import { useTheme } from '@mui/material/styles';
import logoDark from 'assets/images/foxwhite.png';
import logo from 'assets/images/foxlogo.png';



 const Logo = () => {
    const theme = useTheme();

    return (

<img src={theme.palette.mode === 'dark' ? logoDark : logo} alt="Berry" width="100" />

        
    );
};

export default Logo;
