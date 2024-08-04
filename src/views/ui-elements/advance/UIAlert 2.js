// EmployeeTable.js
import React, { useEffect, useState } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarColumnsButton
} from '@mui/x-data-grid-pro';
import axios from 'axios';
import { LicenseInfo } from '@mui/x-data-grid-pro';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');
// EmployeeTable.js

// Custom Toolbar Component
const CustomGridToolbar = () => {
    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
};

const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch employees
                const employeesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees');
                const employeesData = employeesResponse.data.data;

                // Fetch companies
                const companiesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies');
                const companiesData = companiesResponse.data.data.reduce((acc, company) => {
                    acc[company.id] = company.attributes;
                    return acc;
                }, {});

                // Fetch courses
                const coursesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses');
                const coursesData = coursesResponse.data.data.reduce((acc, course) => {
                    acc[course.id] = course.attributes;
                    return acc;
                }, {});

                // Fetch employee-courses
                const employeeCoursesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses');
                const employeeCoursesData = employeeCoursesResponse.data.data.map((empCourse) => ({
                    ...empCourse.attributes,
                    employeeId: empCourse.id,
                    courseId: empCourse.id
                }));

                // Create courses columns
                const courseColumns = Object.keys(coursesData).map((courseId) => ({
                    field: `course_${courseId}`,
                    headerName: coursesData[courseId].name,
                    width: 180
                }));

                // Combine data into a formatted structure
                const formattedEmployees = employeesData.map((employee) => {
                    const company = companiesData[employee.attributes.CompanyBranch];
                    const employeeCourses = employeeCoursesData.filter((ec) => ec.employeeId === employee.id);

                    const coursesCompletion = Object.keys(coursesData).reduce((acc, courseId) => {
                        const course = employeeCourses.find((ec) => ec.courseId.toString() === courseId);
                        acc[`course_${courseId}`] = course ? course.DateCompleted || 'Completed' : 'Not Completed';
                        return acc;
                    }, {});

                    return {
                        ...employee.attributes,
                        id: employee.id,
                        companyName: company ? company.name : 'N/A',
                        ...coursesCompletion
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
                    { field: 'companyName', headerName: 'Company', width: 200 }
                ];

                setColumns([...baseColumns, ...courseColumns]);
                setEmployees(formattedEmployees);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
                rows={employees}
                columns={columns}
                loading={loading}
                pagination
                pageSizeOptions={[10, 25, 50]}
                components={{
                    Toolbar: CustomGridToolbar
                }}
            />
        </div>
    );
};

export default EmployeeTable;
