import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGridPro } from '@mui/x-data-grid-pro';
import axios from 'axios';

const API_URL = 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/companies?populate[logo]=*&fields=name';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setCompanies(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: 'name', headerName: 'Company Name', flex: 1 },
    {
      field: 'logo',
      headerName: 'Logo',
      renderCell: (params) => (
        <img src={params.row.logo.data[0].formats.large.url} alt={params.row.name} style={{ width: '100px' }} />
      ),
    },
  ];

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGridPro
        rows={companies.map((company) => ({ id: company.id, ...company.attributes }))}
        loading={loading}
        columns={columns}
        rowHeight={100}
        checkboxSelection={false}
        disableSelectionOnClick
      />
    </Box>
  );
}
