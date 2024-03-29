import * as React from 'react';

// material-ui
import { InputAdornment } from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import '@mui/lab';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// assets
import DateRangeIcon from '@mui/icons-material/DateRange';

// ==============================|| CUSTOM DATETIME ||============================== //

const CustomDateTime = () => {
    const [value, setValue] = React.useState(new Date('30-12-2024'));

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateTimePicker
                value={value}
                onChange={(newValue) => {
                    setValue(newValue);
                }}
                label="Basic Datetime Picker"
                onError={console.log}
                minDate={new Date('01-01-2000')}
                format="dd/MM/yyyy"
                slotProps={{
                    textField: {
                        margin: 'normal',
                        fullWidth: true,
                        InputProps: {
                            endAdornment: (
                                <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                                    <DateRangeIcon />
                                </InputAdornment>
                            )
                        }
                    }
                }}
            />
        </LocalizationProvider>
    );
};

export default CustomDateTime;
