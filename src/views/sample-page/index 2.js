import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, MenuItem, FormControl, Select, Box } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

const SkillsByCo = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Fetch companies
    const fetchCompanies = async () => {
      const response = await axios.get('http://localhost:1337/api/companies?fields=name&populate=name');
      setCompanies(response.data.data);
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    // Fetch employees and their skills based on the selected company
    if (selectedCompany) {
      const fetchEmployees = async () => {
        const response = await axios.get(`http://localhost:1337/api/employees?filters[company][name][$eq]=${selectedCompany}&populate=skills`);
        setEmployees(response.data.data);
      };

      fetchEmployees();
    } else {
      setEmployees([]);
    }
  }, [selectedCompany]);

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  return (
    <MainCard title="Skills Report">
      <Typography variant="body2" sx={{ mb: 2 }}>
        Select a company to view its employees and their skills.
      </Typography>
      <FormControl fullWidth>
        <Select
          value={selectedCompany}
          onChange={handleCompanyChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value="">
            <em>Choose a company</em>
          </MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.attributes.name}>
              {company.attributes.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mt: 3 }}>
        {employees.length > 0 ? (
          employees.map((employee) => (
            <Box key={employee.id} sx={{ mt: 2 }}>
              <Typography variant="h6">{employee.attributes.fullname} - {employee.attributes.jobtitle}</Typography>
              {employee.attributes.skills.data.length > 0 ? (
                employee.attributes.skills.data.map((skill) => (
                  <Typography key={skill.id} variant="body1" sx={{ ml: 2 }}>
                    {skill.attributes.role}: {skill.attributes.description}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ ml: 2 }}>No skills listed.</Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body1">No employees found for this company or select a company to view details.</Typography>
        )}
      </Box>
    </MainCard>
  );
};

export default SkillsByCo;
