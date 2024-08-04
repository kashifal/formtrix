import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Select, MenuItem } from '@mui/material';
import EmployeeProgress from './EmployeeProgress';
import { gridSpacing } from 'store/constant';

const DashboardReports = () => {
    const [isLoading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    useEffect(() => {
        fetchCompanies();
        fetchCourses();
        setLoading(false);
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/');
            const data = await response.json();
            setCompanies(data.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/');
            const data = await response.json();
            setCourses(data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleCompanyChange = (event) => {
        setSelectedCompany(event.target.value);
    };

    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Row */}
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <Card>
                    <CardContent>
                        <Select value={selectedCompany} onChange={handleCompanyChange}>
                            <MenuItem value="">Select a company</MenuItem>
                            {companies.map((company) => (
                                <MenuItem key={company.id} value={company.id}>
                                    {company.attributes.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <Card>
                    <CardContent>
                        <Select value={selectedCourse} onChange={handleCourseChange}>
                            <MenuItem value="">Select a course</MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.attributes.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </CardContent>
                </Card>
            </Grid>
            {/* Bottom Row */}
            <Grid item xs={12}>
                <EmployeeProgress isLoading={isLoading} selectedCompany={selectedCompany} selectedCourse={selectedCourse} />
            </Grid>
        </Grid>
    );
};

export default DashboardReports;
