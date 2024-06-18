// EmployeeTable.js
import React, { useEffect, useState } from 'react';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useNavigate } from 'react-router-dom';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

const EmployeeTable = ({ company, skill }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?populate[company][filters][website][$eq]=${company}&populate[jobtitle][filters][name][$contains]=${skill}&fields=fullname,jobtitle,email,hometel,mobiletel,startdate,company.name`;

        const response = await fetch(apiUrl);
        const responseData = await response.json();

        if (Array.isArray(responseData.data)) {
          const transformedData = responseData.data.map((item) => {
            const { id, attributes } = item;
            const names = attributes.fullname.split(' ');
            const firstName = names[0];
            const lastName = names[names.length - 1];

            return {
              id,
              name: `${firstName} ${lastName}`,
              jobtitle: attributes.jobtitle.data ? attributes.jobtitle.data.attributes.name : '',
              email: attributes.email,
              hometel: attributes.hometel,
              mobiletel: attributes.mobiletel,
              startdate: attributes.startdate,
              companyBranch: attributes.company.data ? attributes.company.data.attributes.name : '',
            };
          });

          setTableData(transformedData);
        } else {
          console.error("Expected responseData.data to be an array but received:", responseData.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [company, skill]);

  const handleRowClick = (params) => {
    navigate(`/dashboard/employee/${params.id}`);
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'jobtitle', headerName: 'Job Title', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'hometel', headerName: 'Home Tel', width: 150 },
    { field: 'startdate', headerName: 'Start Date', width: 150 },
    { field: 'companyBranch', headerName: 'Company Branch', width: 200 },
  ];

  return (
    <div>
      <DataGridPro
        rows={tableData}
        columns={columns}
        pageSize={5}
        loading={loading}
        autoHeight
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default EmployeeTable;