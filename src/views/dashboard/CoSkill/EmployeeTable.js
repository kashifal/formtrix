import React, { useEffect, useState } from 'react';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import { DataGridPro } from '@mui/x-data-grid-pro';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

const EmployeeTable = ({ company, skill }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl;
        if (company === 'MTS' && skill.includes('MTS')) {
          apiUrl = 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees';
        } else {
          apiUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[CompanyBranch][$eq]=${company}&filters[jobtitle][$contains]=${skill}`;
        }

        const response = await fetch(apiUrl);
        const responseData = await response.json();

        if (Array.isArray(responseData.data)) {
          const transformedData = await Promise.all(responseData.data.map(async (item) => {
            const { id, attributes } = item;
            const names = attributes.fullname.split(' ');
            const firstName = names[0];
            const lastName = names[names.length - 1];

            const courseResponse = await fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${id}&populate[course]=name,shortname,datecompleted`);
            const courseData = await courseResponse.json();

            const completedCourses = courseData.data.filter((course) => course.attributes.DateCompleted !== null);

            return {
              id,
              name: `${firstName} ${lastName}`,
              jobtitle: attributes.jobtitle,
              email: attributes.email,
              hometel: attributes.hometel,
              mobiletel: attributes.mobiletel,
              startdate: attributes.startdate,
              companyBranch: attributes.CompanyBranch,
              completedCourses,
            };
          }));

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
    height={400}
    style={{ height: '100%', flexGrow: 1 }}
/>

    </div>
  );
};

export default EmployeeTable;