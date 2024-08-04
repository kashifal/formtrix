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
                        // Add your dataPointSelection event here
                        dataPointSelection: (event, chartContext, config) => {
                            // Use employee name and course name to generate the URL
                            const employeeName = config.w.config.series[config.seriesIndex].name;
                            const courseName = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
                            // Adjust the URL structure as needed for your application
                            const url = `/dashboard/EmSkill/<span class="math-inline">\{encodeURIComponent\(employeeName\)\}/</span>{encodeURIComponent(courseName)}`;
                            // Directly navigate using window.location.href
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
                                    to: 49,
                                    name: 'Not Completed',
                                    color: '#FF0000'
                                },
                                {
                                    from: 50,
                                    to: 100,
                                    name: 'Completed',
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
                    text: 'State of Training for Employees'
                }
            },
            series: [],
            employeeNameToId: {},
            courseNameToId: {}
        };
    }

    componentDidMount() {
        Promise.all([this.loadEmployeeNames(), this.loadCourseNames()])
            .then(([employeeNames, courseNames]) => {
                this.loadEmployeeCourseCompletion().then((employeeCourseCompletion) => {
                    const series = this.generateRandomData(employeeNames, courseNames, employeeCourseCompletion);
                    this.setState({ series });
                });
            })
            .catch((err) => {
                console.error('Error loading data:', err);
            });
    }

    loadEmployeeNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/?populate=*').then((response) => {
            const employees = response.data.data;
            const nameToId = {};
            employees.forEach((employee) => {
                nameToId[employee.attributes.fullname] = employee.id;
            });
            this.setState({ employeeNameToId: nameToId });
            return employees.map((employee) => employee.attributes.fullname);
        });
    }

    loadCourseNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/?populate=*').then((response) => {
            const courses = response.data.data;
            const nameToId = {};
            courses.forEach((course) => {
                nameToId[course.attributes.name] = course.id;
            });
            this.setState({ courseNameToId: nameToId });
            return courses.map((course) => course.attributes.name);
        });
    }

    loadEmployeeCourseCompletion() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses/?populate=*').then((response) => {
            const employeeCourses = new Map();
            response.data.data.forEach((item) => {
                const employeeId = item.attributes.employee.data.id;
                const courseId = item.attributes.course.data.id;

                // Check if the course has been completed (DateCompleted is not null or empty string)
                const completed = item.attributes.DateCompleted !== null && item.attributes.DateCompleted !== '';

                if (!employeeCourses.has(employeeId)) {
                    employeeCourses.set(employeeId, new Map());
                }
                employeeCourses.get(employeeId).set(courseId, completed);
            });
            return employeeCourses;
        });
    }

    generateRandomData(employeeNames, courseNames, employeeCourseCompletion) {
        const { employeeNameToId, courseNameToId } = this.state;

        return employeeNames.map((employeeName) => {
            const employeeId = employeeNameToId[employeeName];
            const data = courseNames.map((courseName) => {
                // Remove backslashes
                const courseId = courseNameToId[courseName];

                // Check if the employee has completed the course (DateCompleted is not null or empty string)
                const completed =
                    employeeCourseCompletion.has(employeeId) && employeeCourseCompletion.get(employeeId).get(courseId) === true;

                // Use 100 for completed (green) and 0 for not completed (red)
                return {
                    x: courseName,
                    y: completed ? 100 : 0
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
