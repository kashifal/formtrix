import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
                            const { employeeId, x: courseShortname } =
                                config.w.config.series[config.seriesIndex].data[config.dataPointIndex];
                            const url = `/dashboard/Employee/${encodeURIComponent(employeeId)}/${encodeURIComponent(courseShortname)}/`;
                            window.location.href = url;
                        }
                    }
                },
                plotOptions: {
                    heatmap: {
                        radius: 0,
                        useFillColorAsStroke: false,
                        shadeIntensity: 0.7,
                        colorScale: {
                            ranges: [
                                { from: 0, to: 0, name: 'Not Completed', color: '#FF0000' },
                                { from: 1, to: 1, name: 'Completed', color: '#00A100' },
                                { from: 2, to: 2, name: 'Expires within 3 months', color: '#FFFF00' }
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
                },
                tooltip: {
                    y: {
                        formatter: function (value, { seriesIndex, dataPointIndex, w }) {
                            return w.config.series[seriesIndex].data[dataPointIndex].x;
                        }
                    }
                }
            },
            series: []
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const { companyId } = this.props;

        axios
            .get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/?populate=*&filters[company][id][$eq]=${companyId}`)
            .then((response) => {
                const employees = response.data.data;
                const employeeNames = employees.map((employee) => employee.attributes.fullname);
                const employeeIds = employees.map((employee) => employee.id);

                return Promise.all([this.loadCourseNames(), this.loadEmployeeCourseCompletion(employeeIds)]).then(
                    ([courseNames, employeeCourseCompletion]) => {
                        const series = this.generateHeatmapData(employeeNames, employeeIds, courseNames, employeeCourseCompletion);
                        this.setState({ series });
                    }
                );
            })
            .catch((err) => {
                console.error('Error loading data:', err);
            });
    }

    loadCourseNames() {
        return axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/?populate=*').then((response) =>
            response.data.data.map((course) => ({
                shortname: course.attributes.shortname,
                yearsExpire: course.attributes.YearsExpire
            }))
        );
    }

    loadEmployeeCourseCompletion(employeeIds) {
        const promises = employeeIds.map((employeeId) =>
            axios
                .get(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employeeId}&populate=course`
                )
                .then((response) => {
                    const employeeCourses = new Map();
                    response.data.data.forEach((item) => {
                        const courseShortname = item.attributes.course.data.attributes.shortname;
                        const dateCompleted = item.attributes.DateCompleted;
                        employeeCourses.set(courseShortname, dateCompleted);
                    });
                    return employeeCourses;
                })
        );

        return Promise.all(promises);
    }

    generateHeatmapData(employeeNames, employeeIds, courseNames, employeeCourseCompletion) {
        const currentDate = new Date();
        const threeMonthsFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate());

        return employeeNames.map((employeeName, index) => {
            const employeeId = employeeIds[index];
            const data = courseNames.map((courseData) => {
                const courseShortname = courseData.shortname;
                const yearsExpire = courseData.yearsExpire;
                const dateCompleted = employeeCourseCompletion[index].get(courseShortname);

                let value;
                if (dateCompleted) {
                    const expirationDate = new Date(dateCompleted);
                    expirationDate.setFullYear(expirationDate.getFullYear() + yearsExpire);

                    if (expirationDate <= threeMonthsFromNow) {
                        value = 2; // Expires within 3 months
                    } else {
                        value = 1; // Completed
                    }
                } else {
                    value = 0; // Not Completed
                }

                return {
                    x: courseShortname,
                    y: value,
                    employeeId: employeeId,
                    employeeName: employeeName
                };
            });

            return {
                name: employeeName,
                data
            };
        });
    }

    render() {
        const { series } = this.state;

        if (series.length === 0) {
            return <div>There is no training information for this company yet.</div>;
        }

        return (
            <div className="mixed-chart" style={{ width: '100%' }}>
                <Chart options={this.state.options} series={series} type="heatmap" width="100%" />
            </div>
        );
    }
}

HeatMapChart.propTypes = {
    companyId: PropTypes.number.isRequired
};

export default HeatMapChart;
