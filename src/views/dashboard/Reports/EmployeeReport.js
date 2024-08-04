import React, { useEffect, useState } from 'react';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useNavigate } from 'react-router-dom';
import './EmployeeTable.css';
import qs from 'qs';
import PropTypes from 'prop-types'; // Importing PropTypes

LicenseInfo.setLicenseKey('327232b2db55ef771ee9917fc6f4ef22Tz03MzU1MSxFPTE3MjQ3MDc0NzEwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

const EmployeeReport = ({ selectedCompany, selectedCourse, selectedSkill }) => {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = qs.stringify(
                    {
                        populate: {
                            skills: {
                                fields: ['role']
                            },
                            courses: {
                                populate: ['course'],
                                fields: ['DateCompleted']
                            },
                            CompanyBranch: {
                                fields: ['name']
                            }
                        },
                        filters: {
                            CompanyBranch: {
                                id: selectedCompany ? { $eq: selectedCompany } : undefined
                            },
                            skills: {
                                id: selectedSkill ? { $eq: selectedSkill } : undefined
                            }
                        }
                    },
                    { encodeValuesOnly: true }
                );

                const response = await fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?${query}`);
                const responseData = await response.json();

                if (Array.isArray(responseData.data)) {
                    const transformedData = responseData.data.map((item) => {
                        const { id, attributes } = item;
                        const names = attributes.fullname.split(' ');
                        const firstName = names[0];
                        const lastName = names[names.length - 1];

                        const completedCourses = attributes.courses.data.filter((course) => course.attributes.DateCompleted !== null);

                        return {
                            id,
                            name: `${firstName} ${lastName}`,
                            jobtitle: attributes.jobtitle,
                            email: attributes.email,
                            hometel: attributes.hometel,
                            mobiletel: attributes.mobiletel,
                            startdate: new Date(attributes.startdate).toLocaleDateString('en-GB'),
                            companyBranch: attributes.CompanyBranch?.data?.attributes?.name || '',
                            completedCourses,
                            skills: attributes.skills.data
                        };
                    });

                    setTableData(transformedData);
                } else {
                    console.error('Expected responseData.data to be an array but received:', responseData.data);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedCompany, selectedCourse, selectedSkill]);

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'jobtitle', headerName: 'Job Title', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'hometel', headerName: 'Home Tel', width: 150 },
        { field: 'startdate', headerName: 'Start Date', width: 150 },
        selectedCompany && { field: 'companyBranch', headerName: 'Company Branch', width: 200 },
        selectedCourse && {
            field: 'dateCompleted',
            headerName: 'Date Completed',
            width: 150,
            valueGetter: (params) => {
                const completedCourse = params.row.completedCourses.find(
                    (course) => course.attributes.course.data.attributes.name === selectedCourse
                );
                return completedCourse ? new Date(completedCourse.attributes.DateCompleted).toLocaleDateString('en-GB') : null;
            },
            cellClassName: (params) => (params.value ? 'completed' : '')
        },
        selectedCourse && {
            field: 'expires',
            headerName: 'Expires',
            width: 150,
            valueGetter: (params) => {
                const completedCourse = params.row.completedCourses.find(
                    (course) => course.attributes.course.data.attributes.name === selectedCourse
                );
                if (completedCourse) {
                    const dateCompleted = new Date(completedCourse.attributes.DateCompleted);
                    const yearsExpire = completedCourse.attributes.course.data.attributes.YearsExpire;
                    const expiresDate = new Date(dateCompleted);
                    expiresDate.setFullYear(expiresDate.getFullYear() + yearsExpire);
                    return expiresDate.toLocaleDateString('en-GB');
                }
                return null;
            }
        }
    ].filter(Boolean);

    const filteredData = tableData.filter((row) => {
        let isValid = true;

        if (selectedCourse) {
            isValid = isValid && row.completedCourses.some((course) => course.attributes.course.data.attributes.name === selectedCourse);
        }

        if (selectedSkill) {
            isValid = isValid && row.skills.some((skill) => skill.id === parseInt(selectedSkill));
        }

        return isValid;
    });

    const getRowClassName = (params) => {
        const expiresDate = new Date(params.row.expires);
        const today = new Date();
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

        if (expiresDate < today) {
            return 'expired';
        } else if (expiresDate <= threeMonthsLater) {
            return 'expiring-soon';
        }
        return '';
    };

    const handleRowClick = (params) => {
        const employeeId = params.row.id;
        navigate(`/dashboard/employee/${employeeId}`, { replace: true });
    };

    return (
        <div>
            <DataGridPro
                rows={filteredData}
                columns={columns}
                pageSize={5}
                loading={loading}
                height={400}
                style={{ height: '100%', flexGrow: 1 }}
                getRowClassName={getRowClassName}
                onRowClick={handleRowClick}
            />
        </div>
    );
};

EmployeeReport.propTypes = {
    selectedCompany: PropTypes.string,
    selectedCourse: PropTypes.string,
    selectedSkill: PropTypes.string
};

export default EmployeeReport;
