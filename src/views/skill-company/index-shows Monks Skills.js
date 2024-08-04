import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Chip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Chart from 'react-apexcharts';

const SkillsByCo = () => {
    const [employees, setEmployees] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);

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
                        .map((ec) => ec.attributes.course.data.id);

                    const skillsWithCompletion = employee.attributes.skills.data.map((skill) => {
                        const coursesWithCompletion = skill.attributes.courses.data.map((course) => ({
                            ...course,
                            completed: completedCourses.includes(course.id)
                        }));
                        return { ...skill, attributes: { ...skill.attributes, courses: { data: coursesWithCompletion } } };
                    });

                    return { ...employee, attributes: { ...employee.attributes, skills: { data: skillsWithCompletion } } };
                })
            );

            setEmployees(employeesWithCourseCompletion); // Update employees state

            // Map employees to array of course completion objects
            const courseCompletions = employeesWithCourseCompletion.map((employee) => {
                // Map skills to flatten courses
                const employeeCourses = employee.attributes.skills.data.flatMap((skill) =>
                    skill.attributes.courses.data.map((course) => ({
                        name: course.attributes.name,
                        employee: employee.attributes.fullname,
                        completed: course.completed
                    }))
                );

                return employeeCourses;
            });

            // Flatten array
            const heatmapSeries = courseCompletions.flat();

            // const series = [{
            //  data: heatmapSeries
            // }];

            setHeatmapData(heatmapSeries);
        };

        fetchEmployeesAndCourses();
    }, []);

    return (
        <MainCard title="FULL REPORT: Monks Training Services">
            <Typography variant="body2" sx={{ mb: 2 }}>
                This report shows employees, their skills, and related courses (including completion status) for Monks Training Services.
            </Typography>

            <Box sx={{ mt: 3 }}>
                {employees.length > 0 ? (
                    employees.map((employee) => (
                        <Box key={employee.id} sx={{ mt: 2 }}>
                            <Typography variant="h6">
                                {employee.attributes.fullname} - {employee.attributes.jobtitle}
                            </Typography>
                            {employee.attributes.skills.data.length > 0 ? (
                                employee.attributes.skills.data.map((skill) => (
                                    <Box key={skill.id} sx={{ ml: 2 }}>
                                        <Typography variant="body1">
                                            Skill: {skill.attributes.role} - {skill.attributes.description}
                                        </Typography>
                                        {skill.attributes.courses.data.length > 0 ? (
                                            skill.attributes.courses.data.map((course) => (
                                                <Typography key={course.id} variant="body2" sx={{ ml: 4 }}>
                                                    Course: {course.attributes.name}
                                                    {course.completed ? (
                                                        <Chip label="Completed" color="success" size="small" />
                                                    ) : (
                                                        <Chip label="Not Completed" color="error" size="small" />
                                                    )}
                                                </Typography>
                                            ))
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

            {/* ApexCharts Heatmap */}
            <Box sx={{ mt: 3 }}>
                <Chart
                    type="heatmap"
                    height={350}
                    series={heatmapData}
                    options={{
                        chart: {
                            toolbar: { show: false }
                        },
                        dataLabels: { enabled: false },
                        colors: ['#00E096', '#FF4560'], // Green for completed, red for not completed
                        xaxis: {
                            labels: { rotate: -45 }
                        }
                    }}
                />
            </Box>
        </MainCard>
    );
};

export default SkillsByCo;
