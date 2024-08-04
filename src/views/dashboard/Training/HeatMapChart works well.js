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
                        dataPointSelection: (event, chartContext, config) => {
                            const employeeName = config.w.config.series[config.seriesIndex].name;
                            const courseName = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
                            const url = `/dashboard/EmSkill/${encodeURIComponent(employeeName)}/${encodeURIComponent(courseName)}`;
                            window.location.href = url;
                        }
                    }
                },
                plotOptions: {
                    heatmap: {
                        shadeIntensity: 0.2,
                        radius: 0,
                        useFillColorAsStroke: false,
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
                                    color: '#00A100',
                                    name: 'Completed'
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
                    text: 'State of Training for Employees'
                }
            },
            series: []
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        axios
            .get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/?populate=*')
            .then((response) => {
                const employeeNames = response.data.data.map((employee) => employee.attributes.fullname);
                return Promise.all([
                    Promise.resolve(employeeNames),
                    this.loadCourseNames(),
                    this.loadEmployeeCourseCompletion(response.data.data.map((employee) => employee.id))
                ]);
            })
            .then(([employeeNames, courseNames, employeeCourseCompletion]) => {
                const series = this.generateHeatmapData(employeeNames, courseNames, employeeCourseCompletion);
                this.setState({ series });
            })
            .catch((err) => {
                console.error('Error loading data:', err);
            });
    }

    loadCourseNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/?populate=*').then((response) => {
            return response.data.data.map((course) => course.attributes.name);
        });
    }

    loadEmployeeCourseCompletion(employeeIds) {
        const promises = employeeIds.map((employeeId) => {
            return axios
                .get(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employeeId}&populate[course]=name,shortname,datecompleted`
                )
                .then((response) => {
                    const employeeCourses = new Map();
                    response.data.data.forEach((item) => {
                        const courseName = item.attributes.course.data.attributes.name;
                        const completed = item.attributes.DateCompleted !== null;
                        employeeCourses.set(courseName, completed);
                    });
                    return employeeCourses;
                });
        });

        return Promise.all(promises);
    }

    generateHeatmapData(employeeNames, courseNames, employeeCourseCompletion) {
        return employeeNames.map((employeeName, index) => {
            const data = courseNames.map((courseName) => {
                const completed = employeeCourseCompletion[index].get(courseName) || false;
                const value = completed ? 1 : 0;

                return {
                    x: courseName,
                    y: value
                };
            });

            return {
                name: employeeName,
                data
            };
        });
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
