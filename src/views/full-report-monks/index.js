import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

const SkillsByCo = () => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployeesAndCourses = async () => {
            const companyName = 'Monks Training Services';

            const response = await axios.get(
                `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][name][$eq]=${companyName}&populate=skills.courses`
            );
            const employeesData = response.data.data;

            const employeesWithCourseCompletion = await Promise.all(
                employeesData.map(async (employee) => {
                    const employeeCoursesRes = await axios.get(
                        `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee.id}&populate=*`
                    );
                    const completedCourses = employeeCoursesRes.data.data
                        .filter((ec) => ec.attributes.DateCompleted !== null)
                        .map((ec) => ({
                            id: ec.attributes.course.data.id,
                            dateCompleted: new Date(ec.attributes.DateCompleted),
                            yearsExpire: ec.attributes.course.data.attributes.YearsExpire
                        }));

                    const skillsWithCompletion = employee.attributes.skills.data.map((skill) => {
                        const coursesWithCompletion = skill.attributes.courses.data.map((course) => {
                            const completedCourse = completedCourses.find((cc) => cc.id === course.id);
                            const dateExpires = completedCourse
                                ? new Date(
                                      completedCourse.dateCompleted.getFullYear() + completedCourse.yearsExpire,
                                      completedCourse.dateCompleted.getMonth(),
                                      completedCourse.dateCompleted.getDate()
                                  ).toLocaleDateString('en-GB')
                                : null;
                            return {
                                ...course,
                                completed: !!completedCourse,
                                dateExpires
                            };
                        });
                        return { ...skill, attributes: { ...skill.attributes, courses: { data: coursesWithCompletion } } };
                    });

                    return { ...employee, attributes: { ...employee.attributes, skills: { data: skillsWithCompletion } } };
                })
            );

            setEmployees(employeesWithCourseCompletion);
        };

        fetchEmployeesAndCourses();
    }, []);

    return (
        <MainCard title="MTS Training Status by Skill">
            <Typography variant="H2" sx={{ mb: 2 }}></Typography>

            <Box sx={{ mt: 3 }}>
                {employees.length > 0 ? (
                    employees.map((employee) => (
                        <Box key={employee.id} sx={{ mt: 4 }}>
                            <Typography variant="h3">
                                {employee.attributes.fullname} - {employee.attributes.jobtitle}
                            </Typography>
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
                                                            <TableCell>Status</TableCell>
                                                            <TableCell>Date Expires</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {skill.attributes.courses.data.map((course) => (
                                                            <TableRow key={course.id}>
                                                                <TableCell>{course.attributes.name}</TableCell>
                                                                <TableCell>
                                                                    {course.completed ? (
                                                                        <Chip label="Completed" color="success" size="small" />
                                                                    ) : (
                                                                        <Chip label="Not Completed" color="error" size="small" />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>{course.dateExpires || '-'}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography variant="body2" sx={{ ml: 4 }}>
                                                No courses listed for this skill.
                                            </Typography>
                                        )}
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ ml: 2 }}>
                                    No skills listed.
                                </Typography>
                            )}
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1">No employees found for Monks Training Services.</Typography>
                )}
            </Box>
        </MainCard>
    );
};

export default SkillsByCo;
