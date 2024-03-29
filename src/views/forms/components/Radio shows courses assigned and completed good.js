import React, { useState, useEffect } from 'react';
import { Autocomplete, Grid, TextField, List, ListItem, ListItemText, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const EmployeeAll = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeCourses, setEmployeeCourses] = useState([]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            fetchEmployees();
        }
    }, [selectedCompany]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeCourses();
        }
    }, [selectedEmployee]);

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

    const fetchEmployees = () => {
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

    const fetchEmployeeCourses = () => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${selectedEmployee.id}&populate[course]=name,shortname,datecompleted`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                setEmployeeCourses(data.data);
            });
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
                                        setSelectedEmployee(null);
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
                    <Grid item xs={12}>
                        <SubCard title="Training Record">
                            {employeeCourses.length > 0 ? (
                                <List>
                                    {employeeCourses.map(employeeCourse => (
                                        <ListItem key={employeeCourse.id}>
                                            <ListItemText 
                                                primary={employeeCourse.attributes.course.data.attributes.name}
                                                secondary={employeeCourse.attributes.DateCompleted ? `Completed on ${employeeCourse.attributes.DateCompleted}` : 'Not yet completed'}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography>No courses completed yet.</Typography>
                            )}
                        </SubCard>
                    </Grid>
                )}
            </Grid>
        </MainCard>
    );
};

export default EmployeeAll;