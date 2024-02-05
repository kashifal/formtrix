// Import images directly
import backgroundImage from '../../../assets/images/background.jpg';
import foxLogo from '../../../assets/images/foxlogo.png';

// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const FullScreenBackground = styled('div')({
  height: '100vh',
  width: '100%',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const ButtonSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  '& > *': {
    marginTop: 16, // Increased spacing
  },
});

const Logo = styled('img')({
  height: 'auto',
  width: '160px', // Adjust the size as needed
  marginBottom: '48px', // Adjust the spacing as needed
});

// =============================|| LANDING MAIN ||============================= //

const Landing = () => {

  return (
    <>
      <FullScreenBackground>
        <Logo src={foxLogo} alt="Fox Logo" />
        <ButtonSection>
          <Button variant="contained" color="primary">Login Now</Button>
          <Button variant="contained" color="primary">Monks Training</Button>
          <Button variant="contained" color="primary">Dashboard</Button>
        </ButtonSection>
      </FullScreenBackground>
    </>
  );
};

export default Landing;
