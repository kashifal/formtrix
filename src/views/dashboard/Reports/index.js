import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Select, MenuItem, InputLabel, FormControl, Button, Typography } from '@mui/material';
import EmployeeReport from './EmployeeReport';
import { gridSpacing } from 'store/constant';
import qs from 'qs';

const DashboardReports = () => {
  const [isLoading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchCourses();
    fetchSkills();
    setLoading(false);
  }, []);

  const fetchCompanies = async () => {
    try {
      const query = qs.stringify({
        fields: ['name'],
      });
      const response = await fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?${query}`);
      const data = await response.json();
      setCompanies(data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const query = qs.stringify({
        fields: ['name'],
      });
      const response = await fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses?${query}`);
      const data = await response.json();
      setCourses(data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const query = qs.stringify({
        fields: ['role'],
      });
      const response = await fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/skills?${query}`);
      const data = await response.json();
      setSkills(data.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleSkillChange = (event) => {
    setSelectedSkill(event.target.value);
  };

  const handleSubmit = () => {
    setShowReport(true);
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Report Page
        </Typography>
      </Grid>
      {/* Top Row */}
      <Grid item lg={4} md={4} sm={12} xs={12}>
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel id="company-label">Company</InputLabel>
              <Select
                labelId="company-label"
                value={selectedCompany}
                onChange={handleCompanyChange}
                label="Company"
              >
                <MenuItem value="">Select a company</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.attributes.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
      <Grid item lg={4} md={4} sm={12} xs={12}>
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel id="course-label">Course</InputLabel>
              <Select
                labelId="course-label"
                value={selectedCourse}
                onChange={handleCourseChange}
                label="Course"
              >
                <MenuItem value="">Select a course</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.attributes.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
      <Grid item lg={4} md={4} sm={12} xs={12}>
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel id="skill-label">Skill</InputLabel>
              <Select
                labelId="skill-label"
                value={selectedSkill}
                onChange={handleSkillChange}
                label="Skill"
              >
                <MenuItem value="">Select a skill</MenuItem>
                {skills.map((skill) => (
                  <MenuItem key={skill.id} value={skill.id}>
                    {skill.attributes.role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
      {/* Submit Button */}
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Create Report
        </Button>
      </Grid>
      {/* Bottom Row */}
      <Grid item xs={12}>
        {showReport && (
          <EmployeeReport
            isLoading={isLoading}
            selectedCompany={selectedCompany}
            selectedCourse={selectedCourse}
            selectedSkill={selectedSkill}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default DashboardReports;