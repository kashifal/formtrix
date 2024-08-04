import React, { Component } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

class HeatMapChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                chart: {
                    id: 'heatmap',
                    height: '100%',
                    type: 'heatmap',
                    events: {
                        mounted: (chartContext, config) => {
                            const yaxisLabels = config.globals.dom.baseEl.querySelectorAll('.apexcharts-yaxis-labels text');
                            yaxisLabels.forEach((label) => {
                                label.style.cursor = 'pointer';
                                label.onclick = () => {
                                    this.handleLabelClick(label.textContent.trim());
                                };
                            });
                        },
                        dataPointSelection: (event, chartContext, config) => {
                            const companyName = config.w.config.series[config.seriesIndex].name;
                            const skillName = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
                            const url = `/dashboard/CoSkill/${companyName}/${skillName}/`;
                            window.location.href = url; // Or use your routing method
                        }
                    }
                },
                plotOptions: {
                    heatmap: {
                        shadeIntensity: 0.5,
                        radius: 0,
                        useFillColorAsStroke: true,
                        colorScale: {
                            ranges: [
                                {
                                    from: 0,
                                    to: 30,
                                    name: 'Training Expired',
                                    color: '#FF0000'
                                },
                                {
                                    from: 31,
                                    to: 70,
                                    name: 'Training Needed',
                                    color: '#FFB200'
                                },
                                {
                                    from: 71,
                                    to: 100,
                                    name: 'Fully Trained',
                                    color: '#00A100'
                                }
                            ]
                        }
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: 1
                },
                title: {
                    text: 'State of Training for each Fox Group Company'
                },
                tooltip: {
                    y: {
                        formatter: function (value, { seriesIndex, dataPointIndex, w }) {
                            const companyName = w.config.series[seriesIndex].name;
                            const skillName = w.config.series[seriesIndex].data[dataPointIndex].x;
                            return `${companyName} - ${skillName}`;
                        }
                    }
                }
            },
            series: []
        };

        this.handleLabelClick = this.handleLabelClick.bind(this);
    }

    async componentDidMount() {
        try {
            const [companyNames, skillNames] = await Promise.all([this.loadCompanyNames(), this.loadSkillNames()]);

            const series = await this.fetchEmployeeCourseData(companyNames, skillNames);
            this.setState({ series });
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    loadCompanyNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/').then((response) => {
            const companies = response.data.data;
            return companies.map((company) => company.attributes.website);
        });
    }

    loadSkillNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills/').then((response) => {
            const skills = response.data.data;
            return skills.map((skill) => skill.attributes.role);
        });
    }

    async fetchEmployeeCourseData(companyNames, skillNames) {
        const series = await Promise.all(
            companyNames.map(async (companyName) => {
                const data = await Promise.all(
                    skillNames.map(async (skillName) => {
                        const employees = await this.fetchEmployeesByCompanyAndSkill(companyName, skillName);

                        const completedEmployees = await Promise.all(
                            employees.map(async (employee) => {
                                const courses = await this.fetchEmployeeCourses(employee.id);
                                return courses.every((course) => course.attributes.DateCompleted !== null);
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

        return series;
    }

    async fetchEmployeesByCompanyAndSkill(companyName, skillName) {
        const response = await axios.get(
            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][website][$eq]=${companyName}&filters[skills][role][$eq]=${skillName}`
        );
        return response.data.data;
    }

    async fetchEmployeeCourses(employeeId) {
        const response = await axios.get(
            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employeeId}&populate[course]=name,shortname,datecompleted`
        );
        return response.data.data;
    }

    handleLabelClick(company) {
        this.props.history.push(`/${company.toLowerCase()}`);
    }

    render() {
        return (
            <div className="mixed-chart" style={{ width: '100%' }}>
                <Chart options={this.state.options} series={this.state.series} type="heatmap" width="100%" />
            </div>
        );
    }
}

export default HeatMapChart;
