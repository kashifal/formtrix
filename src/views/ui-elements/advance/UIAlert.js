import React, { useEffect, useState } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid-pro';
import axios from 'axios';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import { Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

// Custom Toolbar Component
const CustomGridToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarDensitySelector />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [error, setError] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?populate=*');
        const employeesData = employeesResponse.data.data;
        const companiesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies');
        const companiesData = companiesResponse.data.data.map(company => ({
          id: company.id,
          name: company.attributes.name,
        }));
        const coursesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses');
        const coursesData = coursesResponse.data.data.reduce((acc, course) => {
          acc[course.id] = course.attributes;
          return acc;
        }, {});
        const employeeCoursesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses');
        const employeeCoursesData = employeeCoursesResponse.data.data.map(empCourse => ({
          ...empCourse.attributes,
          employeeId: empCourse.id,
          courseId: empCourse.id,
        }));
        const courseColumns = Object.keys(coursesData).map(courseId => ({
          field: `course_${courseId}`,
          headerName: coursesData[courseId].name,
          width: 180,
        }));
        const formattedEmployees = employeesData.map(employee => {
          const company = employee.attributes.company.data ? companiesData.find(c => c.id === employee.attributes.company.data.id) : null;
          const employeeCourses = employeeCoursesData.filter(ec => ec.employeeId === employee.id);
          const coursesCompletion = Object.keys(coursesData).reduce((acc, courseId) => {
            const course = employeeCourses.find(ec => ec.courseId === courseId);
            acc[`course_${courseId}`] = course ? course.DateCompleted || 'Completed' : 'Not Completed';
            return acc;
          }, {});
          return {
            ...employee.attributes,
            id: employee.id,
            companyId: company ? company.id : null,
            companyName: company ? company.name : 'N/A',
            ...coursesCompletion,
          };
        });

        const baseColumns = [
          { field: 'id', headerName: 'ID', width: 80 },
          { field: 'fullname', headerName: 'Full Name', width: 200 },
          { field: 'jobtitle', headerName: 'Job Title', width: 200 },
          { field: 'address', headerName: 'Address', width: 250 },
          { field: 'email', headerName: 'Email', width: 250 },
          { field: 'hometel', headerName: 'Home Tel', width: 150 },
          { field: 'mobiletel', headerName: 'Mobile Tel', width: 150 },
          { field: 'dob', headerName: 'DOB', width: 120 },
          { field: 'ni', headerName: 'NI', width: 120 },
          { field: 'startdate', headerName: 'Start Date', width: 120 },
          { field: 'companyName', headerName: 'Company', width: 200 },
        ];

        setColumns([...baseColumns, ...courseColumns]);
        setEmployees(formattedEmployees);
        setCompanies(companiesData);
        setLoading(false);
        setFilteredEmployees(formattedEmployees); // Initialize with all employees
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const newFilteredEmployees = employees.filter(employee => {
      const companyMatch = selectedCompany ? employee.companyId === parseInt(selectedCompany) : true;
      return companyMatch;
    });
    setFilteredEmployees(newFilteredEmployees);
  }, [selectedCompany, employees]);

  const handleCompanyChange = event => {
    setSelectedCompany(event.target.value);
  };

  return (
    <div style={{ height: 600, width: '100%' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Grid container spacing={2} style={{ marginBottom: '16px' }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="company-label">Company</InputLabel>
                <Select
                  labelId="company-label"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  label="Company"
                >
                  <MenuItem value="">All Companies</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <DataGridPro
            rows={filteredEmployees}
            columns={columns}
            pagination
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            components={{
              Toolbar: CustomGridToolbar,
            }}
          />
        </>
      )}
    </div>
  );
};

export default EmployeeTable;