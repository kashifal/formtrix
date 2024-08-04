import React, { Component } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

class SkillsCoursesHeatmap extends Component {
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
                                    name: 'Low Proficiency',
                                    color: '#FF4560'
                                },
                                {
                                    from: 31,
                                    to: 70,
                                    name: 'Medium Proficiency',
                                    color: '#FEB019'
                                },
                                {
                                    from: 71,
                                    to: 100,
                                    name: 'High Proficiency',
                                    color: '#00E396'
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
                    text: 'Skill Proficiency by Course'
                },
                xaxis: {
                    // X-axis configuration will be set dynamically after fetching course names
                }
            },
            series: []
        };

        this.handleLabelClick = this.handleLabelClick.bind(this);
    }

    componentDidMount() {
        Promise.all([this.loadCourseNames(), this.loadSkillNames()])
            .then(([courseNames, skillNames]) => {
                this.setState((prevState) => ({
                    options: {
                        ...prevState.options,
                        xaxis: {
                            categories: courseNames
                        }
                    },
                    series: skillNames.map((skill) => ({
                        name: skill,
                        data: courseNames.map(() => ({
                            x: courseNames,
                            y: Math.floor(Math.random() * 100) // Random proficiency value
                        }))
                    }))
                }));
            })
            .catch((err) => {
                console.error('Error loading data:', err);
            });
    }

    loadCourseNames() {
        return axios
            .get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/')
            .then((response) => response.data.data.map((course) => course.attributes.name));
    }

    loadSkillNames() {
        return axios
            .get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills/')
            .then((response) => response.data.data.map((skill) => skill.attributes.role));
    }

    handleLabelClick(skill) {
        // Assuming there's a route setup to handle this. Modify as needed.
        console.log(`Navigating to skill: ${skill.toLowerCase()}`);
        // this.props.history.push(`/skills/${skill.toLowerCase()}`); Uncomment or modify based on routing setup
    }

    render() {
        return (
            <div className="mixed-chart" style={{ width: '100%' }}>
                <Chart options={this.state.options} series={this.state.series} type="heatmap" width="100%" />
            </div>
        );
    }
}

export default SkillsCoursesHeatmap;
