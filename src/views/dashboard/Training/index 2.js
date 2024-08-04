import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Button } from '@mui/material';

// Project imports
import HeatMapChart from './HeatMapChart';
import RoleCourseChart from './RoleCourse';
import ToDoList from './ToDoList';
import { gridSpacing } from 'store/constant';

const Training = () => {
    const [isLoading, setLoading] = useState(true);
    const [showHeatMapChart, setShowHeatMapChart] = useState(true);
    const [buttonText, setButtonText] = useState('Skills & Courses');

    useEffect(() => {
        setLoading(false);
    }, []);

    const toggleCharts = (event) => {
        // Receive the event object
        event.preventDefault(); // Prevent page refresh
        setShowHeatMapChart(!showHeatMapChart);
        setButtonText(buttonText === 'Skills & Courses' ? 'Employees & Courses' : 'Skills & Courses');
    };

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Row similar to Dashboard */}
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

            {/* Toggle Button */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" onClick={toggleCharts}>
                    {buttonText}
                </Button>
            </Grid>

            {/* HeatMapChart Row */}
            <Grid item xs={12}>
                {showHeatMapChart ? <HeatMapChart /> : <RoleCourseChart />}
            </Grid>
        </Grid>
    );
};

export default Training;
