// Helper function to generate random completion percentages
function generateRandomCompletion() {
    return Math.floor(Math.random() * 100) + 1;
}

const heatmapData = {
    series: [
        {
            name: 'Fox',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'Monks',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'Hurt',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'CMP',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'Celplas',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: "JJ O'Grady",
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'BlackLedge',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'CRH',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'Woods',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'Midland',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'JA Jackson',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'B&W',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'MTS',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        },
        {
            name: 'Tipworx',
            data: [generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion(), generateRandomCompletion()]
        }
    ],
    options: {
        chart: {
            height: 350,
            type: 'heatmap',
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 0,
                useFillColorAsStroke: true,
                colorScale: {
                    ranges: [{
                        from: 0,
                        to: 50,
                        color: '#ff4560'
                    },
                    {
                        from: 51,
                        to: 75,
                        color: '#f8ac59'
                    },
                    {
                        from: 76,
                        to: 100, // Added comma here
                        color: '#00e396'
                    }]
                }
                