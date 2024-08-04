import React, { useState, useEffect } from 'react';
import { Autocomplete, Grid, TextField, Typography, Button, Box } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

// Dummy data for Courses and Employees
const Courses = [
    { label: 'Accident Reporting', id: 1 },
    { label: 'First Aid Awareness', id: 2 },
    { label: 'Health and Safety', id: 3 },
    { label: 'Manual Handling', id: 4 },
    { label: 'Conflict Resolution', id: 5 },
    { label: 'GDPR', id: 6 },
    { label: 'Risk Assessment', id: 7 }
];

const Employees = [
    { label: 'Able Ableton', id: 1 },
    { label: 'Barny Barnes', id: 2 },
    { label: 'Caroline King', id: 3 },
    { label: 'Dennis Danger', id: 4 },
    { label: 'Evan Empty', id: 5 },
    { label: 'Fiona Fierce', id: 6 },
    { label: 'George James', id: 7 }
];

const AutoComplete = () => {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [courseCompletionDates, setCourseCompletionDates] = useState({});
    const [isCompletionDateAdded, setIsCompletionDateAdded] = useState(false);

    useEffect(() => {
        const initialDates = {};
        let completionDateAdded = false;
        selectedCourses.forEach((course) => {
            initialDates[course.id] = courseCompletionDates[course.id] || '';
            if (courseCompletionDates[course.id]) {
                completionDateAdded = true;
            }
        });
        setCourseCompletionDates(initialDates);
        setIsCompletionDateAdded(completionDateAdded);
    }, [selectedCourses]); // Removed courseCompletionDates from dependencies to avoid infinite loop

    const handleDateChange = (courseId, date) => {
        setCourseCompletionDates((prevDates) => {
            const updatedDates = { ...prevDates, [courseId]: date };
            // Check if at least one completion date is added
            const completionDateAdded = Object.values(updatedDates).some((date) => date !== '');
            setIsCompletionDateAdded(completionDateAdded);
            return updatedDates;
        });
    };

    const handleClear = () => {
        window.location.reload();
    };

    return (
        <MainCard title="Courses Completed Per Employee">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12} md={6} lg={4}>
                    <SubCard title="Choose Employee">
                        <Grid container direction="column" spacing={3}>
                            <Grid item>
                                <Autocomplete
                                    disableClearable
                                    options={Employees}
                                    renderInput={(params) => <TextField {...params} label="" />}
                                />
                            </Grid>
                        </Grid>
                    </SubCard>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <SubCard title="Courses Completed (enter all that apply)">
                        <Grid container direction="column" spacing={3}>
                            <Grid item>
                                <Autocomplete
                                    multiple
                                    options={Courses}
                                    getOptionLabel={(option) => option.label}
                                    onChange={(event, newValue) => {
                                        setSelectedCourses(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Grid>
                        </Grid>
                    </SubCard>
                </Grid>

                {selectedCourses.length > 0 && (
                    <Grid item xs={12} md={6} lg={4}>
                        <SubCard title="When were the Courses Completed?">
                            <Grid container direction="column" spacing={3}>
                                {selectedCourses.map((course) => (
                                    <Grid item key={course.id}>
                                        <Typography variant="body1">{course.label}</Typography>
                                        <TextField
                                            type="text"
                                            value={courseCompletionDates[course.id] || ''}
                                            onChange={(e) => handleDateChange(course.id, e.target.value)}
                                            placeholder="DD/MM/YYYY"
                                            fullWidth
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </SubCard>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        {isCompletionDateAdded && (
                            <>
                                <Button variant="contained" color="primary">
                                    Submit
                                </Button>
                                <Button variant="contained" color="primary">
                                    Submit and Add Another Employee
                                </Button>
                            </>
                        )}
                        <Button variant="contained" color="secondary" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button variant="contained">Home</Button>
                    </Box>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default AutoComplete;
