import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Grid, Card, CardContent, CircularProgress, List, ListItem, ListItemText } from '@mui/material';

const Employee = () => {
    const { id, courseId } = useParams();
    const [employeeData, setEmployeeData] = useState(null);
    const [employeeCourses, setEmployeeCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employeeResponse, employeeCoursesResponse] = await Promise.all([
                    fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/${id}`),
                    fetch(
                        `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${id}&populate[course]=name,shortname,datecompleted,YearsExpire`
                    )
                ]);

                const employeeData = await employeeResponse.json();
                const employeeCoursesData = await employeeCoursesResponse.json();

                setEmployeeData(employeeData.data);
                setEmployeeCourses(employeeCoursesData.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

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

    if (isLoading) {
        return (
            <Grid container justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Grid>
        );
    }

    if (!employeeData) {
        return (
            <Grid container justifyContent="center" alignItems="center" minHeight="200px">
                <Typography variant="h4">Employee not found</Typography>
            </Grid>
        );
    }

    const { fullname, jobtitle, email, hometel, mobiletel, startdate, CompanyBranch } = employeeData.attributes;

    const selectedCourse = employeeCourses.find((course) => course.attributes.course.data.id === parseInt(courseId));

    const completionDate = selectedCourse?.attributes?.DateCompleted;
    const expiryDate = calculateExpiryDate(completionDate, selectedCourse?.attributes?.course?.data?.attributes?.YearsExpire);
    const highlightColor = getHighlightColor(completionDate, expiryDate);

    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" component="div">
                                Employee Details
                            </Typography>
                            <Typography variant="body1">Name: {fullname}</Typography>
                            <Typography variant="body1">Job Title: {jobtitle}</Typography>
                            <Typography variant="body1">Email: {email}</Typography>
                            <Typography variant="body1">Home Tel: {hometel}</Typography>
                            <Typography variant="body1">Mobile Tel: {mobiletel}</Typography>
                            <Typography variant="body1">Start Date: {formatDate(startdate)}</Typography>
                            <Typography variant="body1">Company Branch: {CompanyBranch}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    {selectedCourse ? (
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    Course Completed by {fullname}
                                </Typography>
                                <List>
                                    <ListItem style={{ backgroundColor: highlightColor }}>
                                        <ListItemText
                                            primary={selectedCourse.attributes?.course?.data?.attributes?.name || 'N/A'}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2">
                                                        {completionDate
                                                            ? `Completed on ${formatDate(completionDate)}`
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
                                </List>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    Course not found for {fullname}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </div>
    );
};

export default Employee;
