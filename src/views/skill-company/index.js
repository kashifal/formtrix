import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, MenuItem, FormControl, Select, Box, Chip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import ApexCharts from 'apexcharts';

const SkillsByCo = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            const response = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?fields=name&populate=name');
            setCompanies(response.data.data);
        };

        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            const fetchEmployeesAndCourses = async () => {
                const response = await axios.get(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][name][$eq]=${selectedCompany}&populate=skills.courses`
                );
                const employeesData = response.data.data;

                // For each employee, fetch the EmployeeCourses to check course completion
                const employeesWithCourseCompletion = await Promise.all(
                    employeesData.map(async (employee) => {
                        const employeeCoursesRes = await axios.get(
                            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee.id}&populate=*`
                        );
                        const completedCourses = employeeCoursesRes.data.data
                            .filter((ec) => ec.attributes.DateCompleted !== null)
                            .map((ec) => ec.attributes.course.data.id);

                        // Mark each course as completed or not based on the EmployeeCourses data
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

                setEmployees(employeesWithCourseCompletion);

                const staffCourseData = employeesWithCourseCompletion.reduce((acc, employee) => {
                    acc[employee.attributes.fullname] = employee.attributes.skills.data.reduce((skillAcc, skill) => {
                        return skillAcc + skill.attributes.courses.data.filter((course) => course.completed).length;
                    }, 0);
                    return acc;
                }, {});

                const chartData = {
                    series: [
                        {
                            name: 'Courses Completed',
                            data: Object.values(staffCourseData)
                        }
                    ],
                    xaxis: {
                        categories: Object.keys(staffCourseData)
                    }
                };

                // Chart Options
                const chartOptions = {
                    chart: {
                        type: 'bar'
                        // Other chart customization options
                    }
                };

                // Render the chart
                const chart = new ApexCharts(document.querySelector('#staff-courses-chart'), { ...chartOptions, ...chartData });
                chart.render();

                setEmployees(employeesWithCourseCompletion); // assuming this triggers component update
            };

            fetchEmployeesAndCourses();
        } else {
            setEmployees([]);
        }
    }, [selectedCompany]);

    const handleCompanyChange = (event) => {
        setSelectedCompany(event.target.value);
    };
    return (
        <MainCard title="Skills and Courses Report">
            <Typography variant="body2" sx={{ mb: 2 }}>
                Select a company to view its employees, their skills, and related courses including completion status.
            </Typography>
            <FormControl fullWidth>
                <Select value={selectedCompany} onChange={handleCompanyChange} displayEmpty inputProps={{ 'aria-label': 'Without label' }}>
                    <MenuItem value="">
                        <em>Choose a company</em>
                    </MenuItem>
                    {companies.map((company) => (
                        <MenuItem key={company.id} value={company.attributes.name}>
                            {company.attributes.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
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
                                                    Course: {course.attributes.name} -{' '}
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
                    <Typography variant="body1">No employees found for this company or select a company to view details.</Typography>
                )}
            </Box>
        </MainCard>
    );
};

export default SkillsByCo;
