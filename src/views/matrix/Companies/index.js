import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';

// project imports
import LogoCard from './LogoCard';
import ToDoList from './ToDoList';
import EmployeeProgress from './EmployeeProgress';
import { gridSpacing } from 'store/constant';

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    const logoUrl = '/path_to/Tipworx.png'; // Update with the correct path

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Row */}
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <LogoCard isLoading={isLoading} logoUrl={logoUrl} />
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <ToDoList isLoading={isLoading} />
            </Grid>

            {/* Bottom Row */}
            <Grid item xs={12}>
                <EmployeeProgress isLoading={isLoading} />
            </Grid>
        </Grid>
    );
};

export default Dashboard;
