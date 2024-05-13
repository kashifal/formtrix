import React, { useState, useEffect } from 'react';
import { Autocomplete, Grid, TextField, List, ListItem, ListItemText, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const EmployeeAll = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeCourses, setEmployeeCourses] = useState([]);
    const [employeeCertificates, setEmployeeCertificates] = useState([]);

    useEffect(() => {
        const defaultEmployeeId = 32; // Set the default employee ID to 32
        fetchEmployees(defaultEmployeeId);
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeCourses();
            fetchEmployeeCertificates();
        }
    }, [selectedEmployee]);

    const fetchEmployees = (defaultEmployeeId) => {
        const apiUrl = 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const formattedEmployees = data.data.map(employee => ({
                    label: employee.attributes.fullname,
                    id: employee.id,
                    ...employee.attributes,
                }));
                setEmployees(formattedEmployees);

                // Set the default employee if provided
                if (defaultEmployeeId) {
                    const defaultEmployee = formattedEmployees.find(employee => employee.id === defaultEmployeeId);
                    setSelectedEmployee(defaultEmployee);
                }
            });
    };

    const fetchEmployeeCourses = () => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${selectedEmployee.id}&populate[course]=name,shortname,datecompleted,YearsExpire`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                setEmployeeCourses(data.data);
            });
    };

    const fetchEmployeeCertificates = () => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/certificates?populate=*&filters[employee][id][$eq]=${selectedEmployee.id}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                setEmployeeCertificates(data.data);
            });
    };

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
                <Grid item xs={12}>
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

                {selectedEmployee && (
                    <Grid item xs={12}>
                        <SubCard title={`Employee Details for ${selectedEmployee.fullname}`}>
                        <Typography><b>Archived:</b> Current Employee</Typography>

                        <Typography><b>Fullname:</b> {selectedEmployee.fullname}</Typography>
                        <Typography><b>Job Title:</b> {selectedEmployee.jobtitle}</Typography>
<Typography><b>Address:</b> {selectedEmployee.address}</Typography>
<Typography><b>Email:</b> {selectedEmployee.email}</Typography>
<Typography><b>Home Tel:</b> {selectedEmployee.hometel}</Typography>
<Typography><b>Mobile Tel:</b> {selectedEmployee.mobiletel}</Typography>
<Typography><b>Date of Birth:</b> {formatDate(selectedEmployee.dob)}</Typography>
<Typography><b>National Insurance Number:</b> {selectedEmployee.ni}</Typography>
<Typography><b>Start Date:</b> {formatDate(selectedEmployee.startdate)}</Typography>
<Typography><b>Any Certificates?</b> {employeeCertificates.length > 0 ? 'Yes' : 'No'}</Typography>

                            {employeeCertificates.length > 0 && (
                                <Typography>
                                    Certificate(s):{' '}
                                    <a
                                        href={employeeCertificates[0].attributes.certificate.data.attributes.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {employeeCertificates[0].attributes.certificate.data.attributes.name}
                                    </a>
                                </Typography>
                            )}
                        </SubCard>
                    </Grid>
                )}

                {selectedEmployee && (
                    <Grid item xs={12}>
                        <SubCard title={`Completed Courses for ${selectedEmployee.label}`}>
                            {employeeCourses.length > 0 ? (
                                <List>
                                    {employeeCourses.map(employeeCourse => {
                                        const completionDate = employeeCourse.attributes.DateCompleted;
                                        const formattedCompletionDate = completionDate ? formatDate(completionDate) : null;
                                        const expiryDate = calculateExpiryDate(
                                            completionDate,
                                            employeeCourse.attributes.course.data.attributes.YearsExpire
                                        );
                                        const highlightColor = getHighlightColor(completionDate, expiryDate);

                                        return (
                                            <ListItem
                                                key={employeeCourse.id}
                                                style={{ backgroundColor: highlightColor }}
                                            >
                                                <ListItemText
                                                    primary={employeeCourse.attributes.course.data.attributes.name}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2">
                                                                {formattedCompletionDate ? `Completed on ${formattedCompletionDate}` : 'Not yet completed'}
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