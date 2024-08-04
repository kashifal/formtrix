import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Grid, Typography, List, ListItem, ListItemText } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

const InductionProgress = () => {
    const [employees, setEmployees] = useState([]);
    const [inductionPages, setInductionPages] = useState([]);

    useEffect(() => {
        // Fetch employee data
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?fields[0]=id&fields[1]=inductionProgress')
            .then((response) => response.json())
            .then((data) => setEmployees(data.data))
            .catch((error) => console.error('Error fetching employees:', error));

        // Fetch induction pages
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/')
            .then((response) => response.json())
            .then((data) => setInductionPages(data.data))
            .catch((error) => console.error('Error fetching induction pages:', error));
    }, []);

    // Count the number of employees who have completed each stage
    const getCompletionCount = (stage) => {
        return employees.filter((employee) => employee.attributes.inductionProgress >= stage).length;
    };

    // Prepare data for ApexChart
    const chartData = {
        series: [
            {
                name: 'Employees Completed',
                data: inductionPages.map((page) => getCompletionCount(page.attributes.Order))
            }
        ],
        options: {
            chart: {
                type: 'bar',
                height: 350
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: inductionPages.map((page) => page.attributes.Title),
                title: {
                    text: 'Employees Completed'
                },
                min: 0,
                max: 10
            },
            yaxis: {
                title: {
                    text: ''
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + ' employees';
                    }
                }
            }
        }
    };

    return (
        <MainCard title="Induction Progress">
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                        <List>
                            {inductionPages.map((page) => (
                                <ListItem key={page.id}>
                                    <ListItemText
                                        primary={page.attributes.Title}
                                        secondary={`Completed by ${getCompletionCount(page.attributes.Order)} employees`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Chart options={chartData.options} series={chartData.series} type="bar" height={350} />
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default InductionProgress;
