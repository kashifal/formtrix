import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Chip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useParams } from 'react-router-dom';

const SkillsByCoReport = () => {
    const [employees, setEmployees] = useState([]);
    const [skillDetails, setSkillDetails] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const { companyId, skillId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // Fetch skill details
                const skillResponse = await axios.get(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills/${skillId}?populate=courses`
                );
                if (skillResponse.data?.data) {
                    setSkillDetails(skillResponse.data.data.attributes);
                } else {
                    console.error('Skill data is missing in the response');
                }

                // Fetch employees with the specified skill
                const employeesResponse = await axios.get(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[skills][id][$eq]=${skillId}&populate[courses,skills]`
                );
                if (employeesResponse.data?.data) {
                    setEmployees(employeesResponse.data.data);
                } else {
                    console.error('Employees data is missing in the response');
                }

                // Fetch company details
                const companyResponse = await axios.get(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/${companyId}`);
                if (companyResponse.data?.data) {
                    setCompanyDetails(companyResponse.data.data.attributes);
                } else {
                    console.error('Company data is missing in the response');
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId, skillId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (!skillDetails || !companyDetails) {
        return <Typography variant="h6">Failed to load skill or company details.</Typography>;
    }

    return (
        <MainCard title={`Skill Report: ${skillDetails.role}`}>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Employees Course Completion for {skillDetails.role} at {companyDetails.name}.
            </Typography>

            <Box sx={{ mt: 3 }}>
                {employees.length > 0 ? (
                    employees.map((employee) => (
                        <Box key={employee.id} sx={{ mt: 2 }}>
                            <Typography variant="h6">
                                {employee.attributes.fullname} - {employee.attributes.jobtitle}
                            </Typography>
                            {employee.attributes.skills?.data.length > 0 ? (
                                employee.attributes.skills.data.map((skill) => (
                                    <Box key={skill.id} sx={{ ml: 2 }}>
                                        <Typography variant="body1">
                                            Skill: {skill.attributes.role} - {skill.attributes.description}
                                        </Typography>
                                        {skill.attributes.courses?.data.length > 0 ? (
                                            skill.attributes.courses.data.map((course) => (
                                                <Typography key={course.id} variant="body2" sx={{ ml: 4 }}>
                                                    Course: {course.attributes.name}
                                                    {employee.attributes.courses?.data.find((empCourse) => empCourse.id === course.id)
                                                        ?.attributes.completed ? (
                                                        <Chip label="Completed" color="success" size="small" />
                                                    ) : (
                                                        <Chip label="Not Completed" color="error" size="small" />
                                                    )}
                                                </Typography>
                                            ))
                                        ) : (
                                            <Typography variant="body2" sx={{ ml: 4 }}>
                                                No courses listed for this skill.
                                            </Typography>
                                        )}
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ ml: 2 }}>
                                    No skills listed.
                                </Typography>
                            )}
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1">No employee data found for the specified skill and company.</Typography>
                )}
            </Box>
        </MainCard>
    );
};

export default SkillsByCoReport;
