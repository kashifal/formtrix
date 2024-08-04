import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

const EmCourse = () => {
    const { employee, course } = useParams();
    const [employeeName, setEmployeeName] = useState('');
    const [courseData, setCourseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employeeResponse, courseResponse] = await Promise.all([
                    fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/${employee}`),
                    fetch(
                        `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee}&populate[course]=name,shortname,datecompleted`
                    )
                ]);

                const employeeData = await employeeResponse.json();
                const courseData = await courseResponse.json();

                setEmployeeName(employeeData.data.attributes.fullname);
                setCourseData(courseData.data[0].attributes);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [employee]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h3" component="div">
                                Name: {employeeName}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h3" component="div">
                                Course: {decodeURIComponent(course)}
                            </Typography>
                            {/* Here you can add additional content related to the skill */}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            {courseData.DateCompleted ? (
                                <Typography variant="body2">
                                    Completed on: {new Date(courseData.DateCompleted).toLocaleDateString()}
                                </Typography>
                            ) : (
                                <Typography variant="body2">Not completed yet</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default EmCourse;
