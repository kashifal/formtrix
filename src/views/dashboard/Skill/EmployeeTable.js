import React, { useEffect, useState } from 'react';
import { LicenseInfo, DataGridPro } from '@mui/x-data-grid-pro';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

const EmployeeTable = ({ company }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeesForCompany = async () => {
      setLoading(true);
      try {
        // Fetch all employees and include related company data
        const response = await fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/?populate=*');
        const data = await response.json();
  
        // Filter employees based on the company's website identifier matching the 'company' prop
        const filteredEmployees = data.data.filter(employee => 
          employee.company.data.attributes.website === company);
  
        const transformedEmployees = filteredEmployees.map(({ id, attributes }) => ({
          id,
          name: attributes.fullname,
          jobtitle: attributes.jobtitle,
          email: attributes.email,
          hometel: attributes.hometel,
          mobiletel: attributes.mobiletel,
          startdate: attributes.startdate,
          // Additional transformation as needed
        }));
  
        setTableData(transformedEmployees);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEmployeesForCompany();
  }, [company]); // Dependency on 'company' prop to re-run this effect
  
  // Define the columns for your DataGridPro component
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'jobtitle', headerName: 'Job Title', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'hometel', headerName: 'Home Tel', width: 150 },
    { field: 'mobiletel', headerName: 'Mobile Tel', width: 150 },
    { field: 'startdate', headerName: 'Start Date', width: 150 },
    { field: 'companyBranch', headerName: 'Company Branch', width: 200 },
    // Add more columns as needed
  ];

  return (
    <DataGridPro 
      rows={tableData}
      columns={columns}
      pageSize={5}
      checkboxSelection
      loading={loading}
      autoHeight
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default EmployeeTable;
