// material-ui
import { Grid } from '@mui/material';

// new way forward: go back to the previous design so that we can get everything working as intended


// project imports
import HeatMapChart from './HeatMapChart'; // Import HeatMapChart
import { gridSpacing } from 'store/constant';

// ==============================|| ANALYTICS DASHBOARD ||============================== //

const Analytics = () => {
    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <HeatMapChart /> {/* Only HeatMapChart is used here */}
            </Grid>
        </Grid>
    );
};

export default Analytics;
