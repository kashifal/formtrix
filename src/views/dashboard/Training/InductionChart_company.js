import React, { useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
// third-party
import ReactApexChart from 'react-apexcharts';
// project import
import useConfig from 'hooks/useConfig';

// chart options
const pieChartOptions = {
  chart: {
    type: 'pie',
    width: 450,
    height: 450
  },
  labels: ['Completed', 'Started', 'Not Started'],
  colors: ['#4caf50', '#ffeb3b', '#f44336'],
  legend: {
    show: true,
    fontFamily: `'Roboto', sans-serif`,
    offsetX: 10,
    offsetY: 10,
    labels: {
      useSeriesColors: false
    },
    markers: {
      width: 12,
      height: 12,
      radius: 5
    },
    itemMargin: {
      horizontal: 25,
      vertical: 4
    }
  },
  responsive: [
    {
      breakpoint: 450,
      chart: {
        width: 280,
        height: 280
      },
      options: {
        legend: {
          show: false,
          position: 'bottom'
        }
      }
    }
  ]
};

// ==============================|| PIE CHART ||============================== //

const InductionChart = () => {
  const theme = useTheme();
  const { navType } = useConfig();
  const { primary } = theme.palette.text;
  const darkLight = theme.palette.dark.light;
  const grey200 = theme.palette.grey[200];
  const backColor = theme.palette.background.paper;
  const [series] = useState([0, 0, 100]);
  const [options, setOptions] = useState(pieChartOptions);

  React.useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      xaxis: {
        labels: {
          style: {
            colors: [primary, primary, primary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
        }
      },
      grid: {
        borderColor: navType === 'dark' ? darkLight + 20 : grey200
      },
      legend: {
        labels: {
          colors: 'grey.500'
        }
      },
      stroke: {
        colors: [backColor]
      }
    }));
  }, [navType, primary, darkLight, grey200, backColor]);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="pie" />
    </div>
  );
};

export default InductionChart;