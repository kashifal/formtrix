import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import Chart from 'react-apexcharts';

const SkillsCoursesHeatmap = () => {
  const [employees, setEmployees] = useState([]);
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        type: 'heatmap',
        events: {
          click: () => {
            window.location.href = '/full-report-monks';
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'category',
        categories: [],
      },
      yaxis: {
        type: 'category',
        categories: [],
      },
      plotOptions: {
        heatmap: {
          colorScale: {
            ranges: [{
              from: 0,
              to: 0,
              name: 'Not Started',
              color: '#ff4560'
            }, {
              from: 1,
              to: 1,
              name: 'In Progress',
              color: '#f9c802'
            }, {
              from: 2,
              to: 2,
              name: 'Fully Trained',
              color: '#00e396'
            }]
          }
        }
      },
    },
    series: [],
  });

  useEffect(() => {
    const fetchEmployeesAndCourses = async () => {
      const companyId = 7; // Filter employees by company ID 7
      const response = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][id][$eq]=${companyId}&populate=skills.courses`);
      const employeesData = response.data.data;

      const employeesWithCourseCompletion = await Promise.all(employeesData.map(async (employee) => {
        const employeeCoursesRes = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee.id}&populate=*`);
        const completedCourses = employeeCoursesRes.data.data.filter(ec => ec.attributes.DateCompleted !== null).map(ec => ec.attributes.course.data.id);

        return { 
          ...employee, 
          attributes: { 
            ...employee.attributes, 
            skills: { 
              data: employee.attributes.skills.data.map(skill => ({
                ...skill,
                attributes: {
                  ...skill.attributes,
                  courses: {
                    data: skill.attributes.courses.data.map(course => ({
                      ...course,
                      shortname: course.attributes.shortname,
                      completed: completedCourses.includes(course.id)
                    }))
                  }
                }
              }))
            }
          }
        };
      }));

      setEmployees(employeesWithCourseCompletion);
    };

    fetchEmployeesAndCourses();
  }, []);

  useEffect(() => {
    const skillsSet = new Set();
    const coursesSet = new Set();
    const employeesPerSkill = {};
    const completionCountPerCourse = {};
  
    employees.forEach(employee => {
      employee.attributes.skills.data.forEach(skill => {
        const skillName = skill.attributes.role;
        skillsSet.add(skillName);
  
        skill.attributes.courses.data.forEach(course => {
          const courseName = course.attributes.shortname;
          coursesSet.add(courseName);
          const key = `${skillName}|${courseName}`;
  
          if (!employeesPerSkill[skillName]) employeesPerSkill[skillName] = new Set();
          if (!completionCountPerCourse[key]) completionCountPerCourse[key] = { completed: 0, total: 0 };
  
          employeesPerSkill[skillName].add(employee.id);
          completionCountPerCourse[key].total = employeesPerSkill[skillName].size;
          if (course.completed) {
            completionCountPerCourse[key].completed += 1;
          }
        });
      });
    });
  
    const dataMap = {};
    for (const [key, { completed, total }] of Object.entries(completionCountPerCourse)) {
      dataMap[key] = completed === 0 ? 0 : (completed === total ? 2 : 1);
    }
  
    const skills = Array.from(skillsSet);
    const courses = Array.from(coursesSet);
    const series = skills.map(skill => ({
      name: skill,
      data: courses.map(course => {
        const key = `${skill}|${course}`;
        return dataMap[key] || 0;
      }),
    }));
  
    setChartData(prevState => ({
      ...prevState,
      options: {
        ...prevState.options,
        xaxis: { ...prevState.options.xaxis, categories: courses },
        yaxis: { ...prevState.options.yaxis, categories: skills },
      },
      series,
    }));
  }, [employees]);

  return (
    <Box>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="heatmap"
        height={350}
      />
    </Box>
  );
};

export default SkillsCoursesHeatmap;