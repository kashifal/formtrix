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
                type: 'heatmap',
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        const skillIndex = config.seriesIndex;
                        const courseIndex = config.dataPointIndex;

                        const selectedSkill = chartData.options.yaxis.categories[skillIndex];
                        const selectedCourse = chartData.options.xaxis.categories[courseIndex];

                        console.log('Selected Skill:', selectedSkill);
                        console.log('Selected Course:', selectedCourse);

                        const selectedEmployee = employees.find((employee) =>
                            employee.attributes.skills.data.some(
                                (skill) =>
                                    skill.attributes.role === selectedSkill &&
                                    skill.attributes.courses.data.some((course) => course.attributes.shortname === selectedCourse)
                            )
                        );

                        console.log('Selected Employee:', selectedEmployee);

                        if (selectedEmployee) {
                            const companyId = selectedEmployee.attributes.company.data.id;
                            const skillId = selectedEmployee.attributes.skills.data.find(
                                (skill) => skill.attributes.role === selectedSkill
                            ).id;

                            const url = `/skill-report/${companyId}/${skillId}`;
                            console.log('Redirecting to:', url);
                            window.location.href = url; // Or use your routing method
                        }
                    }
                }
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
                    shadeIntensity: 1,
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
                text: 'Skills overview by Company'
            }
        },
        series: []
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get(
                    'https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?fields=name&populate=name'
                );
                setCompanies(response.data.data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            const fetchEmployeesAndCourses = async () => {
                try {
                    const response = await axios.get(
                        `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][name][$eq]=${selectedCompany}&populate=skills.courses,company`
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

                            return {
                                ...employee,
                                attributes: {
                                    ...employee.attributes,
                                    skills: {
                                        data: employee.attributes.skills.data.map((skill) => ({
                                            ...skill,
                                            attributes: {
                                                ...skill.attributes,
                                                courses: {
                                                    data: skill.attributes.courses.data.map((course) => ({
                                                        ...course,
                                                        completed: completedCourses.includes(course.id)
                                                    }))
                                                }
                                            }
                                        }))
                                    }
                                }
                            };
                        })
                    );

                    setEmployees(employeesWithCourseCompletion);
                } catch (error) {
                    console.error('Error fetching employees and courses:', error);
                }
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

        employees.forEach((employee) => {
            employee.attributes.skills.data.forEach((skill) => {
                const skillName = skill.attributes.role;
                skillsSet.add(skillName);

                skill.attributes.courses.data.forEach((course) => {
                    const courseName = course.attributes.shortname;
                    coursesSet.add(courseName);
                    const key = `${skillName}|${courseName}`;

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

        const dataMap = {};
        for (const [key, { completed, total }] of Object.entries(completionCountPerCourse)) {
            dataMap[key] = completed === 0 ? 0 : completed === total ? 2 : 1;
        }

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
                xaxis: { ...prevState.options.xaxis, categories: courses },
                yaxis: { ...prevState.options.yaxis, categories: skills }
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
