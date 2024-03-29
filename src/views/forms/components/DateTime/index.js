import React from 'react';

// material-ui
import { Grid } from '@mui/material';

// project imports
import CustomDateTime from './CustomDateTime';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import SecondaryAction from 'ui-component/cards/CardSecondaryAction';
import { gridSpacing } from 'store/constant';

// ==============================|| DATETIME ||============================== //

const DateTime = () => {
    

    return (
        <MainCard title="Course Completed" secondary={<SecondaryAction link="https://next.material-ui.com/components/date-time-picker/" />}>
            <Grid container spacing={gridSpacing}>


                <Grid item xs={12} md={6}>
                    <SubCard title="Course Completed">
                        <CustomDateTime />
                    </SubCard>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default DateTime;
