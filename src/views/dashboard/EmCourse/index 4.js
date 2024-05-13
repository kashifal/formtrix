import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Grid, Card, CardContent, CircularProgress, List, ListItem, ListItemText } from '@mui/material';

const EmCourse = () => {
  const { employee, course } = useParams();
  const [employeeName, setEmployeeName] = useState('');
  const [courseCompleted, setCourseCompleted] = useState(null);
  const [employeeCourses, setEmployeeCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeResponse, courseResponse, employeeCoursesResponse] = await Promise.all([
          fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/${employee}`),
          fetch(
            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee}&populate[course]=name`
          ),
          fetch(
            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee}&populate[course]=name,shortname,datecompleted,YearsExpire`
          ),
        ]);

        const employeeData = await employeeResponse.json();
        const courseData = await courseResponse.json();
        const employeeCoursesData = await employeeCoursesResponse.json();

        setEmployeeName(employeeData.data.attributes.fullname);
        setCourseCompleted(courseData.data.find((course) => course.attributes.DateCompleted !== null));
        setEmployeeCourses(employeeCoursesData.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employee, course]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const isExpiringWithin3Months = (completionDate, yearsExpire) => {
    if (completionDate && yearsExpire) {
      const expiryDate = new Date(completionDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + yearsExpire);
      const currentDate = new Date();
      const threeMonthsLater = new Date(currentDate);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      return expiryDate <= threeMonthsLater;
    }
    return false;
  };

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Grid>
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
              <Typography variant="h4" component="div">
                Course: {decodeURIComponent(course)}
              </Typography>
              <Typography variant="h4">
                {courseCompleted ? (
                  `Completed on: ${formatDate(courseCompleted.attributes.DateCompleted)}`
                ) : (
                  'Not completed yet'
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Courses Completed by {employeeName}
              </Typography>
              <List>
                {employeeCourses.map((employeeCourse) => (
                  <ListItem key={employeeCourse.id}>
                    <ListItemText
                      primary={employeeCourse.attributes?.course?.data?.attributes?.name || 'N/A'}
                      secondary={
                        employeeCourse.attributes?.DateCompleted
                          ? `Completed on: ${formatDate(employeeCourse.attributes.DateCompleted)}${
                              isExpiringWithin3Months(
                                employeeCourse.attributes.DateCompleted,
                                employeeCourse.attributes.course.data.attributes.YearsExpire
                              )
                                ? ' - Expiring within 3 months'
                                : ''
                            }`
                          : 'Not completed yet'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default EmCourse;