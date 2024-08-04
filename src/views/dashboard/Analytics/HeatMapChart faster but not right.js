import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

const HeatMapChart = () => {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployeeCourseData = async () => {
            try {
                const [companyNames, skillNames] = await Promise.all([
                    axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/'),
                    axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills/')
                ]);

                const companies = companyNames.data.data.map((company) => company.attributes.website);
                const skills = skillNames.data.data.map((skill) => skill.attributes.role);

                const seriesData = await Promise.all(
                    companies.map(async (companyName) => {
                        const data = await Promise.all(
                            skills.map(async (skillName) => {
                                const employees = await axios.get(
                                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][website][$eq]=${companyName}&filters[skills][role][$eq]=${skillName}`
                                );
                                const completedEmployees = await Promise.all(
                                    employees.data.data.map(async (employee) => {
                                        const courses = await axios.get(
                                            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee.id}&populate[course]=name,shortname,datecompleted`
                                        );
                                        return courses.data.data.every((course) => course.attributes.DateCompleted !== null);
                                    })
                                );

                                const allEmployeesCompleted = completedEmployees.every((completed) => completed);

                                return {
                                    x: skillName,
                                    y: allEmployeesCompleted ? 0 : 70
                                };
                            })
                        );

                        return {
                            name: companyName,
                            data
                        };
                    })
                );

                setSeries(seriesData);
                setLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };

        fetchEmployeeCourseData();
    }, []);

    const handleLabelClick = (company) => {
        // Handle label click logic here
    };

    return (
        <div className="mixed-chart" style={{ width: '100%' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <p>Thanks for waiting, we are digging out your records...</p>
                    <img src="/images/constructionwork.gif" alt="Construction Work" />
                </div>
            ) : (
                <Chart
                    options={
                        {
                            // Your chart options here
                        }
                    }
                    series={series}
                    type="heatmap"
                    width="100%"
                />
            )}
        </div>
    );
};

export default HeatMapChart;
