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
                // Assuming the 'website' field in API matches the 'company' URL parameter
                const response = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?filters[website][$eq]=${company}`);
                if (response.data && response.data.data.length > 0) {
                    setCompanyData(response.data.data[0].attributes);
                }
            } catch (error) {
                console.error('Error fetching company data:', error);
            }
        };

        fetchCompanyData();
   }, [company]);

    return (
        <div>
            <Grid container spacing={2}>
                {/* Left-hand side card for company information */}
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
                                    <CardMedia
                                        component="img"
                                        image={`/images/${companyData.logourl}`}
                                        alt={`${companyData.name} Logo`}
                                        sx={{
                                            maxWidth: '100%', 
                                            maxHeight: '140px', 
                                            objectFit: 'contain',
                                            margin: 'auto'
                                        }}
                                    />

                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right-hand side card for skill */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h1" component="div">
                                {skill} Role
                            </Typography>
                            {/* Additional content related to the skill */}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bottom larger content area */}
                <Grid item xs={12}>
                    <Card>
                    <CardContent>
                        <EmployeeTable company={company} />
                    </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}

export default DashboardCoSkill;