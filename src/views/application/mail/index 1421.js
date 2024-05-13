import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Alert, Select, MenuItem } from '@mui/material';

// version 1421

const Employeeupload = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [csvFile, setCSVFile] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = () => {
    fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies')
      .then(response => response.json())
      .then(data => {
        if (data && data.data) {
          setCompanies(data.data);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch(error => console.error('Error fetching companies:', error));
  };

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('No file selected.');
      return;
    }
    setCSVFile(file);
  };

  const handleCSVSubmit = () => {
    if (csvFile && selectedCompany) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const employees = csvData.split('\n').slice(1).map((row) => row.trim()).filter((row) => row !== '');
  
        const uniqueEmails = new Set();
        const uniqueEmployees = employees.filter((employee) => {
          const [, email] = employee.split(',').map((item) => item.trim());
          if (uniqueEmails.has(email)) {
            return false;
          }
          uniqueEmails.add(email);
          return true;
        });
  
        const createPromises = uniqueEmployees.map((employee) => {
          const [
            fullname,
            email,
            jobtitle,
            address,
            hometel,
            mobiletel,
            dob,
            ni,
            startdate,
            uniqueCode,
            CompanyBranch,
            VideoTile,
            archive,
            driving_license_number,
            driving_license_expiry,
          ] = employee.split(',').map((item) => item.trim());
  
          const data = {
            fullname,
            email,
            jobtitle,
            address,
            hometel,
            mobiletel,
            dob,
            ni,
            startdate,
            uniqueCode,
            CompanyBranch,
            VideoTile,
            archive: archive === 'Y' || archive === 'y' || archive === 'true',
            driving_license_number,
            driving_license_expiry,
            company: selectedCompany,
          };
  
          return fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((error) => {
                  throw new Error(`HTTP ${response.status} - ${JSON.stringify(error)}`);
                });
              }
              return response.json();
            });
        });
  
        Promise.all(createPromises)
          .then((data) => {
            console.log('Employees created successfully:', data);
            setUpdateSuccess(true);
            setTimeout(() => {
              setUpdateSuccess(false);
            }, 3000);
          })
          .catch((error) => {
            console.error('Error creating employees:', error);
            // Handle the error scenario
          });
      };
      reader.readAsText(csvFile);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Please upload a CSV file to add new employees</Typography>
      </Grid>
      <Grid item xs={12}>
        <Select value={selectedCompany} onChange={handleCompanyChange}>
          <MenuItem value="">Select a company</MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.attributes.name}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={12}>
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
        <Button variant="contained" onClick={handleCSVSubmit} disabled={!csvFile || !selectedCompany}>
          Create Employees
        </Button>
        {updateSuccess && (
          <Alert severity="success" style={{ marginTop: '1rem' }}>
            Employees have been successfully created!
          </Alert>
        )}
      </Grid>
    </Grid>
  );
};

export default Employeeupload;