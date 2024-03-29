import React, { useState, useEffect } from 'react';
import { Autocomplete, Grid, TextField, Typography, Button, Box } from '@mui/material';

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

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            fetchEmployees();
            fetchCourses(); // Assuming courses are not dependent on the company. If they are, move this call inside fetchEmployees.
        }
    }, [selectedCompany]);

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
    }, [selectedCourses]);

    const fetchCompanies = () => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?populate[skill]=*&fields=name')
            .then(response => response.json())
            .then(data => {
                const formattedCompanies = data.data.map(company => ({
                    label: company.attributes.name,
                    id: company.id,
                }));
                setCompanies(formattedCompanies);
            });
    };

    const fetchCourses = () => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/')
            .then(response => response.json())
            .then(data => {
                const formattedCourses = data.data.map(course => ({
                    label: course.attributes.name,
                    id: course.id,
                }));
                setCourses(formattedCourses);
            });
    };

    const fetchEmployees = () => {
        // Assuming the API supports filtering employees by company ID through a query parameter
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][id][$eq]=${selectedCompany.id}`;
    
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const formattedEmployees = data.data.map(employee => ({
                    label: employee.attributes.fullname,
                    id: employee.id,
                }));
                setEmployees(formattedEmployees);
            });
    };
    

    const handleDateChange = (courseId, date) => {
        setCourseCompletionDates((prevDates) => {
            const updatedDates = { ...prevDates, [courseId]: date };
            const completionDateAdded = Object.values(updatedDates).some(date => date !== '');
            setIsCompletionDateAdded(completionDateAdded);
            return updatedDates;
        });
    };

    const handleSubmit = async () => {
        // Mapping your selectedCourses and courseCompletionDates to the format expected by Strapi
        const employeeCoursesUpdates = selectedCourses.map(course => ({
            data: {
                course: course.id,
                employee: selectedEmployee.id,
                DateCompleted: courseCompletionDates[course.id],
            }
        }));
    
        try {
            // Using Promise.all to wait for all POST requests to complete
            const responses = await Promise.all(employeeCoursesUpdates.map(update =>
                fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(update),
                    })
                )
            );
    
            // Converting all responses to JSON
            const data = await Promise.all(responses.map(response => response.json()));
    
            // Handle success for all requests
            console.log('Success:', data);
            // Here, you might want to redirect the user or clear the form
        } catch (error) {
            console.error('Error:', error);
            // Here, you might want to show an error message to the user
        }
    };
    

    const handleClear = () => {
        window.location.reload();
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
                                    // Reset other states if necessary, e.g., setSelectedEmployee(null);
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
                                        type="date" // Changed to type="date" for better date input
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
                            <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>Submit and Add Another Employee</Button>
                        </>
                    )}
                    <Button variant="contained" color="secondary" onClick={handleClear}>Clear</Button>
                    <Button variant="contained">Home</Button>
                </Box>
            </Grid>
        </Grid>

    </MainCard>
);

};

export default CourseComplete;
