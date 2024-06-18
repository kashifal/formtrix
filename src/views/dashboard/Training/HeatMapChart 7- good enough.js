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
              const employeeCompany = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].employeeCompany;
              const url = `/dashboard/Employee/${encodeURIComponent(employeeId)}/${encodeURIComponent(courseShortname)}/${encodeURIComponent(employeeCompany)}`;
              window.location.href = url;
            },
          },
        },
        plotOptions: {
          heatmap: {
            radius: 0,
            useFillColorAsStroke: false,
            colorScale: {
              ranges: [
                { from: 0, to: 0, name: 'Not Completed', color: '#8B0000' },
                { from: 1, to: 1, name: 'Completed', color: '#00A100' },
                { from: 2, to: 2, name: 'Expires within 3 months', color: '#FFFF00' }
              ]
            }
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
    const { companyId } = this.props;
  
    axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/?populate=*&filters[company][id][$eq]=${companyId}`)
      .then(response => {
        const employeeNames = response.data.data.map(employee => employee.attributes.fullname);
        const employeeIds = response.data.data.map(employee => employee.id);
        const employeeCompanies = response.data.data.map(employee => employee.attributes.company);
        return Promise.all([
          Promise.resolve(employeeNames),
          Promise.resolve(employeeIds),
          Promise.resolve(employeeCompanies),
          this.loadCourseNames(),
          this.loadEmployeeCourseCompletion(employeeIds)
        ]);
      })
      .then(([employeeNames, employeeIds, employeeCompanies, courseNames, employeeCourseCompletion]) => {
        const series = this.generateHeatmapData(employeeNames, employeeIds, courseNames, employeeCourseCompletion, employeeCompanies);
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

  generateHeatmapData(employeeNames, employeeIds, courseNames, employeeCourseCompletion, employeeCompanies) {
    const currentDate = new Date();
    const threeMonthsFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate());

    return employeeNames.map((employeeName, index) => {
      const employeeId = employeeIds[index];
      const employeeCompany = employeeCompanies[index];
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
          employeeCompany: employeeCompany,
        };
      });

      return {
        name: employeeName,
        data,
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
        <Chart
          options={this.state.options}
          series={series}
          type="heatmap"
          width="100%"
        />
      </div>
    );
  }
}

export default HeatMapChart;