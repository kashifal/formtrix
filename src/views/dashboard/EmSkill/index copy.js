import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import EmployeeTable from './EmployeeTable'; // Assuming EmployeeTable can accept skill as a prop

function DashboardEmSkill() {
    const { company, skill } = useParams();
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployeesData = async () => {
            try {
                const response = await axios.get(`https://yourapi.com/api/employees?filters[skill][$eq]=${skill}&filters[company][$eq]=${company}&populate=*`);
                if (response.data && response.data.length > 0) {
                    setEmployees(response.data);
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        fetchEmployeesData();
    }, [company, skill]);

    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                Skill Overview: {skill}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Employees at {company} skilled in {skill}.
                            </Typography>
                            {/* Display additional information if needed */}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                Employee List
                            </Typography>
                            <EmployeeTable employees={employees} />
                            {/* Ensure EmployeeTable is designed to take employees data and display it */}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}

export default DashboardEmSkill;
