import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, List, ListItem, ListItemText, Typography, IconButton, ListItemSecondaryAction } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const EmployeeSkill = () => {
    const { companyId, skillId } = useParams();
    const [employees, setEmployees] = useState([]);
    const [employeeCourses, setEmployeeCourses] = useState([]);
    const [employeeCertificates, setEmployeeCertificates] = useState([]);

    const fetchEmployees = useCallback(() => {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][id][$eq]=${companyId}&filters[skills][id][$eq]=${skillId}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.data) {
                    const formattedEmployees = data.data.map((employee) => ({
                        label: employee.attributes.fullname,
                        id: employee.id,
                        ...employee.attributes
                    }));
                    setEmployees(formattedEmployees);
                } else {
                    setEmployees([]);
                }
            })
            .catch(() => setEmployees([]));
    }, [companyId, skillId]);

    const fetchEmployeeCourses = useCallback(() => {
        const employeeIds = employees.map((emp) => emp.id).join(',');
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$in]=${employeeIds}&populate[course]=name,shortname,datecompleted,YearsExpire`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.data) {
                    setEmployeeCourses(data.data);
                } else {
                    setEmployeeCourses([]);
                }
            })
            .catch(() => setEmployeeCourses([]));
    }, [employees]);

    const fetchEmployeeCertificates = useCallback(() => {
        const employeeIds = employees.map((emp) => emp.id).join(',');
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/certificates?populate=*&filters[employee][id][$in]=${employeeIds}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.data) {
                    setEmployeeCertificates(data.data);
                } else {
                    setEmployeeCertificates([]);
                }
            })
            .catch(() => setEmployeeCertificates([]));
    }, [employees]);

    useEffect(() => {
        fetchEmployees();
    }, [companyId, skillId, fetchEmployees]);

    useEffect(() => {
        if (employees && employees.length > 0) {
            fetchEmployeeCourses();
            fetchEmployeeCertificates();
        }
    }, [employees, fetchEmployeeCourses, fetchEmployeeCertificates]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
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

    const handleCertificateClick = (employeeCourse) => {
        const certificate = employeeCertificates.find(
            (certificate) => certificate.attributes.course.data.id === employeeCourse.attributes.course.data.id
        );

        if (certificate) {
            window.open(certificate.attributes.certificate.data.attributes.url, '_blank');
        }
    };

    return (
        <MainCard title="Courses Completed Per Employee">
            <Grid container spacing={gridSpacing}>
                {employees.map((employee) => (
                    <Grid item xs={12} key={employee.id}>
                        <SubCard title={`Employee Details for ${employee.fullname}`}>
                            <Typography>
                                <b>Archived:</b> Current Employee
                            </Typography>
                            <Typography>
                                <b>Fullname:</b> {employee.fullname}
                            </Typography>
                            <Typography>
                                <b>Job Title:</b> {employee.jobtitle}
                            </Typography>
                            <Typography>
                                <b>Address:</b> {employee.address}
                            </Typography>
                            <Typography>
                                <b>Email:</b> {employee.email}
                            </Typography>
                            <Typography>
                                <b>Home Tel:</b> {employee.hometel}
                            </Typography>
                            <Typography>
                                <b>Mobile Tel:</b> {employee.mobiletel}
                            </Typography>
                            <Typography>
                                <b>Date of Birth:</b> {formatDate(employee.dob)}
                            </Typography>
                            <Typography>
                                <b>National Insurance Number:</b> {employee.ni}
                            </Typography>
                            <Typography>
                                <b>Start Date:</b> {formatDate(employee.startdate)}
                            </Typography>
                            <Typography>
                                <b>Any Certificates?</b> {employeeCertificates.length > 0 ? 'Yes' : 'No'}
                            </Typography>
                        </SubCard>
                        <SubCard title={`Completed Courses for ${employee.fullname}`}>
                            {employeeCourses.length > 0 ? (
                                <List>
                                    {employeeCourses
                                        .filter((course) => course.attributes.employee.data.id === employee.id)
                                        .map((employeeCourse) => {
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
                            ) : (
                                <Typography>No courses completed yet.</Typography>
                            )}
                        </SubCard>
                    </Grid>
                ))}
            </Grid>
        </MainCard>
    );
};

export default EmployeeSkill;
