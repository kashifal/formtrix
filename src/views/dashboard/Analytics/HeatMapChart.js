import React, { Component } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import PropTypes from 'prop-types';

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
                        mounted: this.handleMounted.bind(this),
                        dataPointSelection: this.handleDataPointSelection.bind(this)
                    }
                },
                plotOptions: {
                    heatmap: {
                        radius: 0,
                        enableShades: true,
                        shadeIntensity: 0.8,
                        colorScale: {
                            ranges: [
                                { from: 0, to: 30, name: 'Training Expired', color: '#FF0000' },
                                { from: 31, to: 70, name: 'Training Needed', color: '#FFB200' },
                                { from: 71, to: 100, name: 'Fully Trained', color: '#00A100' }
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
                        formatter: function (value, opts) {
                            return opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].x;
                        }
                    }
                }
            },
            series: [],
            companyIds: {},
            skillIds: {}
        };

        this.handleLabelClick = this.handleLabelClick.bind(this);
    }

    async componentDidMount() {
        try {
            const [companies, skills] = await Promise.all([this.loadCompanies(), this.loadSkills()]);

            const companyIds = {};
            companies.forEach((company) => {
                companyIds[company.attributes.website] = company.id;
            });

            const skillIds = {};
            skills.forEach((skill) => {
                skillIds[skill.attributes.role] = skill.id;
            });

            const seriesPromises = companies.map(async (company) => {
                const skillDataPromises = skills.map(async (skill) => {
                    const employees = await this.fetchEmployeesByCompanyAndSkill(company.attributes.website, skill.attributes.role);
                    const completedEmployees = await Promise.all(
                        employees.map(async (employee) => {
                            const courses = await this.fetchEmployeeCourses(employee.id);
                            return courses.every((course) => course.attributes.DateCompleted !== null);
                        })
                    );

                    const allEmployeesCompleted = completedEmployees.every((completed) => completed);

                    return {
                        x: skill.attributes.role,
                        y: allEmployeesCompleted ? 0 : 70
                    };
                });

                return {
                    name: company.attributes.website,
                    data: await Promise.all(skillDataPromises)
                };
            });

            const series = await Promise.all(seriesPromises);
            this.setState({ series, companyIds, skillIds });
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    loadCompanies() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/').then((response) => response.data.data);
    }

    loadSkills() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills/').then((response) => response.data.data);
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

    handleMounted(chartContext, config) {
        const yaxisLabels = config.globals.dom.baseEl.querySelectorAll('.apexcharts-yaxis-labels text');
        yaxisLabels.forEach((label) => {
            label.style.cursor = 'pointer';
            label.onclick = () => {
                this.handleLabelClick(label.textContent.trim());
            };
        });
    }

    handleDataPointSelection(event, chartContext, config) {
        const companyName = config.w.config.series[config.seriesIndex].name;
        const skillName = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
        const companyId = this.state.companyIds[companyName];
        const skillId = this.state.skillIds[skillName];
        const url = `/foxskills/${companyId}/${skillId}`;
        window.location.href = url;
    }

    handleLabelClick(company) {
        const companyId = this.state.companyIds[company];
        this.props.history.push(`/foxskills/${companyId}`);
    }

    render() {
        const { series } = this.state;

        return (
            <div className="mixed-chart" style={{ width: '100%' }}>
                {series.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <p>Thanks for waiting, we are digging out your records...</p>
                        <img src="/images/constructionwork.gif" alt="Construction Work" />
                    </div>
                ) : (
                    <Chart options={this.state.options} series={series} type="heatmap" width="100%" />
                )}
            </div>
        );
    }
}

HeatMapChart.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired
};

export default HeatMapChart;
