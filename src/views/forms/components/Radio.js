import React, { useState, useEffect, useCallback } from 'react';
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

    const fetchEmployeeCourses = useCallback(() => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${selectedEmployee.id}&populate[course]=name,shortname,datecompleted,YearsExpire`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                setEmployeeCourses(data.data);
            });
    }, [selectedEmployee]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        if (selectedCompany) {
            fetchEmployees();
        }
    }, [selectedCompany, fetchEmployees]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeCourses();
        }
    }, [selectedEmployee, fetchEmployeeCourses]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const calculateExpiryDate = (completionDate, yearsExpire) => {
        if (completionDate && yearsExpire) {
            const expiryDate = new Date(completionDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + yearsExpire);
            return expiryDate.toLocaleDateString();
        }
        return 'N/A';
    };

    const getHighlightColor = (completionDate, expiryDate) => {
        if (!completionDate) {
            return 'rgba(255, 0, 0, 0.1)'; // Transparent red for not completed
        }

        const currentDate = new Date();
        const expiry = new Date(expiryDate);
        const timeDiff = expiry.getTime() - currentDate.getTime();
        const monthsDiff = Math.ceil(timeDiff / (1000 * 3600 * 24 * 30));

        if (monthsDiff <= 3) {
            return 'rgba(255, 255, 0, 0.3)'; // Yellow for expiring within 3 months
        }

        return 'rgba(0, 255, 0, 0.2)'; // Green for completed and not expiring soon
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
                        <SubCard title="Completed Courses">
                            {employeeCourses.length > 0 ? (
                                <List>
                                    {employeeCourses.map((employeeCourse) => {
                                        const completionDate = employeeCourse.attributes.DateCompleted;
                                        const formattedCompletionDate = completionDate ? formatDate(completionDate) : null;
                                        const expiryDate = calculateExpiryDate(
                                            completionDate,
                                            employeeCourse.attributes.course.data.attributes.YearsExpire
                                        );
                                        const highlightColor = getHighlightColor(completionDate, expiryDate);

                                        return (
                                            <ListItem key={employeeCourse.id} style={{ backgroundColor: highlightColor }}>
                                                <ListItemText
                                                    primary={employeeCourse.attributes.course.data.attributes.name}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2">
                                                                {formattedCompletionDate
                                                                    ? `Completed on ${formattedCompletionDate}`
                                                                    : 'Not yet completed'}
                                                            </Typography>
                                                            <br />
                                                            <Typography component="span" variant="body2">
                                                                Expires on {expiryDate}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })}
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
