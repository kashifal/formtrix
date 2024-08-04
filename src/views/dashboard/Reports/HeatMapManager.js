import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const HeatMapChart = ({ data }) => {
    const [series, setSeries] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        transformData(data);
    }, [data]);

    const transformData = (data) => {
        // Assuming data is an array of objects { role, company, completion }
        const roles = [...new Set(data.map((item) => item.role))];
        const companies = [...new Set(data.map((item) => item.company))];

        const seriesData = companies.map((company) => ({
            name: company,
            data: roles.map((role) => {
                const item = data.find((d) => d.role === role && d.company === company);
                return item ? item.completion : 0;
            })
        }));

        setSeries(seriesData);
        setCategories(roles);
    };

    const handleChartClick = (event, chartContext, { seriesIndex, dataPointIndex }) => {
        const company = series[seriesIndex].name;
        const role = categories[dataPointIndex];
        // Example action: console log (you can replace this with navigation logic)
        console.log(`Clicked on company: ${company}, role: ${role}`);
        // Example navigation: window.location.href = `/details/${company}/${role}`;
    };

    const options = {
        chart: {
            height: 350,
            type: 'heatmap',
            events: {
                click: handleChartClick
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: ['#008FFB'],
        title: {
            text: 'Training Completion HeatMap'
        },
        xaxis: {
            categories: categories
        }
    };

    return (
        <div id="chart">
            <ReactApexChart options={options} series={series} type="heatmap" height={350} />
        </div>
    );
};

export default HeatMapChart;
