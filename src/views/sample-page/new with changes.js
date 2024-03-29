import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, MenuItem, FormControl, Select, Box, Chip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Chart from 'react-apexcharts';

const SkillsByCo = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [employees, setEmployees] = useState([]);
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        type: 'heatmap',
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
              name: 'Not Completed',
              color: '#ff4560'
            }, {
              from: 1,
              to: 1,
              name: 'Completed',
              color: '#00e396'
            }]
          }
        }
      },
      title: {
        text: 'Skills and Courses Completion',
      },
    },
    series: [],
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?fields=name&populate=name');
      setCompanies(response.data.data);
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const fetchEmployeesAndCourses = async () => {
        const response = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][name][$eq]=${selectedCompany}&populate=skills.courses`);
        const employeesData = response.data.data;

        const employeesWithCourseCompletion = await Promise.all(employeesData.map(async (employee) => {
          const employeeCoursesRes = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee.id}&populate=*`);
          const completedCourses = employeeCoursesRes.data.data.filter(ec => ec.attributes.DateCompleted !== null).map(ec => ec.attributes.course.data.id);

          const skillsWithCompletion = employee.attributes.skills.data.map(skill => {
            const coursesWithCompletion = skill.attributes.courses.data.map(course => ({
              ...course,
              completed: completedCourses.includes(course.id),
            }));
            return { ...skill, attributes: { ...skill.attributes, courses: { data: coursesWithCompletion } } };
          });

          return { ...employee, attributes: { ...employee.attributes, skills: { data: skillsWithCompletion } } };
        }));

        setEmployees(employeesWithCourseCompletion);
      };

      fetchEmployeesAndCourses();
    } else {
      setEmployees([]);
    }
  }, [selectedCompany]);

  useEffect(() => {
    // Process data for heatmap
    const skillsSet = new Set();
    const coursesSet = new Set();
    const dataMap = {};

    employees.forEach(employee => {
      employee.attributes.skills.data.forEach(skill => {
        skillsSet.add(skill.attributes.role);
        skill.attributes.courses.data.forEach(course => {
          coursesSet.add(course.attributes.name);
          const key = `${skill.attributes.role}|${course.attributes.name}`;
          dataMap[key] = course.completed ? 1 : 0;
        });
      });
    });

    const skills = Array.from(skillsSet);
    const courses = Array.from(coursesSet);
    const series = skills.map(skill => {
      return {
        name: skill,
        data: courses.map(course => dataMap[`${skill}|${course}`] || 0),
      };
    });

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

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  return (
    <MainCard title="Skills and Courses Report">
      <Typography variant="body2" sx={{ mb: 2 }}>
        Select a company to view its employees, their skills, and related courses including completion status.
      </Typography>
      <FormControl fullWidth>
        <Select
          value={selectedCompany}
          onChange={handleCompanyChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value="">
            <em>Choose a company</em>
          </MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.attributes.name}>
              {company.attributes.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mt: 3 }}>
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="heatmap"
          height={350}
          width="100%"
        />
      </Box>
    </MainCard>
  );
};

export default SkillsByCo;
