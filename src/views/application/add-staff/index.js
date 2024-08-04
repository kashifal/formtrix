import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Alert, Select, MenuItem, List, ListItem, ListItemText } from '@mui/material';
import PropTypes from 'prop-types';

const EmployeeListItem = ({ employee }) => {
    return (
        <ListItem>
            <ListItemText
                primary={`${employee.fullname}, ${employee.email}, ${employee.jobtitle}`}
                secondary={`Completed Courses: ${employee.completedCourses.join(', ')}`}
                style={{ color: employee.exists ? 'green' : 'red' }}
            />
        </ListItem>
    );
};

EmployeeListItem.propTypes = {
    employee: PropTypes.shape({
        fullname: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        jobtitle: PropTypes.string.isRequired,
        completedCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
        exists: PropTypes.bool.isRequired
    }).isRequired
};

const CourseCompletionUpload = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [csvFile, setCSVFile] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = () => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies')
            .then((response) => response.json())
            .then((data) => {
                if (data && data.data) {
                    setCompanies(data.data);
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch((error) => console.error('Error fetching companies:', error));
    };

    const handleCompanyChange = (event) => {
        setSelectedCompany(event.target.value);
    };

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert('No file selected.');
            return;
        }
        setCSVFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target.result;
            const employees = csvData
                .split('\n')
                .slice(1)
                .map((row) => row.trim())
                .filter((row) => row !== '');
            const employeeRecords = employees.map((employee) => {
                const [
                    fullname,
                    email,
                    jobtitle,
                    address,
                    hometel,
                    mobiletel,
                    dob,
                    ni,
                    startdate,
                    uniqueCode,
                    CompanyBranch,
                    VideoTile,
                    archive,
                    driving_license_number,
                    driving_license_expiry,
                    ...completedCourses
                ] = employee.split(',').map((item) => item.trim());

                return {
                    fullname,
                    email,
                    jobtitle,
                    address,
                    hometel,
                    mobiletel,
                    dob,
                    ni,
                    startdate,
                    uniqueCode,
                    CompanyBranch,
                    VideoTile,
                    archive: archive === 'Y' || archive === 'y' || archive === 'true',
                    driving_license_number,
                    driving_license_expiry,
                    company: selectedCompany,
                    exists: false,
                    completedCourses
                };
            });
            setEmployees(employeeRecords);
            checkEmployeeExists(employeeRecords);
        };
        reader.readAsText(file);
    };

    const checkEmployeeExists = (employeeRecords) => {
        const emailPromises = employeeRecords.map((employee) => {
            const emailFilter = `filters[email][$eq]=${encodeURIComponent(employee.email.toLowerCase())}`;
            return fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?${emailFilter}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.data && data.data.length > 0) {
                        return data.data[0].id;
                    } else {
                        return null;
                    }
                })
                .catch((error) => console.error('Error checking employee existence:', error));
        });

        Promise.all(emailPromises)
            .then((existsArray) => {
                const updatedEmployees = employeeRecords.map((employee, index) => {
                    return { ...employee, exists: existsArray[index] };
                });
                setEmployees(updatedEmployees);
            })
            .catch((error) => console.error('Error checking employee existence:', error));
    };

    const handleCSVSubmit = () => {
        if (csvFile && selectedCompany) {
            const updatePromises = employees.map((employee) => {
                if (employee.exists) {
                    const data = {
                        data: {
                            completedCourses: employee.completedCourses,
                            fullname: employee.fullname,
                            email: employee.email,
                            jobtitle: employee.jobtitle,
                            address: employee.address,
                            hometel: employee.hometel,
                            mobiletel: employee.mobiletel,
                            dob: employee.dob,
                            ni: employee.ni,
                            startdate: employee.startdate,
                            uniqueCode: employee.uniqueCode,
                            CompanyBranch: employee.CompanyBranch,
                            VideoTile: employee.VideoTile,
                            archive: employee.archive,
                            driving_license_number: employee.driving_license_number,
                            driving_license_expiry: employee.driving_license_expiry,
                            company: selectedCompany
                        }
                    };

                    return fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/${employee.exists}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    }).then((response) => {
                        if (!response.ok) {
                            return response.json().then((error) => {
                                throw new Error(`HTTP ${response.status} - ${JSON.stringify(error)}`);
                            });
                        }
                        return response.json();
                    });
                }
                return Promise.resolve();
            });

            Promise.all(updatePromises)
                .then((data) => {
                    console.log('Course completion data updated successfully:', data);
                    setUpdateSuccess(true);
                    setTimeout(() => {
                        setUpdateSuccess(false);
                    }, 3000);
                })
                .catch((error) => {
                    console.error('Error updating course completion data:', error);
                    // Handle the error scenario
                });
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">Please upload a CSV file to update course completion data for employees</Typography>
            </Grid>
            <Grid item xs={12}>
                <Select value={selectedCompany} onChange={handleCompanyChange}>
                    <MenuItem value="">Select a company</MenuItem>
                    {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                            {company.attributes.name}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
            <Grid item xs={12}>
                <input type="file" accept=".csv" onChange={handleCSVUpload} />
            </Grid>
            <Grid item xs={12}>
                <List>
                    {employees.map((employee, index) => (
                        <EmployeeListItem key={index} employee={employee} />
                    ))}
                </List>
                {employees.length > 0 && (
                    <Typography variant="body1">Employees highlighted in green exist in Strapi, while those in red do not.</Typography>
                )}
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" onClick={handleCSVSubmit} disabled={!csvFile || !selectedCompany}>
                    Update course completion data
                </Button>
                {updateSuccess && (
                    <Alert severity="success" style={{ marginTop: '1rem' }}>
                        Course completion data has been successfully updated!
                    </Alert>
                )}
            </Grid>
        </Grid>
    );
};

export default CourseCompletionUpload;
