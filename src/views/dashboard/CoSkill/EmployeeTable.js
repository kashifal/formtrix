import React, { useEffect, useState } from 'react';
import { LicenseInfo, DataGridPro } from '@mui/x-data-grid-pro';
import { TextField, MenuItem, Rating } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import { styled } from '@mui/material/styles';

LicenseInfo.setLicenseKey('your_license_key_here');

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#ff6d75',
  },   
  '& .MuiRating-iconHover': {
    color: '#ff3d47',
  },
});

const EmployeeTable = ({ company }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(company || 'All');
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees/');
        const responseData = await response.json();
    
        if (Array.isArray(responseData.data)) {
          const transformedData = responseData.data.map((item, index) => {
            const employee = item.attributes;
            employee.id = index;
            employee.induction = Math.floor(Math.random() * 5) + 1;
            employee.toolbox = Math.floor(Math.random() * 5) + 1;
            return employee;
          });
    
          setTableData(transformedData);
          const uniqueCompanies = Array.from(new Set(transformedData.map(emp => emp.company)));
          setCompanies(['All', ...uniqueCompanies]);
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
  }, [company]); // 'company' as a dependency to the useEffect

  const filteredData = selectedCompany !== 'All'
    ? tableData.filter(row => row.company === selectedCompany)
    : tableData;

    
  const columns = [
    { field: 'forename', headerName: 'Forename', width: 150 },
    { field: 'surname', headerName: 'Surname', width: 150 },
    { field: 'company', headerName: 'Company', width: 150 },
    { field: 'branch', headerName: 'Branch', width: 150 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'hometel', headerName: 'Home Tel', width: 150 },
    { field: 'mobiletel', headerName: 'Mobile Tel', width: 150 },
    { field: 'startdate', headerName: 'Start Date', width: 150 },
    {
      field: 'induction',
      headerName: 'Induction',
      width: 150,
      renderCell: (params) => <Rating value={params.value} readOnly />,
    },
    {
      field: 'toolbox',
      headerName: 'Toolbox',
      width: 150,
      renderCell: (params) => (
        <StyledRating
          name={`toolbox-${params.id}`}
          value={params.value}
          readOnly
          precision={0.5}
          icon={<BuildIcon fontSize="inherit" />}
          emptyIcon={<BuildIcon fontSize="inherit" />}
        />
      ),
    },
  ];

  return (
    <>
      <TextField
        id="select-company"
        select
        value={selectedCompany}
        onChange={(e) => setSelectedCompany(e.target.value)}
        label="Select Company"
      >
        {companies.map((company) => (
          <MenuItem key={company} value={company}>
            {company}
          </MenuItem>
        ))}
      </TextField>

      <DataGridPro 
        rows={filteredData}
        columns={columns} 
        pageSize={5} 
        checkboxSelection 
        loading={loading}
        style={{ height: 400 }}
      />
    </>
  );
};

export default EmployeeTable;
