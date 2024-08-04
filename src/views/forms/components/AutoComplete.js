import React, { useState, useEffect } from 'react';
import {
    Autocomplete,
    Grid,
    TextField,
    Typography,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const CourseComplete = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [courseCompletionDates, setCourseCompletionDates] = useState({});
    const [isCompletionDateAdded, setIsCompletionDateAdded] = useState(false);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);

    const fetchCompanies = useCallback(() => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?populate[skill]=*&fields=name')
            .then((response) => response.json())
            .then((data) => {
                const formattedCompanies = data.data.map((company) => ({
                    label: company.attributes.name,
                    id: company.id
                }));
                setCompanies(formattedCompanies);
            });
    }, []);

    const fetchCourses = useCallback(() => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/')
            .then((response) => response.json())
            .then((data) => {
                const formattedCourses = data.data.map((course) => ({
                    label: course.attributes.name,
                    id: course.id
                }));
                setCourses(formattedCourses);
            });
    }, []);

    const fetchEmployees = useCallback(() => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][id][$eq]=${selectedCompany.id}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const formattedEmployees = data.data.map((employee) => ({
                    label: employee.attributes.fullname,
                    id: employee.id
                }));
                setEmployees(formattedEmployees);
            });
    }, [selectedCompany]);

    const fetchCompletedCourses = useCallback((employeeId) => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employeeId}&populate=course`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const formattedCompletedCourses = data.data.map((ec) => ({
                    id: ec.attributes.course.data.id,
                    label: ec.attributes.course.data.attributes.name,
                    dateCompleted: ec.attributes.DateCompleted
                }));
                setCompletedCourses(formattedCompletedCourses);
            });
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        if (selectedCompany) {
            fetchEmployees();
            fetchCourses(); // Assuming courses are not dependent on the company. If they are, move this call inside fetchEmployees.
        }
    }, [selectedCompany, fetchEmployees, fetchCourses]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchCompletedCourses(selectedEmployee.id);
        }
    }, [selectedEmployee, fetchCompletedCourses]);

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
    }, [selectedCourses, courseCompletionDates]);

    const handleDateChange = (courseId, date) => {
        setCourseCompletionDates((prevDates) => {
            const updatedDates = { ...prevDates, [courseId]: date };
            const completionDateAdded = Object.values(updatedDates).some((date) => date !== '');
            setIsCompletionDateAdded(completionDateAdded);
            return updatedDates;
        });
    };

    const handleSubmit = async () => {
        const employeeCoursesUpdates = selectedCourses.map((course) => ({
            data: {
                course: course.id,
                employee: selectedEmployee.id,
                DateCompleted: courseCompletionDates[course.id]
            }
        }));

        try {
            const responses = await Promise.all(
                employeeCoursesUpdates.map((update) =>
                    fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(update)
                    })
                )
            );

            const data = await Promise.all(responses.map((response) => response.json()));
            console.log('Success:', data);
            setOpenSnackbar(true); // Show success feedback
            setSelectedCourses([]); // Clear selected courses
            setCourseCompletionDates({}); // Clear course completion dates
            // Here, you might want to redirect the user or clear the form
        } catch (error) {
            console.error('Error:', error);
            // Here, you might want to show an error message to the user
        }
    };

    const handleClear = () => {
        window.location.reload();
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleDialogSubmit = () => {
        handleSubmit();
        setOpenDialog(false);
    };

    const handleWarningDialogClose = () => {
        setWarningDialogOpen(false);
        setOpenDialog(true); // Reopen the confirmation dialog
    };

    const handleWarningDialogSubmit = () => {
        setWarningDialogOpen(false);
        handleSubmit();
    };

    const handleOpenDialog = () => {
        const overlappingCourses = selectedCourses.filter((course) =>
            completedCourses.some((completedCourse) => completedCourse.id === course.id)
        );

        if (overlappingCourses.length > 0) {
            setWarningDialogOpen(true);
        } else {
            setOpenDialog(true);
        }
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    return (
        <MainCard title="Courses Completed Per Employee">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12} md={6} lg={4}>
                    <SubCard title="Choose Company">
                        <Grid container direction="column" spacing={3}>
                            <Grid item>
                                <Autocomplete
                                    disableClearable
                                    options={companies}
                                    getOptionLabel={(option) => option.label}
                                    onChange={(event, newValue) => {
                                        setSelectedCompany(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Company" />}
                                />
                            </Grid>
                        </Grid>
                    </SubCard>
                </Grid>

                {selectedCompany && (
                    <Grid item xs={12} md={6} lg={4}>
                        <SubCard title="Choose Employee">
                            <Grid container direction="column" spacing={3}>
                                <Grid item>
                                    <Autocomplete
                                        disableClearable
                                        options={employees}
                                        getOptionLabel={(option) => option.label}
                                        onChange={(event, newValue) => {
                                            setSelectedEmployee(newValue);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Select Employee" />}
                                    />
                                </Grid>
                            </Grid>
                        </SubCard>
                    </Grid>
                )}

                {selectedEmployee && (
                    <Grid item xs={12} md={6} lg={4}>
                        <SubCard title="Courses Completed (enter all that apply)">
                            <Grid container direction="column" spacing={3}>
                                <Grid item>
                                    <Autocomplete
                                        multiple
                                        options={courses}
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
                )}

                {selectedCourses.length > 0 && (
                    <Grid item xs={12} md={6} lg={4}>
                        <SubCard title="When were the Courses Completed?">
                            <Grid container direction="column" spacing={3}>
                                {selectedCourses.map((course) => (
                                    <Grid item key={course.id}>
                                        <Typography variant="body1">{course.label}</Typography>
                                        <TextField
                                            type="date"
                                            value={courseCompletionDates[course.id] || ''}
                                            onChange={(e) => handleDateChange(course.id, e.target.value)}
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
                                <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                                    Submit
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleOpenDialog}>
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

            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                    <Typography>You are about to add the following courses to {selectedEmployee?.label}:</Typography>
                    <ul>
                        {selectedCourses.map((course) => (
                            <li key={course.id}>
                                {course.label} completed on {courseCompletionDates[course.id]}
                            </li>
                        ))}
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogSubmit} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={warningDialogOpen} onClose={handleWarningDialogClose}>
                <DialogTitle>Warning: Duplicate Course</DialogTitle>
                <DialogContent>
                    <Typography>The following course/s have already been completed by {selectedEmployee?.label}:</Typography>
                    <ul>
                        {selectedCourses
                            .filter((course) => completedCourses.some((completedCourse) => completedCourse.id === course.id))
                            .map((course) => (
                                <li key={course.id}>{course.label}</li>
                            ))}
                    </ul>
                    <Typography>Are you sure you want to make this change?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleWarningDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleWarningDialogSubmit} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} message="Courses successfully submitted" />
        </MainCard>
    );
};

export default CourseComplete;
