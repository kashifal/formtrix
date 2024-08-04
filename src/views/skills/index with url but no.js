import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, MenuItem, FormControl, Select, Box } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Chart from 'react-apexcharts';

const SkillsByCo = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [employees, setEmployees] = useState([]);
    const [chartData, setChartData] = useState({
        options: {
            chart: {
                type: 'heatmap'
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                type: 'category',
                categories: []
            },
            yaxis: {
                type: 'category',
                categories: []
            },
            plotOptions: {
                heatmap: {
                    colorScale: {
                        ranges: [
                            {
                                from: 0,
                                to: 0,
                                name: 'Not Started',
                                color: '#ff4560' // Red
                            },
                            {
                                from: 1,
                                to: 1,
                                name: 'In Progress',
                                color: '#f9c802' // Yellow
                            },
                            {
                                from: 2,
                                to: 2,
                                name: 'Fully Trained',
                                color: '#00e396' // Green
                            }
                        ]
                    }
                }
            },
            title: {
                text: 'Skills and Courses Completion'
            }
        },
        series: []
    });

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

                setEmployees(employeesWithCourseCompletion);
            };

            fetchEmployeesAndCourses();
        } else {
            setEmployees([]);
        }
    }, [selectedCompany]);

    useEffect(() => {
        const skillsSet = new Set();
        const coursesSet = new Set();
        const employeesPerSkill = {};
        const completionCountPerCourse = {};

        // Track skills, courses, and completion status
        employees.forEach((employee) => {
            employee.attributes.skills.data.forEach((skill) => {
                const skillName = skill.attributes.role;
                skillsSet.add(skillName);

                skill.attributes.courses.data.forEach((course) => {
                    const courseName = course.attributes.name;
                    coursesSet.add(courseName);
                    const key = `${skillName}|${courseName}`;

                    // Initialize tracking objects
                    if (!employeesPerSkill[skillName]) employeesPerSkill[skillName] = new Set();
                    if (!completionCountPerCourse[key]) completionCountPerCourse[key] = { completed: 0, total: 0 };

                    employeesPerSkill[skillName].add(employee.id);
                    completionCountPerCourse[key].total = employeesPerSkill[skillName].size;
                    if (course.completed) {
                        completionCountPerCourse[key].completed += 1;
                    }
                });
            });
        });

        // Determine course completion status for each skill
        const dataMap = {};
        for (const [key, { completed, total }] of Object.entries(completionCountPerCourse)) {
            dataMap[key] = completed === 0 ? 0 : completed === total ? 2 : 1;
        }

        // Convert sets to arrays for chart categories
        const skills = Array.from(skillsSet);
        const courses = Array.from(coursesSet);
        const series = skills.map((skill) => ({
            name: skill,
            data: courses.map((course) => {
                const key = `${skill}|${course}`;
                return dataMap[key] || 0;
            })
        }));

        setChartData((prevState) => ({
            ...prevState,
            options: {
                ...prevState.options,
                chart: {
                    ...prevState.options.chart,
                    events: {
                        dataPointSelection: (event, chartContext, config) => {
                            const company = selectedCompany;
                            const skill = config.w.config.series[config.seriesIndex].name;
                            const course = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;

                            const url = `/skill-report/${company}/${skill}/${course}/`;
                            window.location.href = url; // Or use your routing method
                        }
                    }
                }
            },
            series
        }));
    }, [employees]);

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
                <Chart options={chartData.options} series={chartData.series} type="heatmap" height={350} />
            </Box>
        </MainCard>
    );
};

export default SkillsByCo;
