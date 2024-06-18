import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useParams } from 'react-router-dom';

const SkillsByCo = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { companyId, skillId, courseId } = useParams();

  useEffect(() => {
    const fetchEmployeesAndCourses = async () => {
      try {
        const response = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][id][$eq]=${companyId}&populate=skills.courses`);
        const employeesData = response.data.data;

        console.log('Employees Data:', employeesData);

        if (employeesData.length === 0) {
          setError('No employees found for the selected company.');
          setLoading(false);
          return;
        }

        const employeesWithCourseCompletion = await Promise.all(employeesData.map(async (employee) => {
          const employeeCoursesRes = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee.id}&populate=*`);
          const completedCourses = employeeCoursesRes.data.data.filter(ec => ec.attributes.DateCompleted !== null).map(ec => ({
            id: ec.attributes.course.data.id,
            dateCompleted: new Date(ec.attributes.DateCompleted),
            yearsExpire: ec.attributes.course.data.attributes.YearsExpire
          }));

          const skillsWithCompletion = employee.attributes.skills.data
            .filter(skill => !skillId || skill.id === parseInt(skillId, 10))
            .map(skill => {
              const coursesWithCompletion = skill.attributes.courses.data
                .filter(course => !courseId || course.id === parseInt(courseId, 10))
                .map(course => {
                  const completedCourse = completedCourses.find(cc => cc.id === course.id);
                  const dateExpires = completedCourse ? new Date(completedCourse.dateCompleted.getFullYear() + completedCourse.yearsExpire, completedCourse.dateCompleted.getMonth(), completedCourse.dateCompleted.getDate()).toLocaleDateString('en-GB') : null;
                  return {
                    ...course,
                    completed: !!completedCourse,
                    dateExpires
                  };
                });
              return { ...skill, attributes: { ...skill.attributes, courses: { data: coursesWithCompletion } } };
            });

          console.log('Skills with Completion:', skillsWithCompletion);

          return { ...employee, attributes: { ...employee.attributes, skills: { data: skillsWithCompletion } } };
        }));

        console.log('Employees with Course Completion:', employeesWithCourseCompletion);

        const filteredEmployees = employeesWithCourseCompletion.filter(employee =>
          employee.attributes.skills.data.some(skill => !skillId || skill.id === parseInt(skillId, 10))
        );

        setEmployees(filteredEmployees);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data.');
        setLoading(false);
      }
    };

    if (companyId) {
      fetchEmployeesAndCourses();
    } else {
      setError('Invalid company ID.');
      setLoading(false);
    }
  }, [companyId, skillId, courseId]);

  const getHighlightColor = (dateCompleted, dateExpires) => {
    if (!dateCompleted) {
      return 'rgba(255, 0, 0, 0.1)'; // Transparent red for not completed
    }

    const today = new Date();
    const expiryDate = new Date(dateExpires);
    const threeMothsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

    if (expiryDate < today) {
      return 'rgba(255, 0, 0, 0.1)'; // Transparent red for expired
    } else if (expiryDate < threeMothsFromNow) {
      return 'rgba(255, 255, 0, 0.1)'; // Transparent yellow for expiring within 3 months
    } else {
      return 'rgba(0, 255, 0, 0.1)'; // Transparent green for completed and not expiring soon
    }
  };

  if (loading) {
    return (
      <MainCard title="MTS Training Status by Skill">
        <Typography variant="body1">Loading...</Typography>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="MTS Training Status by Skill">
        <Typography variant="body1">{error}</Typography>
      </MainCard>
    );
  }

  return (
    <MainCard title="MTS Training Status by Skill">
      <Typography variant="H2" sx={{ mb: 2 }}></Typography>

      <Box sx={{ mt: 3 }}>
        {employees.length > 0 ? (
          employees.map((employee) => (
            <Box key={employee.id} sx={{ mt: 4 }}>
              <Typography variant="h3">{employee.attributes.fullname} - {employee.attributes.jobtitle}</Typography>
              {employee.attributes.skills.data.length > 0 ? (
                employee.attributes.skills.data.map((skill) => (
                  <Box key={skill.id} sx={{ ml: 2, mt: 2 }}>
                    <Typography variant="h4">
                      {skill.attributes.role} - {skill.attributes.description}
                    </Typography>
                    {skill.attributes.courses.data.length > 0 ? (
                      <TableContainer component={Paper} sx={{ mt: 1 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Course Name</TableCell>
                              <TableCell>Date Expires</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {skill.attributes.courses.data.map((course) => (
                              <TableRow
                                key={course.id}
                                sx={{
                                  backgroundColor: getHighlightColor(course.completed ? course.dateExpires : null, course.dateExpires)
                                }}
                              >
                                <TableCell>{course.attributes.name}</TableCell>
                                <TableCell>{course.dateExpires || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" sx={{ ml: 4 }}>No courses listed for this skill.</Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ ml: 2 }}>No skills listed.</Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body1">No employees found for the selected skill.</Typography>
        )}
      </Box>
    </MainCard>
  );
};

export default SkillsByCo;
