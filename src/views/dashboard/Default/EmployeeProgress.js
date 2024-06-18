import React, { useEffect, useState } from 'react';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { MenuItem, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './EmployeeTable.css';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

const EmployeeTable = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/');
        const responseData = await response.json();

        if (Array.isArray(responseData.data)) {
          const transformedData = await Promise.all(responseData.data.map(async (item) => {
            const { id, attributes } = item;
            const names = attributes.fullname.split(' ');
            const firstName = names[0];
            const lastName = names[names.length - 1];

            const courseResponse = await fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${id}&populate[course]=name,shortname,datecompleted,YearsExpire`);
            const courseData = await courseResponse.json();

            const completedCourses = courseData.data.filter((course) => course.attributes.DateCompleted !== null);

            return {
              id,
              name: `${firstName} ${lastName}`,
              jobtitle: attributes.jobtitle,
              email: attributes.email,
              hometel: attributes.hometel,
              mobiletel: attributes.mobiletel,
              startdate: new Date(attributes.startdate).toLocaleDateString('en-GB'),
              companyBranch: attributes.CompanyBranch,
              completedCourses: completedCourses.map(course => ({
                ...course,
                shortname: course.attributes.course.data.attributes.shortname
              })),
            };
          }));

          setTableData(transformedData);
        } else {
          console.error("Expected responseData.data to be an array but received:", responseData.data);
        }

        const coursesResponse = await fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/');
        const coursesData = await coursesResponse.json();
        const courseNames = coursesData.data.map((course) => course.attributes.name);
        setCourses(courseNames);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'jobtitle', headerName: 'Job Title', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'hometel', headerName: 'Home Tel', width: 150 },
    { field: 'startdate', headerName: 'Start Date', width: 150 },
    { field: 'companyBranch', headerName: 'Company Branch', width: 200 },
    {
      field: 'dateCompleted',
      headerName: 'Date Completed',
      width: 150,
      valueGetter: (params) => {
        const completedCourse = params.row.completedCourses.find((course) => course.attributes.course.data.attributes.name === selectedCourse);
        return completedCourse ? new Date(completedCourse.attributes.DateCompleted).toLocaleDateString('en-GB') : null;
      },
      cellClassName: (params) => (params.value ? 'completed' : ''),
    },
    {
      field: 'expires',
      headerName: 'Expires',
      width: 150,
      valueGetter: (params) => {
        const completedCourse = params.row.completedCourses.find((course) => course.attributes.course.data.attributes.name === selectedCourse);
        if (completedCourse) {
          const dateCompleted = new Date(completedCourse.attributes.DateCompleted);
          const yearsExpire = completedCourse.attributes.course.data.attributes.YearsExpire;
          const expiresDate = new Date(dateCompleted);
          expiresDate.setFullYear(expiresDate.getFullYear() + yearsExpire);
          return expiresDate.toLocaleDateString('en-GB');
        }
        return null;
      },
    },
  ];

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const filteredData = selectedCourse
    ? tableData.filter((row) => row.completedCourses.some((course) => course.attributes.course.data.attributes.name === selectedCourse))
    : tableData;

  const getRowClassName = (params) => {
    const expiresDate = new Date(params.row.expires);
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    if (expiresDate < today) {
      return 'expired';
    } else if (expiresDate <= threeMonthsLater) {
      return 'expiring-soon';
    }
    return '';
  };

  const handleRowClick = (params) => {
    const employeeId = params.row.id;
    const completedCourse = params.row.completedCourses.find((course) => course.attributes.course.data.attributes.name === selectedCourse);
    const courseShortname = completedCourse ? completedCourse.shortname : null;
    
    if (courseShortname) {
      navigate(`/dashboard/employee/${employeeId}/${courseShortname.trim()}`, { replace: true });
    } else {
      navigate(`/dashboard/employee/${employeeId}`, { replace: true });
    }
  };

  return (
    <div>
      <div>
        <span>Please choose course before clicking on a name:</span>
        <Select value={selectedCourse} onChange={handleCourseChange}>
          <MenuItem value="">All Courses</MenuItem>
          {courses.map((course) => (
            <MenuItem key={course} value={course}>
              {course}
            </MenuItem>
          ))}
        </Select>
      </div>
      <DataGridPro
        rows={filteredData}
        columns={columns}
        pageSize={5}
        loading={loading}
        height={400}
        style={{ height: '100%', flexGrow: 1 }}
        getRowClassName={getRowClassName}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default EmployeeTable;