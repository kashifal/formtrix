import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HeatMapChart = () => {
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({
    chart: {
      height: 350,
      type: 'heatmap',
      events: {}
    },
    dataLabels: {
      enabled: false
    },
    colors: ["#008FFB"],
    title: {
      text: 'Training Completion HeatMap'
    },
    xaxis: {
      categories: []
    }
  });

  const navigate = useNavigate();

  const handleChartClick = (event, chartContext, { seriesIndex, dataPointIndex }) => {
    const company = series[seriesIndex].name;
    const course = options.xaxis.categories[dataPointIndex];
    navigate(`/details/${encodeURIComponent(company)}/${encodeURIComponent(course)}`);
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const companiesRes = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/');
        const coursesRes = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/courses/');
    
        const xaxisCategories = coursesRes.data.map(course => course.attributes.name);
        const seriesData = companiesRes.data.map(company => ({
          name: company.attributes.name,
          data: xaxisCategories.map(() => Math.floor(Math.random() * 100))
        }));

        setOptions(prevOptions => ({
          ...prevOptions,
          xaxis: { ...prevOptions.xaxis, categories: xaxisCategories },
          chart: {
            ...prevOptions.chart,
            events: {
              click: handleChartClick
            }
          }
        }));
        setSeries(seriesData);
      } catch (error) {
        console.error("Error fetching chart data", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="heatmap" height={350} />
    </div>
  );
};

export default HeatMapChart;
