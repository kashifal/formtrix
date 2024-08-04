import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';

const HeatMapChart = () => {
    const [companies, setCompanies] = useState([]);
    const [skills, setSkills] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all companies
                const companiesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies');
                const companiesData = companiesResponse.data.data;
                setCompanies(companiesData);

                // Fetch all employees with populated skills and courses
                const employeesResponse = await axios.get(
                    'https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?populate=skills.courses,company'
                );
                const employeesData = employeesResponse.data.data;

                // Process employee data for each company
                const heatmapSeries = companiesData.map((company) => {
                    const companyEmployees = employeesData.filter((employee) => employee.attributes.company.data.id === company.id);

                    const companyData = companyEmployees.flatMap((employee) => {
                        const completedCoursesIds = employee.attributes.skills.data.flatMap((skill) =>
                            skill.attributes.courses.data.map((course) => course.id)
                        );

                        return employee.attributes.skills.data.map((skill) => ({
                            x: skill.attributes.role,
                            y: company.attributes.name,
                            completed: completedCoursesIds.includes(skill.id)
                        }));
                    });

                    // Extract unique skills from the company data
                    const companySkills = [...new Set(companyData.map((item) => item.x))];
                    setSkills((prevSkills) => [...new Set([...prevSkills, ...companySkills])]);

                    return {
                        name: company.attributes.name,
                        data: companyData
                    };
                });

                setHeatmapData(heatmapSeries);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const chartOptions = {
        chart: {
            type: 'heatmap',
            height: '100%'
        },
        dataLabels: {
            enabled: false
        },
        colors: ['#FF0000', '#FFFF00'],
        xaxis: {
            categories: skills
        },
        yaxis: {
            labels: {
                style: {
                    colors: companies.map(() => '#FFFFFF'),
                    fontSize: '14px'
                }
            }
        },
        grid: {
            show: true,
            borderColor: '#FFFFFF',
            strokeDashArray: 4,
            position: 'back',
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        stroke: {
            width: 1,
            colors: ['#FFFFFF']
        },
        plotOptions: {
            heatmap: {
                colorScale: {
                    ranges: [
                        {
                            from: 0,
                            to: 0,
                            color: '#FF0000',
                            name: 'Not Completed'
                        },
                        {
                            from: 1,
                            to: 1,
                            color: '#FFFF00',
                            name: 'Completed'
                        }
                    ]
                }
            }
        },
        legend: {
            position: 'bottom',
            markers: {
                width: 20,
                height: 20,
                radius: 0
            },
            itemMargin: {
                horizontal: 20
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '800px' }}>
            {' '}
            <Chart options={chartOptions} series={heatmapData} type="heatmap" height="100%" />{' '}
        </div>
    );
};

export default HeatMapChart;
