import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AnimateButton from 'ui-component/extended/AnimateButton';

const USER_CREDENTIALS = {
    username: process.env.REACT_APP_USERNAME,
    password: process.env.REACT_APP_PASSWORD
};

const AuthLogin = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = (event) => event.preventDefault();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (username === USER_CREDENTIALS.username && password === USER_CREDENTIALS.password) {
            navigate('/dashboard'); // Navigate to your dashboard or desired page
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <form noValidate onSubmit={handleSubmit}>
            <FormControl fullWidth error={Boolean(error)} sx={{ ...theme.typography.customInput }}>
                <InputLabel htmlFor="username">Email Address</InputLabel>
                <OutlinedInput id="username" type="email" value={username} name="email" onChange={(e) => setUsername(e.target.value)} />
                {error && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                        {error}
                    </FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth error={Boolean(error)} sx={{ ...theme.typography.customInput }}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>

            <Box sx={{ mt: 2 }}>
                <AnimateButton>
                    <Button color="primary" disabled={!username || !password} fullWidth size="large" type="submit" variant="contained">
                        Sign In
                    </Button>
                </AnimateButton>
            </Box>
        </form>
    );
};

export default AuthLogin;
