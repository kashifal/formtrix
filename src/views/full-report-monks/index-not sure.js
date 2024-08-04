import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, MenuItem, FormControl, Select, Box } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

const SkillsByCo = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [employees, setEmployees] = useState([]);
    const [skills, setSkills] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            const response = await axios.get('http://localhost:1337/api/companies?fields=name');
            setCompanies(response.data.data);
        };

        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            const fetchSkills = async () => {
                const response = await axios.get(
                    `http://localhost:1337/api/skills?filters[employees][company][name][$eq]=${selectedCompany}&fields=role,description`
                );
                setSkills(response.data.data);
            };
            fetchSkills();
        } else {
            setSkills([]); // Clear skills when the company is not selected
        }
    }, [selectedCompany]);

    useEffect(() => {
        if (selectedCompany) {
            const fetchEmployees = async () => {
                const response = await axios.get(
                    `http://localhost:1337/api/employees?filters[company][name][$eq]=${selectedCompany}&fields=fullname`
                );
                setEmployees(response.data.data);
            };

            fetchEmployees();
        } else {
            setEmployees([]); // Clear employees if no company is selected
        }
    }, [selectedCompany]);

    const handleCompanyChange = (event) => {
        setSelectedCompany(event.target.value);
    };

    return (
        <MainCard title="Skills Report">
            <Typography variant="body2" sx={{ mb: 2 }}>
                Report on the skills in a company, the courses required, and how many of those courses have been completed.
            </Typography>
            <FormControl fullWidth>
                <Select value={selectedCompany} onChange={handleCompanyChange} displayEmpty inputProps={{ 'aria-label': 'Without label' }}>
                    <MenuItem value="" disabled>
                        Choose a company
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
                    <ul>
                        {employees.map((employee) => (
                            <li key={employee.id}>{employee.attributes.fullname}</li>
                        ))}
                    </ul>
                ) : (
                    <Typography variant="body1">No employees found for this company.</Typography>
                )}
                {skills.length > 0 ? (
                    <>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                            Skills:
                        </Typography>
                        <ul>
                            {skills.map((skill) => (
                                <li key={skill.id}>
                                    {skill.attributes.role}: {skill.attributes.description}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : null}
            </Box>
        </MainCard>
    );
};

export default SkillsByCo;
