// src/pages/Dashboard.jsx
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, ArcElement, Legend } from "chart.js";

// Register chart components
ChartJS.register(Title, Tooltip, ArcElement, Legend);

function Dashboard() {
  const data = {
    labels: ['Category 1', 'Category 2', 'Category 3'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="max-w-lg mx-auto">
        <Pie data={data} />
      </div>
    </div>
  );
}

export default Dashboard;
