import { useEffect, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

function ChartByPlatform () {
    const [chartData, setChartData] = useState(null);
    
    const fetchChartData = () => {
        const full = window.location.protocol + '//' + window.location.host;
        fetch(`${full}/api/webaccess/by/platform`)
        .then(response => response.json())
        .then(data => {
            const chartData = Object.keys(data).map(k => {
                return {
                    name: k,
                    value: data[k]
                }
            });
            setChartData(chartData);
        });
    }

    useEffect(() => {
        if (chartData === null) {
            fetchChartData();
        }
    });

    return (
    <ResponsiveContainer width="100%" height="100%" className="card-dark">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData} title="Platforms">
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fill: 'aliceblue' }} azimuth={45}/>
          <PolarRadiusAxis />
          <Radar name="Platform" dataKey="value" stroke="white" fill="aliceblue" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    );
}

export default ChartByPlatform;