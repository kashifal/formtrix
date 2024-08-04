import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Avatar } from '@mui/material';

const LogoCard = ({ isLoading, logoUrl }) => {
    return (
        <Card sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {isLoading ? (
                    <p>Loading...</p> // You can replace this with a skeleton or loading indicator
                ) : (
                    <Avatar
                        variant="square"
                        src={logoUrl}
                        alt="Company Logo"
                        sx={{ width: '100%', height: 'auto', maxHeight: '100%' }} // Adjust size to fill the card
                    />
                )}
            </CardContent>
        </Card>
    );
};

LogoCard.propTypes = {
    isLoading: PropTypes.bool,
    logoUrl: PropTypes.string
};

export default LogoCard;
