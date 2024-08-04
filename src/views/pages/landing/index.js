// material-ui
import { styled } from '@mui/material/styles';

// project imports
import Customization from 'layout/Customization';
import AppBar from 'ui-component/extended/AppBar';
import HeaderSection from './HeaderSection';

// import IncludeSection from './IncludeSection';
// import RtlInfoSection from './RtlInfoSection';

// custom stlye
const HeaderWrapper = styled('div')(({ theme }) => ({
    overflowX: 'hidden',
    overflowY: 'clip',
    background:
        theme.palette.mode === 'dark'
            ? theme.palette.background.default
            : `linear-gradient(360deg, ${theme.palette.grey[100]} 1.09%, ${theme.palette.background.paper} 100%)`,
    [theme.breakpoints.down('md')]: {}
}));

// =============================|| LANDING MAIN ||============================= //

const Landing = () => {
    return (
        <>
            {/* 1. header and hero section */}
            <HeaderWrapper id="home">
                <AppBar />
                <HeaderSection />
            </HeaderWrapper>

            {/* 2. card section */}

            {/* 4. developer experience section */}

            {/* 3. about section */}

            {/* 4. Apps */}

            {/* 5. people section */}

            {/* 9. framework section */}

            {/* 10. footer section */}

            <Customization />
        </>
    );
};

export default Landing;
