import React, { useEffect, useState } from 'react';
import { DataGridPro, GridToolbarContainer } from '@mui/x-data-grid-pro';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import axios from 'axios';
import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Button,
    TextField,
    Typography,
    Box,
    Paper
} from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

const CustomGridToolbar = ({ handleExportPDF, handleExportExcel }) => (
    <GridToolbarContainer>
        <Button onClick={handleExportPDF}>Export to PDF</Button>
        <Button onClick={handleExportExcel}>Export to Excel</Button>
    </GridToolbarContainer>
);

CustomGridToolbar.propTypes = {
    handleExportPDF: PropTypes.func.isRequired,
    handleExportExcel: PropTypes.func.isRequired
};

const sendEmail = async (email, subject, message) => {
    try {
        const response = await fetch('http://localhost:1337/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: email,
                subject,
                html: `<p>${message}</p>`,
                text: message
            })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error.message || 'Failed to send email');
        }
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: error.message };
    }
};

const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [error, setError] = useState(null);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const employeesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?populate=*');
                const employeesData = employeesResponse.data.data;
                const companiesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies');
                const companiesData = companiesResponse.data.data.map((company) => ({
                    id: company.id,
                    name: company.attributes.name
                }));
                const coursesResponse = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses');
                const coursesData = coursesResponse.data.data.reduce((acc, course) => {
                    acc[course.id] = course.attributes;
                    return acc;
                }, {});

                const employeeCoursesData = await Promise.all(
                    employeesData.map(async (employee) => {
                        const empCoursesResponse = await axios.get(
                            `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employee-courses?filters[employee][id][$eq]=${employee.id}&populate=*`
                        );
                        return {
                            employeeId: employee.id,
                            courses: empCoursesResponse.data.data.map((empCourse) => ({
                                ...empCourse.attributes,
                                courseId: empCourse.id
                            }))
                        };
                    })
                );

                const courseColumns = Object.keys(coursesData).map((courseId) => ({
                    field: `course_${courseId}`,
                    headerName: coursesData[courseId].name,
                    width: 180
                }));

                const formattedEmployees = employeesData.map((employee) => {
                    const company = employee.attributes.company.data
                        ? companiesData.find((c) => c.id === employee.attributes.company.data.id)
                        : null;
                    const employeeCourses = employeeCoursesData.find((ec) => ec.employeeId === employee.id)?.courses || [];
                    const coursesCompletion = Object.keys(coursesData).reduce((acc, courseId) => {
                        const course = employeeCourses.find((ec) => ec.courseId === parseInt(courseId));
                        acc[`course_${courseId}`] = course ? 'Completed' : 'Not Completed';
                        return acc;
                    }, {});
                    return {
                        ...employee.attributes,
                        id: employee.id,
                        companyId: company ? company.id : null,
                        companyName: company ? company.name : 'N/A',
                        ...coursesCompletion
                    };
                });

                const baseColumns = [
                    { field: 'id', headerName: 'ID', width: 80 },
                    { field: 'fullname', headerName: 'Full Name', width: 200 },
                    { field: 'jobtitle', headerName: 'Job Title', width: 200 },
                    { field: 'address', headerName: 'Address', width: 250 },
                    { field: 'email', headerName: 'Email', width: 250 },
                    { field: 'companyName', headerName: 'Company', width: 200 }
                ];

                setColumns([...baseColumns, ...courseColumns]);
                setEmployees(formattedEmployees);
                setCompanies(companiesData);
                setLoading(false);
                setFilteredEmployees(formattedEmployees); // Initialize with all employees
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const newFilteredEmployees = employees.filter((employee) => {
            const companyMatch = selectedCompany ? employee.companyId === parseInt(selectedCompany) : true;
            return companyMatch;
        });
        setFilteredEmployees(newFilteredEmployees);
    }, [selectedCompany, employees]);

    const handleCompanyChange = (event) => {
        setSelectedCompany(event.target.value);
    };

    const handleExportPDF = async () => {
        const gridElement = document.querySelector('.MuiDataGrid-root');
        const gridClone = gridElement.cloneNode(true);

        gridClone.style.height = 'auto';
        gridClone.style.width = 'auto';
        gridClone.style.position = 'absolute';
        gridClone.style.left = '-9999px';

        document.body.appendChild(gridClone);

        const canvas = await html2canvas(gridClone, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 290;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const doc = new jsPDF('landscape');
        doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        doc.save('table.pdf');

        document.body.removeChild(gridClone);
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredEmployees);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
        XLSX.writeFile(workbook, 'employees.xlsx');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const result = await sendEmail(email, subject, message);
        setResponse(result);
    };

    return (
        <div style={{ height: 600, width: '100%' }} id="dataGridProContainer">
            <Typography variant="h5" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
                Changes being made to this page to enable email functionality.
            </Typography>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </div>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <>
                    <Grid container spacing={2} style={{ marginBottom: '16px' }}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel id="company-label">Company</InputLabel>
                                <Select labelId="company-label" value={selectedCompany} onChange={handleCompanyChange} label="Company">
                                    <MenuItem value="">All Companies</MenuItem>
                                    {companies.map((company) => (
                                        <MenuItem key={company.id} value={company.id.toString()}>
                                            {company.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <DataGridPro
                        rows={filteredEmployees}
                        columns={columns}
                        pagination
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        components={{
                            Toolbar: CustomGridToolbar
                        }}
                        componentsProps={{
                            toolbar: {
                                handleExportPDF,
                                handleExportExcel
                            }
                        }}
                    />
                </>
            )}
            <Paper style={{ padding: '16px', marginTop: '16px' }}>
                <Typography variant="h6">Send Report via Email</Typography>
                <form onSubmit={handleSubmit}>
                    <Box mb={2}>
                        <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Message"
                            type="text"
                            multiline
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </Box>
                    <Button type="submit" variant="contained" color="primary">
                        Send
                    </Button>
                </form>
                {response && (
                    <Alert severity="info" style={{ marginTop: '16px' }}>
                        {JSON.stringify(response)}
                    </Alert>
                )}
            </Paper>
        </div>
    );
};

export default EmployeeTable;
