import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Alert, Select, MenuItem, List, ListItem, ListItemText, FormControl, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';

// version 1546

const EmployeeListItem = ({ employee }) => {
    return (
        <ListItem>
            <ListItemText
                primary={`${employee.fullname}, ${employee.email}, ${employee.jobtitle}`}
                style={{ color: employee.exists ? 'red' : 'inherit' }}
            />
        </ListItem>
    );
};

EmployeeListItem.propTypes = {
    employee: PropTypes.shape({
        fullname: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        jobtitle: PropTypes.string.isRequired,
        exists: PropTypes.bool.isRequired
    }).isRequired
};

const Employeeupload = () => {
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
                    driving_license_expiry
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
                    exists: false
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
                        return true;
                    } else {
                        return false;
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
            const uniqueEmails = new Set();
            const uniqueEmployees = employees.filter((employee) => {
                if (uniqueEmails.has(employee.email) || employee.exists) {
                    return false;
                }
                uniqueEmails.add(employee.email);
                return true;
            });

            const createPromises = uniqueEmployees.map((employee) => {
                const data = { ...employee, company: selectedCompany };
                delete data.exists;

                return fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data })
                }).then((response) => {
                    if (!response.ok) {
                        return response.json().then((error) => {
                            throw new Error(`HTTP ${response.status} - ${JSON.stringify(error)}`);
                        });
                    }
                    return response.json();
                });
            });

            Promise.all(createPromises)
                .then((data) => {
                    console.log('Employees created successfully:', data);
                    setUpdateSuccess(true);
                    setTimeout(() => {
                        setUpdateSuccess(false);
                    }, 3000);
                })
                .catch((error) => {
                    console.error('Error creating employees:', error);
                    // Handle the error scenario
                });
        }
    };

    const handleDownloadSampleCSV = () => {
        const link = document.createElement('a');
        link.href = '/xyz_test.csv';
        link.download = 'xyz_test.csv';
        link.click();
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">Please upload a CSV file to add new employees</Typography>
            </Grid>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel id="company-select-label">Select a company</InputLabel>
                    <Select labelId="company-select-label" value={selectedCompany} onChange={handleCompanyChange} label="Select a company">
                        <MenuItem value="">Select a company</MenuItem>
                        {companies.map((company) => (
                            <MenuItem key={company.id} value={company.id}>
                                {company.attributes.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                {employees.length > 0 && <Typography variant="body1">List of names from the import.</Typography>}
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" onClick={handleCSVSubmit} disabled={!csvFile || !selectedCompany}>
                    Submit these new employees?
                </Button>
                {updateSuccess && (
                    <Alert severity="success" style={{ marginTop: '1rem' }}>
                        Employees have been successfully created!
                    </Alert>
                )}
            </Grid>
            <Grid item xs={12}>
                <Button variant="outlined" onClick={handleDownloadSampleCSV}>
                    Download Sample CSV
                </Button>
            </Grid>
        </Grid>
    );
};

export default Employeeupload;
