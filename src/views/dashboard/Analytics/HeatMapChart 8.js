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
                            // Existing mounted event code
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
                }
            },
            series: [],
            companyNames: [],
            courseNames: []
        };

        this.handleLabelClick = this.handleLabelClick.bind(this);
    }

    componentDidMount() {
        Promise.all([this.loadCompanyNames(), this.loadSkillNames()])
            .then(([companyNames, skillNames]) => {
                const series = this.generateRandomData(companyNames, skillNames);
                this.setState({ series });
            })
            .catch((err) => {
                console.error('Error loading data:', err);
            });
    }

    loadCompanyNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/').then((response) => {
            const companies = response.data.data;
            return companies.map((company) => company.attributes.website); // Using 'website' instead of 'name'
        });
    }

    loadSkillNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills/').then((response) => {
            // Map over the 'data' array and extract the 'role' from each 'attributes' object
            const skills = response.data.data;
            return skills.map((skill) => skill.attributes.role);
        });
    }

    generateRandomData(companyNames, skillNames) {
        return companyNames.map((companyName) => {
            const data = skillNames.map((skillName) => {
                let value;

                // If the company is MTS and the skill is one of the specified ones, set the value to 40
                if (companyName === 'MTS' && (skillName === 'MTS - Trainers' || skillName === 'MTS_Office_Staff')) {
                    value = 40;
                } else {
                    // For all other companies and skills, generate a random value between 0 and 30
                    value = Math.floor(Math.random() * 20);
                }
                return {
                    x: skillName,
                    y: value
                };
            });

            return {
                name: companyName,
                data
            };
        });
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
