import React, { useState, useEffect } from 'react';
import {
    Autocomplete,
    Grid,
    TextField,
    List,
    ListItem,
    ListItemText,
    Typography,
    IconButton,
    ListItemSecondaryAction,
    Button
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const EmployeeFilter = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeCourses, setEmployeeCourses] = useState([]);
    const [employeeCertificates, setEmployeeCertificates] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const fetchCompanies = useCallback(() => {
        const apiUrl = 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies';

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const formattedCompanies = data.data.map((company) => ({
                    label: company.attributes.name,
                    id: company.id
                }));
                setCompanies(formattedCompanies);
            });
    }, []);

    const fetchSkills = useCallback(() => {
        const apiUrl = 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills';

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const formattedSkills = data.data.map((skill) => ({
                    label: skill.attributes.role,
                    id: skill.id
                }));
                setSkills(formattedSkills);
            });
    }, []);

    const fetchBranches = useCallback(() => {
        const apiUrl = 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?fields[0]=CompanyBranch';

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const formattedBranches = [...new Set(data.data.map((employee) => employee.attributes.CompanyBranch))].map((branch) => ({
                    label: branch,
                    value: branch
                }));
                setBranches(formattedBranches);
            });
    }, []);

    const fetchEmployees = useCallback(() => {
        let apiUrl = 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees';

        let filters = [];

        if (selectedCompany) {
            filters.push(`filters[company][id][$eq]=${selectedCompany.id}`);
        }

        if (selectedSkill) {
            filters.push(`filters[skills][id][$eq]=${selectedSkill.id}`);
        }

        if (selectedBranch) {
            filters.push(`filters[CompanyBranch][$eq]=${selectedBranch.value}`);
        }

        if (filters.length > 0) {
            apiUrl += `?${filters.join('&')}`;
        }

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const formattedEmployees = data.data.map((employee) => ({
                    label: employee.attributes.fullname,
                    id: employee.id,
                    ...employee.attributes
                }));
                setEmployees(formattedEmployees);
            });
    }, [selectedCompany, selectedSkill, selectedBranch]);

    const fetchEmployeeCourses = useCallback(() => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${selectedEmployee.id}&populate[course]=name,shortname,datecompleted,YearsExpire`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                setEmployeeCourses(data.data);
            });
    }, [selectedEmployee]);

    const fetchEmployeeCertificates = useCallback(() => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/certificates?populate=*&filters[employee][id][$eq]=${selectedEmployee.id}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                setEmployeeCertificates(data.data);
            });
    }, [selectedEmployee]);

    useEffect(() => {
        fetchCompanies();
        fetchSkills();
        fetchBranches();
        fetchEmployees();
    }, [fetchCompanies, fetchSkills, fetchBranches, fetchEmployees]);

    useEffect(() => {
        fetchEmployees();
    }, [selectedCompany, selectedSkill, selectedBranch, fetchEmployees]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeCourses();
            fetchEmployeeCertificates();
        }
    }, [selectedEmployee, fetchEmployeeCourses, fetchEmployeeCertificates]);

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
            return formatDate(expiryDate); // Use the formatDate function for consistent formatting
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

    const handleCertificateClick = (employeeCourse) => {
        const certificate = employeeCertificates.find(
            (certificate) => certificate.attributes.course.data.id === employeeCourse.attributes.course.data.id
        );

        if (certificate) {
            window.open(certificate.attributes.certificate.data.attributes.url, '_blank');
        }
    };

    const handleClearFilters = () => {
        setSelectedCompany(null);
        setSelectedSkill(null);
        setSelectedBranch(null);
        setSelectedEmployee(null);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const tableColumn = ['Course Name', 'Completion Date', 'Expiry Date'];
        const tableRows = [];

        employeeCourses.forEach((employeeCourse) => {
            const completionDate = employeeCourse.attributes.DateCompleted;
            const formattedCompletionDate = completionDate ? formatDate(completionDate) : 'Not yet completed';
            const expiryDate = calculateExpiryDate(completionDate, employeeCourse.attributes.course.data.attributes.YearsExpire);

            const courseData = [employeeCourse.attributes.course.data.attributes.name, formattedCompletionDate, expiryDate];
            tableRows.push(courseData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text(`Completed Courses for ${selectedEmployee.fullname}`, 14, 15);
        doc.save(`completed_courses_${selectedEmployee.fullname}.pdf`);
    };

    return (
        <MainCard title="Courses Completed Per Employee">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <SubCard title="Filter Options">
                        <Grid container direction="column" spacing={3}>
                            <Grid item>
                                <Autocomplete
                                    disableClearable
                                    options={companies}
                                    getOptionLabel={(option) => option.label}
                                    value={selectedCompany}
                                    onChange={(event, newValue) => {
                                        setSelectedCompany(newValue);
                                        setSelectedEmployee(null);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Company" />}
                                />
                            </Grid>
                            <Grid item>
                                <Autocomplete
                                    disableClearable
                                    options={skills}
                                    getOptionLabel={(option) => option.label}
                                    value={selectedSkill}
                                    onChange={(event, newValue) => {
                                        setSelectedSkill(newValue);
                                        setSelectedEmployee(null);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Skill" />}
                                />
                            </Grid>
                            <Grid item>
                                <Autocomplete
                                    disableClearable
                                    options={branches}
                                    getOptionLabel={(option) => option.label}
                                    value={selectedBranch}
                                    onChange={(event, newValue) => {
                                        setSelectedBranch(newValue);
                                        setSelectedEmployee(null);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Branch" />}
                                />
                            </Grid>
                            <Grid item>
                                <Button variant="contained" onClick={handleClearFilters}>
                                    Clear Filters
                                </Button>
                            </Grid>
                        </Grid>
                    </SubCard>
                </Grid>

                <Grid item xs={12}>
                    <SubCard title="Employee List">
                        {employees.length > 0 ? (
                            <List>
                                {employees.map((employee) => (
                                    <ListItem key={employee.id} button onClick={() => setSelectedEmployee(employee)}>
                                        <ListItemText primary={employee.fullname} secondary={employee.jobtitle} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>No employees found.</Typography>
                        )}
                    </SubCard>
                </Grid>

                {selectedEmployee && (
                    <Grid item xs={12}>
                        <SubCard title={`Employee Details for ${selectedEmployee.fullname}`}>
                            <Typography>
                                <b>Archived:</b> Current Employee
                            </Typography>
                            <Typography>
                                <b>Fullname:</b> {selectedEmployee.fullname}
                            </Typography>
                            <Typography>
                                <b>Job Title:</b> {selectedEmployee.jobtitle}
                            </Typography>
                            <Typography>
                                <b>Address:</b> {selectedEmployee.address}
                            </Typography>
                            <Typography>
                                <b>Email:</b> {selectedEmployee.email}
                            </Typography>
                            <Typography>
                                <b>Home Tel:</b> {selectedEmployee.hometel}
                            </Typography>
                            <Typography>
                                <b>Mobile Tel:</b> {selectedEmployee.mobiletel}
                            </Typography>
                            <Typography>
                                <b>Date of Birth:</b> {formatDate(selectedEmployee.dob)}
                            </Typography>
                            <Typography>
                                <b>National Insurance Number:</b> {selectedEmployee.ni}
                            </Typography>
                            <Typography>
                                <b>Start Date:</b> {formatDate(selectedEmployee.startdate)}
                            </Typography>
                            <Typography>
                                <b>Any Certificates?</b> {employeeCertificates.length > 0 ? 'Yes' : 'No'}
                            </Typography>
                        </SubCard>
                    </Grid>
                )}

                {selectedEmployee && (
                    <Grid item xs={12}>
                        <SubCard title={`Completed Courses for ${selectedEmployee.label}`}>
                            {employeeCourses.length > 0 ? (
                                <>
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
                                                    <ListItemSecondaryAction>
                                                        {employeeCertificates.find(
                                                            (certificate) =>
                                                                certificate.attributes.course.data.id ===
                                                                employeeCourse.attributes.course.data.id
                                                        ) && (
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="certificate"
                                                                onClick={() => handleCertificateClick(employeeCourse)}
                                                            >
                                                                <InsertDriveFileIcon />
                                                            </IconButton>
                                                        )}
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                    <Button variant="contained" onClick={generatePDF}>
                                        Generate PDF
                                    </Button>
                                </>
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

export default EmployeeFilter;
