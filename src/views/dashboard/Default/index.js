import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

// project imports
import ToDoList from './ToDoList';
import EmployeeProgress from './EmployeeProgress';
import { gridSpacing } from 'store/constant';

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Row with Title */}
            <Grid item xs={12}>
                <Typography variant="h3" align="center" gutterBottom>
                    Fox Training Matrix
                </Typography>
                <Typography variant="h4" align="center" gutterBottom style={{ color: '#b80a2d' }}></Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <Card sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CardContent sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <img src="/images/Monks.jpg" alt="Company Logo" style={{ width: '100%', height: 'auto', maxHeight: '100%' }} />
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <ToDoList isLoading={isLoading} />
            </Grid>

            {/* Bottom Row with Title */}
            <Grid item xs={12}>
                <Typography variant="h5" align="center" gutterBottom>
                    Individual Employee Progress
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <EmployeeProgress isLoading={isLoading} />
            </Grid>
        </Grid>
    );
};

export default Dashboard;
