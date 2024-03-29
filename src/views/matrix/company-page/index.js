import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, CardMedia } from '@mui/material';
import EmployeeTable from './EmployeeTable';

function DashboardCoSkill() {
    const { company, skill } = useParams();
    const [companyData, setCompanyData] = useState(null);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const response = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?filters[website][$eq]=${company}&populate=*`);
                if (response.data && response.data.data.length > 0) {
                    setCompanyData(response.data.data[0].attributes);
                }
            } catch (error) {
                console.error('Error fetching company data:', error);
            }
        };

        fetchCompanyData();
    }, [company]);

    const getLogoUrl = (companyData) => {
        if (companyData.logo && companyData.logo.data.length > 0) {
            const logoAttributes = companyData.logo.data[0].attributes;
            const logoFormats = logoAttributes.formats;
    
            // Check if formats exist and then check for each specific format
            if (logoFormats) {
                if (logoFormats.medium) {
                    return logoFormats.medium.url;
                } else if (logoFormats.small) {
                    return logoFormats.small.url;
                } else if (logoFormats.thumbnail) {
                    return logoFormats.thumbnail.url;
                }
            }
    
            // Fallback to the default URL if formats do not exist or specific formats are not available
            return logoAttributes.url;
        }
        return ''; // Return empty string or a default placeholder image URL if no logo is available
    };
    
    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                Company Information
                            </Typography>
                            {companyData && (
                                <div>
                                    <Typography variant="body2" color="text.secondary">
                                        {companyData.name}
                                    </Typography>
                                    {getLogoUrl(companyData) && (
                                        <CardMedia
                                            component="img"
                                            image={getLogoUrl(companyData)}
                                            alt={`${companyData.name} Logo`}
                                            sx={{
                                                maxWidth: '100%', 
                                                maxHeight: '140px', 
                                                objectFit: 'contain',
                                                margin: 'auto'
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" component="div">
                                {skill} Role
                            </Typography>
                            Employees below are skilled in this role: {skill}.
                            {/* Here you can add additional content related to the skill */}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                Employee Table
                            </Typography>
                            <EmployeeTable company={company} skill={skill} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}

export default DashboardCoSkill;
