import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { FormControl, Select, MenuItem } from '@mui/material';

const SkillsCoursesHeatmap = () => {
  const [companies, setCompanies] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [heatmapData, setHeatmapData] = useState({
    series: [],
    options: {
      chart: {
        type: 'heatmap',
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          colorScale: {
            ranges: [
              {
                from: 0,
                to: 0.1,
                name: 'Not Completed',
                color: '#FF4560'
              },
              {
                from: 0.1,
                to: 0.9,
                name: 'Partially Completed',
                color: '#FEB019'
              },
              {
                from: 0.9,
                to: 1,
                name: 'Fully Completed',
                color: '#00E396'
              }
            ]
          }
        }
      },
      xaxis: {
        type: 'category',
        categories: []
      },
      yaxis: {
        type: 'category',
        categories: [] // Y-axis will be populated with skill names
      },
      title: {
        text: 'Skill-Course Completion Heatmap'
      },
    }
  });

  // Fetch all skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/skills?populate=role');
        const fetchedSkills = response.data.data.map(skill => skill.attributes.role);
        setSkills(fetchedSkills);
        setHeatmapData(prevState => ({
          ...prevState,
          options: {
            ...prevState.options,
            yaxis: { ...prevState.options.yaxis, categories: fetchedSkills },
          }
        }));
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await axios.get('http://localhost:1337/api/companies?fields=name');
      setCompanies(response.data.data);
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchEmployeesAndCourses();
    }
  }, [selectedCompany, skills]);

  const fetchEmployeesAndCourses = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/employees?filters[company][name][$eq]=${selectedCompany}&populate=skills.courses`);
      const employeesData = response.data.data;
  
      // Initialize a structure to hold course completion data
      let skillsCoursesMap = {};
  
      // Iterate over each employee to aggregate course data
      for (let employee of employeesData) {
        for (let skill of employee.attributes.skills.data) {
          if (!skillsCoursesMap[skill.id]) {
            skillsCoursesMap[skill.id] = {
              skillName: skill.attributes.name,
              courses: {}
            };
          }
          for (let course of skill.attributes.courses.data) {
            if (!skillsCoursesMap[skill.id].courses[course.id]) {
              skillsCoursesMap[skill.id].courses[course.id] = {
                courseName: course.attributes.name,
                completedCount: 0,
                totalCount: 0
              };
            }
            const completionStatus = course.attributes.completed; // Assuming 'completed' is a boolean attribute
            skillsCoursesMap[skill.id].courses[course.id].totalCount++;
            if (completionStatus) {
              skillsCoursesMap[skill.id].courses[course.id].completedCount++;
            }
          }
        }
      }
  
      // Convert aggregated data to ApexCharts series format
      let series = [];
      let categories = []; // For X-axis (Courses)
      Object.keys(skillsCoursesMap).forEach(skillId => {
        const skill = skillsCoursesMap[skillId];
        const data = Object.keys(skill.courses).map(courseId => {
          const course = skill.courses[courseId];
          if (categories.indexOf(course.courseName) === -1) {
            categories.push(course.courseName);
          }
          return {
            x: course.courseName,
            y: course.completedCount / course.totalCount
          };
        });
        series.push({
          name: skill.skillName,
          data: data
        });
      });
  
      return { series, categories };
    } catch (error) {
      console.error("Error fetching employees and courses:", error);
    }
  };

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth margin="normal">
        <Select
          value={selectedCompany}
          onChange={handleCompanyChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.attributes.name}>
              {company.attributes.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ReactApexChart options={heatmapData.options} series={heatmapData.series} type="heatmap" height={350} />
    </div>
  );
};

export default SkillsCoursesHeatmap;