import React, { Component } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

class HeatMapChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          id: "heatmap",
          height: "100%",
          type: "heatmap",
          events: {
            dataPointSelection: (event, chartContext, config) => {
              const employeeId = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].employeeId;
              const courseShortname = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
              //redirect to course page showing employees that have done that course
              const url = `/dashboard/EmCourse/${encodeURIComponent(employeeId)}/${encodeURIComponent(courseShortname)}`;
              window.location.href = url;
            },
          },
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
                  color: "#FF0000",
                  name: "Not Completed"
                },
                {
                  from: 1,
                  to: 1,
                  color: "#00A100",
                  name: "Completed"
                },
                {
                  from: 2,
                  to: 2,
                  color: "#FFFF00",
                  name: "Expires within 3 months"
                }
              ],
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 1,
        },
        title: {
          text: "State of Training for Employees",
        },
        tooltip: {
          y: {
            formatter: function (value, { seriesIndex, dataPointIndex, w }) {
              const courseShortname = w.config.series[seriesIndex].data[dataPointIndex].x;
              return `${courseShortname}`;
            },
          },
        },
      },
      series: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const companyId = 7; // Filter employees by company ID 7

    axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/?populate=*&filters[company][id][$eq]=${companyId}`)
      .then(response => {
        const employeeNames = response.data.data.map(employee => employee.attributes.fullname);
        const employeeIds = response.data.data.map(employee => employee.id);
        return Promise.all([
          Promise.resolve(employeeNames),
          Promise.resolve(employeeIds),
          this.loadCourseNames(),
          this.loadEmployeeCourseCompletion(employeeIds)
        ]);
      })
      .then(([employeeNames, employeeIds, courseNames, employeeCourseCompletion]) => {
        const series = this.generateHeatmapData(employeeNames, employeeIds, courseNames, employeeCourseCompletion);
        this.setState({ series });
      })
      .catch(err => {
        console.error("Error loading data:", err);
      });
  }

  loadCourseNames() {
    return axios.get("https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/?populate=*")
      .then(response => {
        const courseData = response.data.data.map(course => ({
          shortname: course.attributes.shortname,
          yearsExpire: course.attributes.YearsExpire,
        }));
        return courseData;
      });
  }

  loadEmployeeCourseCompletion(employeeIds) {
    const promises = employeeIds.map(employeeId => {
      return axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employeeId}&populate[course]=shortname,datecompleted`)
        .then(response => {
          const employeeCourses = new Map();
          response.data.data.forEach(item => {
            const courseShortname = item.attributes.course.data.attributes.shortname;
            const dateCompleted = item.attributes.DateCompleted;
            employeeCourses.set(courseShortname, dateCompleted);
          });
          return employeeCourses;
        });
    });

    return Promise.all(promises);
  }

  generateHeatmapData(employeeNames, employeeIds, courseNames, employeeCourseCompletion) {
    const currentDate = new Date();
    const threeMonthsFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate());

    return employeeNames.map((employeeName, index) => {
      const employeeId = employeeIds[index];
      const data = courseNames.map(courseData => {
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
          employeeName: employeeName,
        };
      });

      return {
        name: employeeName,
        data,
      };
    });
  }

  render() {
    return (
      <div className="mixed-chart" style={{ width: '100%' }}>
        <Chart
          options={this.state.options}
          series={this.state.series}
          type="heatmap"
          width="100%"
        />
      </div>
    );
  }
}

export default HeatMapChart;