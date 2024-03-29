import React, { Component } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

class HeatMapChart extends Component {
constructor(props) {
super(props);


this.state = {
  options: {
    // ... (existing options configuration)
  },
  series: [],
};

this.handleLabelClick = this.handleLabelClick.bind(this);
}

componentDidMount() {
this.loadData();
}

async loadData() {
try {
const companiesResponse = await axios.get("https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/");
const companies = companiesResponse.data.data;


  const employeesResponse = await axios.get("https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?populate=skills.courses,company");
  const employees = employeesResponse.data.data;

  const completionData = await Promise.all(
    companies.map(async (company) => {
      const companyEmployees = employees.filter(
        (employee) => employee.attributes.company.data.id === company.id
      );

      const skillsData = companyEmployees.flatMap((employee) => {
        return employee.attributes.skills.data.map((skill) => {
          const completedCourses = skill.attributes.courses.data.filter(
            (course) => {
              const employeeCourse = employee.attributes.employee_courses.data.find(
                (ec) => ec.attributes.course.data.id === course.id
              );
              return employeeCourse && employeeCourse.attributes.completed;
            }
          );

          const completionRate = (completedCourses.length / skill.attributes.courses.data.length) * 100;

          let color = "#FF0000";
          if (completionRate >= 71) {
            color = "#00A100";
          } else if (completionRate >= 31) {
            color = "#FFB200";
          }

          return {
            x: skill.attributes.role,
            y: completionRate,
            color,
          };
        });
      });

      return {
        name: company.attributes.name,
        data: skillsData,
      };
    })
  );

  this.setState({ series: completionData });
} catch (err) {
  console.error("Error loading data:", err);
}
}

handleLabelClick(company) {
this.props.history.push(/${company.toLowerCase()});
}

render() {
return (
<div className="mixed-chart" style={{ width: "100%" }}> <Chart
    options={this.state.options}
    series={this.state.series}
    type="heatmap"
    width="100%"
  /> </div>
);
}
}

export default HeatMapChart;
