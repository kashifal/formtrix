import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro';
import { Button } from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { LicenseInfo } from '@mui/x-data-grid-pro';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

const EmployeeCoursesTable = () => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(
                `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?populate[skill]=*&populate[employee_courses][populate][course]=*`
            );
            console.log('API Response:', response.data);
            const employeesData = response.data.data.map((employee) => ({
                id: employee.id,
                name: employee.attributes.fullname,
                skill: employee.attributes.skill.data?.attributes.role || 'N/A',
                courses: `${
                    employee.attributes.employee_courses.data.filter((course) => course.attributes.DateCompleted !== null).length
                }/${employee.attributes.employee_courses.data.length}`
            }));
            console.log('Processed Employees Data:', employeesData);
            setEmployees(employeesData);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'skill', headerName: 'Skill', width: 150 },
        { field: 'courses', headerName: 'Courses', width: 150 }
    ];

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [columns.map((column) => column.headerName)],
            body: employees.map((employee) => [employee.name, employee.skill, employee.courses])
        });
        doc.save('employee-courses.pdf');
    };

    // Static data for debugging
    const staticData = [
        { id: 1, name: 'John Doe', skill: 'Developer', courses: '2/3' },
        { id: 2, name: 'Jane Smith', skill: 'Designer', courses: '1/2' }
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
            <Button onClick={exportPDF} variant="contained" sx={{ mb: 2 }}>
                Export PDF
            </Button>
            <DataGridPro
                rows={employees.length > 0 ? employees : staticData}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                components={{
                    Toolbar: GridToolbar
                }}
            />
        </div>
    );
};

export default EmployeeCoursesTable;
