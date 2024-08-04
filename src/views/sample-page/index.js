import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';

const HeatmapComponent = () => {
    const [skills, setSkills] = useState([]);
    const [heatmapSeries, setHeatmapSeries] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const companiesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?populate=*');
            const skillsResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills?populate=*');
            const employeeCoursesResponse = await axios.get(
                'https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?populate=*'
            );

            const companiesData = companiesResponse.data.data;
            const skillsData = skillsResponse.data.data;
            const employeeCoursesData = employeeCoursesResponse.data.data;

            setSkills(skillsData);

            processHeatmapData(companiesData, skillsData, employeeCoursesData);
        };

        fetchData();
    }, []);

    const processHeatmapData = (companies, skills, employeeCourses) => {
        const data = {};

        // Initialize the data structure
        companies.forEach((company) => {
            data[company.attributes.name] = {};
            skills.forEach((skill) => {
                data[company.attributes.name][skill.attributes.name] = 0;
            });
        });

        // Count course completions
        employeeCourses.forEach((course) => {
            const { employee, DateCompleted } = course.attributes;
            if (DateCompleted) {
                const companyName = employee.data.attributes.company.data.attributes.name;
                const skillName = employee.data.attributes.skill.data.attributes.name;
                data[companyName][skillName] += 1;
            }
        });

        const series = companies.map((company) => {
            return {
                name: company.attributes.name,
                data: skills.map((skill) => data[company.attributes.name][skill.attributes.name])
            };
        });

        setHeatmapSeries(series);
    };

    const options = {
        chart: {
            type: 'heatmap'
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                colorScale: {
                    ranges: [
                        {
                            from: 0,
                            to: 0,
                            name: 'No Completions',
                            color: '#e0e0e0'
                        },
                        {
                            from: 1,
                            to: 5,
                            name: '1-5 Completions',
                            color: '#00A100'
                        },
                        {
                            from: 6,
                            to: 10,
                            name: '6-10 Completions',
                            color: '#128FD9'
                        },
                        {
                            from: 11,
                            to: 15,
                            name: '11-15 Completions',
                            color: '#FFB200'
                        },
                        {
                            from: 16,
                            to: 20,
                            name: '16-20 Completions',
                            color: '#FF0000'
                        }
                    ]
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: skills.map((skill) => skill.attributes.name)
        },
        title: {
            text: 'Company Course Completion Heatmap'
        }
    };

    return (
        <div>
            <Chart options={options} series={heatmapSeries} type="heatmap" height="450" />
        </div>
    );
};

export default HeatmapComponent;
