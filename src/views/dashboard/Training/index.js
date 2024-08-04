import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Card, CardContent, Button, Typography } from '@mui/material';
import HeatMapChart from './HeatMapChart';
import RoleCourseChart from './RoleCourse';
import ToDoList from './ToDoList';
import InductionChart from './InductionChart';
import HeatMapChartCompany from './HeatMapChart_company';
import RoleCourseChartCompany from './RoleCourse_company';
import InductionChartCompany from './InductionChart_company';
import { gridSpacing } from 'store/constant';

const Training = () => {
    const { companyId } = useParams();
    console.log('companyId from useParams:', companyId);

    const [isLoading, setLoading] = useState(true);
    const [showHeatMapChart, setShowHeatMapChart] = useState(true);
    const [showTodoList, setShowTodoList] = useState(false);
    const [buttonText, setButtonText] = useState('Skills & Courses');
    const [companyData, setCompanyData] = useState(null);
    const [employeeData, setEmployeeData] = useState([]);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                console.log('companyId in fetchCompanyData:', companyId);
                const response = await fetch(
                    `https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?filters[id][$eq]=${companyId}&populate=*`
                );
                const data = await response.json();
                console.log('API response data:', data);

                if (data.data && data.data.length > 0) {
                    setCompanyData({
                        id: data.data[0].id,
                        name: data.data[0].attributes.name,
                        address1: data.data[0].attributes.address1,
                        address2: data.data[0].attributes.address2,
                        logo: data.data[0].attributes.logo,
                        telephone: data.data[0].attributes.Telephone
                    });
                }

                // Fetch employee details based on the company ID
                if (companyId) {
                    try {
                        const employeeResponse = await fetch(
                            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[company][id][$eq]=${companyId}&populate=*`
                        );
                        const employeeData = await employeeResponse.json();

                        if (Array.isArray(employeeData.data)) {
                            setEmployeeData(employeeData.data);
                        } else {
                            console.error('Employee data is not an array:', employeeData);
                            setEmployeeData([]);
                        }
                    } catch (error) {
                        console.error('Error fetching employee data:', error);
                        setEmployeeData([]);
                    }
                } else {
                    setEmployeeData([]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching company data:', error);
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [companyId]);

    const toggleCharts = (event) => {
        event.preventDefault();
        setShowHeatMapChart(!showHeatMapChart);
        setButtonText(buttonText === 'Skills & Courses' ? 'Employees & Courses' : 'Skills & Courses');
    };

    const toggleTodoList = (event) => {
        event.preventDefault();
        setShowTodoList(!showTodoList);
    };

    const getCompanyLogoUrl = () => {
        console.log('companyData:', companyData);

        if (companyData && companyData.logo && companyData.logo.data && companyData.logo.data.length > 0) {
            const logoData = companyData.logo.data[0].attributes;
            const logoFormats = logoData.formats;

            if (logoFormats) {
                if (logoFormats.small) {
                    console.log('Logo URL (small):', logoFormats.small.url);
                    return logoFormats.small.url;
                } else if (logoFormats.thumbnail) {
                    console.log('Logo URL (thumbnail):', logoFormats.thumbnail.url);
                    return logoFormats.thumbnail.url;
                }
            }

            console.log('Logo URL (default):', logoData.url);
            return logoData.url;
        }

        console.log('Fallback to Monks.jpg');
        return '/images/Monks.jpg';
    };

    const isMonksTraining = !companyId || companyId === '3'; // Assuming Monks Training has an ID of 1

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Row */}
            <Grid item lg={6} md={6} sm={12} xs={12}>
                <Card sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CardContent sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <img
                                src={getCompanyLogoUrl()}
                                alt="Company Logo"
                                style={{ width: '100%', height: 'auto', maxHeight: '100%' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/Monks.jpg';
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
                <Button variant="contained" onClick={toggleTodoList} sx={{ marginBottom: '16px' }}>
                    {showTodoList ? 'Show Induction Chart' : 'Show To do List'}
                </Button>
                {showTodoList ? (
                    <ToDoList isLoading={isLoading} />
                ) : isMonksTraining ? (
                    <InductionChart isLoading={isLoading} />
                ) : (
                    <InductionChartCompany isLoading={isLoading} />
                )}
            </Grid>

            {/* Company Name and Address */}
            {companyData && (
                <Grid item xs={12}>
                    <Typography variant="h2">{companyData.name}</Typography>
                    <Typography variant="subtitle1">
                        {companyData.address1}
                        {companyData.address2}
                    </Typography>
                    <Typography variant="subtitle1">Telephone: {companyData.telephone}</Typography>
                </Grid>
            )}

            {/* Toggle Button */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" onClick={toggleCharts}>
                    {buttonText}
                </Button>
            </Grid>

            {/* HeatMapChart Row  - now passes company details MT*/}
            <Grid item xs={12}>
                {showHeatMapChart ? (
                    isMonksTraining ? (
                        <HeatMapChart companyId={companyId} />
                    ) : (
                        <HeatMapChartCompany companyId={companyId} />
                    )
                ) : isMonksTraining ? (
                    <RoleCourseChart />
                ) : (
                    <RoleCourseChartCompany />
                )}
            </Grid>

            {/* Employee Details */}
            <Grid item xs={12}>
                {isLoading ? (
                    <p>Loading employee details...</p>
                ) : employeeData.length > 0 ? (
                    <ul>
                        {employeeData
                            .filter((employee) => employee.attributes && employee.attributes.name)
                            .map((employee) => (
                                <li key={employee.id}>{employee.attributes.name}</li>
                            ))}
                    </ul>
                ) : (
                    <p>No employee data available.</p>
                )}
            </Grid>
        </Grid>
    );
};

export default Training;
