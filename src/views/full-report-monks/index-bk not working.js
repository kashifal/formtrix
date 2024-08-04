import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Chip, FormControl, Select, MenuItem } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Chart from 'react-apexcharts';

const SkillsByCo = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [employees, setEmployees] = useState([]);
    const [heatmapData, setHeatmapData] = useState({ series: [], categories: [] });

    useEffect(() => {
        const fetchCompanies = async () => {
            const response = await axios.get('http://localhost:1337/api/companies?fields=name&populate=name');
            setCompanies(response.data.data);
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            const fetchEmployeesAndCourses = async () => {
                const response = await axios.get(
                    `http://localhost:1337/api/employees?filters[company][name][$eq]=${selectedCompany}&populate=skills.courses`
                );
                const employeesData = response.data.data;
                setEmployees(employeesData); // Set employees state
                prepareHeatmapData(employeesData);
            };
            fetchEmployeesAndCourses();
        } else {
            setEmployees([]);
            setHeatmapData({ series: [], categories: [] });
        }
    }, [selectedCompany]);

    const handleCompanyChange = (event) => {
        setSelectedCompany(event.target.value);
    };

    const prepareHeatmapData = (employeesData) => {
        let skillsCoursesMap = {}; // Map to hold skill -> courses -> completion count
        let coursesMap = {}; // Maps course ID to its name

        employeesData.forEach((employee) => {
            employee.attributes.skills.data.forEach((skill) => {
                skill.attributes.courses.data.forEach((course) => {
                    if (!skillsCoursesMap[skill.id]) {
                        skillsCoursesMap[skill.id] = { skillName: skill.attributes.role, courses: {} };
                    }
                    if (!skillsCoursesMap[skill.id].courses[course.id]) {
                        skillsCoursesMap[skill.id].courses[course.id] = { courseName: course.attributes.name, completed: 0, total: 0 };
                        coursesMap[course.id] = course.attributes.name;
                    }
                    let courseData = skillsCoursesMap[skill.id].courses[course.id];
                    courseData.total += 1;
                    if (course.attributes.completed) {
                        // Ensure to access 'completed' correctly
                        courseData.completed += 1;
                    }
                });
            });
        });

        let series = Object.keys(skillsCoursesMap).map((skillId) => {
            let skill = skillsCoursesMap[skillId];
            return {
                name: skill.skillName,
                data: Object.keys(skill.courses).map((courseId) => {
                    let course = skill.courses[courseId];
                    let color;
                    if (course.total === 0) color = 'white';
                    else if (course.completed === 0) color = 'red';
                    else if (course.completed < course.total) color = 'yellow';
                    else color = 'green';
                    return { x: course.courseName, y: course.completed, fillColor: color };
                })
            };
        });

        setHeatmapData({
            series: series,
            categories: Object.values(coursesMap)
        });
    };

    return (
        <MainCard>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Select a company to view its employees, their skills, and related courses including completion status.
            </Typography>
            <FormControl fullWidth>
                <Select value={selectedCompany} onChange={handleCompanyChange} displayEmpty inputProps={{ 'aria-label': 'Without label' }}>
                    <MenuItem value="">Choose a company</MenuItem>
                    {companies.map((company) => (
                        <MenuItem key={company.id} value={company.attributes.name}>
                            {company.attributes.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box sx={{ mt: 3 }}>
                {employees.length > 0 ? (
                    <React.Fragment>
                        {employees.map((employee) => (
                            <Box key={employee.id} sx={{ mt: 2 }}>
                                <Typography variant="h6">
                                    {employee.attributes.fullname} - {employee.attributes.jobtitle}
                                </Typography>
                                {employee.attributes.skills.data.length > 0 ? (
                                    employee.attributes.skills.data.map((skill) => (
                                        <Box key={skill.id} sx={{ ml: 2, mt: 1 }}>
                                            <Chip
                                                label={`Skill: ${skill.attributes.role} - ${skill.attributes.description}`}
                                                color="primary"
                                            />
                                            {skill.attributes.courses.data.length > 0 ? (
                                                skill.attributes.courses.data.map((course) => (
                                                    <Typography key={course.id} variant="body2" sx={{ ml: 4, mt: 1 }}>
                                                        Course: {course.attributes.name} -{' '}
                                                        {course.attributes.completed ? 'Completed' : 'Not Completed'}
                                                    </Typography>
                                                ))
                                            ) : (
                                                <Typography variant="body2" sx={{ ml: 4, mt: 1 }}>
                                                    No courses listed for this skill.
                                                </Typography>
                                            )}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ ml: 2, mt: 1 }}>
                                        No skills listed.
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </React.Fragment>
                ) : (
                    <Typography variant="body2">No employees found for this company or select a company to view details.</Typography>
                )}
            </Box>
            {heatmapData.series.length > 0 && (
                <Chart
                    type="heatmap"
                    series={heatmapData.series}
                    options={{
                        chart: {
                            height: 350,
                            type: 'heatmap'
                        },
                        dataLabels: {
                            enabled: false // Hide the default data labels in cells
                        },
                        colors: ['#008FFB'], // A single color for simplicity
                        title: {
                            text: 'Employee Skill and Course Completion Heatmap'
                        },
                        xaxis: {
                            type: 'category',
                            categories: heatmapData.categories
                        },
                        plotOptions: {
                            heatmap: {
                                shadeIntensity: 0.5, // Adjust fill transparency for visibility
                                radius: 0, // Make the cell corners square
                                useFillColorAsStroke: true, // Use fill color for cell border
                                colorScale: {
                                    ranges: [
                                        {
                                            from: -1, // Adjust these 'from' and 'to' values as needed
                                            to: 0, // for your data ranges
                                            name: 'no skill',
                                            color: '#FFFFFF'
                                        },
                                        {
                                            from: 1,
                                            to: 1,
                                            name: 'no completion',
                                            color: '#FF4560'
                                        },
                                        {
                                            from: 2,
                                            to: 2,
                                            name: 'partial completion',
                                            color: '#FFC107'
                                        },
                                        {
                                            from: 3,
                                            to: 3,
                                            name: 'full completion',
                                            color: '#00E396'
                                        }
                                    ]
                                }
                            }
                        },
                        tooltip: {
                            enabled: true,
                            custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                                return `<div class="apexcharts-tooltip">
                          <div>Skill: ${data.x}</div>
                          <div>Completed: ${data.y}</div>
                        </div>`;
                            }
                        }
                    }}
                />
            )}
        </MainCard>
    );
};

export default SkillsByCo;
