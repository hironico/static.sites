import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Legend, CartesianGrid, Bar } from "recharts";

function ChartByCountry() {
  const [chartData, setChartData] = useState(null);

  const fetchChartData = () => {
    const full = window.location.protocol + '//' + window.location.host;
    fetch(`${full}/api/webaccess/by/country`)
      .then(response => response.json())
      .then(data => setChartData(data));
  }

  useEffect(() => {
    if (chartData === null) {
      fetchChartData();
    }
  });

  return (
    <ResponsiveContainer width="100%" height="100%" className="card-dark">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barSize={20}
        title="Visits by countries"
      >
        <XAxis dataKey="country_code" scale="point" padding={{ left: 10, right: 10 }} tick={{ fill: 'aliceblue' }} />
        <YAxis tick={{ fill: 'aliceblue' }} />
        <Legend verticalAlign="top" />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="count" fill="aliceblue" stroke="white" name="Number of visits by country" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ChartByCountry;