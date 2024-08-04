import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Chip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useParams } from 'react-router-dom';

const SkillsByCoReport = () => {
    const [employees, setEmployees] = useState([]);
    const [skillDetails, setSkillDetails] = useState({});
    const [courseDetails, setCourseDetails] = useState({});

    const { skillId, courseId } = useParams();

    useEffect(() => {
        const fetchSkillAndCourseDetails = async () => {
            try {
                // Corrected skillId interpolation
                const skillResponse = await axios.get(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills/${skillId}?populate[courses]=*`
                );
                setSkillDetails(skillResponse.data);

                // Assuming the data structure correctly, finding course details within the skill
                const courseResponse = skillResponse.data.attributes.courses.data.find((course) => course.id === parseInt(courseId));
                setCourseDetails(courseResponse);
            } catch (error) {
                console.error('Failed to fetch skill or course details', error);
            }
        };

        const fetchEmployees = async () => {
            try {
                // Corrected skillId interpolation
                const employeesResponse = await axios.get(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[skills][id][$eq]=${skillId}&populate=courses`
                );
                const employeesData = employeesResponse.data.data;

                // Filter employees who have completed the specific course
                const filteredEmployees = employeesData.filter((employee) =>
                    employee.courses.some((course) => course.id === parseInt(courseId))
                );

                setEmployees(filteredEmployees);
            } catch (error) {
                console.error('Failed to fetch employees', error);
            }
        };

        fetchSkillAndCourseDetails();
        fetchEmployees();
    }, [skillId, courseId]);

    return (
        <MainCard title={`Skill Report: ${skillDetails.role || 'Loading...'} (Course ID: ${courseId})`}>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Employees Course Completion {skillDetails.role || '...'} and course {courseDetails.attributes?.name || '...'}.
            </Typography>

            <Box sx={{ mt: 3 }}>
                {employees.length > 0 ? (
                    employees.map((employee) => (
                        <Box key={employee.id} sx={{ mt: 2 }}>
                            <Typography variant="h6">
                                {employee.attributes.fullname} - {employee.attributes.jobtitle}
                            </Typography>
                            {employee.attributes.skills.data.length > 0 ? (
                                employee.attributes.skills.data.map((skill) => (
                                    <Box key={skill.id} sx={{ ml: 2 }}>
                                        <Typography variant="body1">
                                            Skill: {skill.attributes.role} - {skill.attributes.description}
                                        </Typography>
                                        {skill.attributes.courses.data.length > 0 ? (
                                            skill.attributes.courses.data.map((course) => (
                                                <Typography key={course.id} variant="body2" sx={{ ml: 4 }}>
                                                    Course: {course.attributes.name}
                                                    {course.completed ? (
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
                    <Typography variant="body1">No employee data found for the specified skill and course.</Typography>
                )}
            </Box>
        </MainCard>
    );
};

export default SkillsByCoReport;
