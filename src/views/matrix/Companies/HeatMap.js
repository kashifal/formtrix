import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const HeatMap = () => {
    const [series, setSeries] = useState([
        {
            name: 'Monks',
            data: [{ x: 'Health & Safety', y: 30 }]
            // Add more data points here for different courses and companies
        }
        // Add more series for different companies
    ]);

    const options = {
        chart: {
            type: 'heatmap',
            events: {
                click: function (event, chartContext, { seriesIndex, dataPointIndex }) {
                    const company = series[seriesIndex].name;
                    const course = series[seriesIndex].data[dataPointIndex].x;
                    // Redirect logic here
                    // For example: window.location.href = `/company/${company}/course/${course}`;
                }
            }
        },
        xaxis: {
            type: 'category',
            // List all courses here
            categories: ['Health & Safety']
        },
        title: {
            text: 'Company Course Completion Heatmap'
        }
        // Additional styling and configuration here
    };

    return (
        <div id="chart">
            <ReactApexChart options={options} series={series} type="heatmap" />
        </div>
    );
};

export default HeatMap;
