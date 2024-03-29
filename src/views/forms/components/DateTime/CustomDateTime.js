import * as React from 'react';

// material-ui
import { InputAdornment } from '@mui/material';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers'; // Changed from MobileDateTimePicker to MobileDatePicker
import '@mui/lab';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// assets
import DateRangeIcon from '@mui/icons-material/DateRange';

// ==============================|| CUSTOM DATE ||============================== //

const CustomDate = () => {
    const [value, setValue] = React.useState(new Date('2024-12-30')); // Adjusted the date format to ISO standard for better compatibility

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDatePicker
                value={value}
                onChange={(newValue) => {
                    setValue(newValue);
                }}
                label="Date Completed"
                onError={console.log}
                minDate={new Date('2000-01-01')} // Adjusted the date format here as well
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

export default CustomDate;
