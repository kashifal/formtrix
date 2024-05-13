import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';

// project imports
import HeatMap from './HeatMap.bk';
import CourseList from './CourseList'; // Assuming you have this component
import EmployeeProgress from './EmployeeProgress'; // Assuming you have this component
import { gridSpacing } from 'store/constant';

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Row */}
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <HeatMap isLoading={isLoading} />
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <CourseList isLoading={isLoading} />
            </Grid>

            {/* Bottom Row */}
            <Grid item xs={12}>
                <EmployeeProgress isLoading={isLoading} />
            </Grid>
        </Grid>
    );
};

export default Dashboard;
