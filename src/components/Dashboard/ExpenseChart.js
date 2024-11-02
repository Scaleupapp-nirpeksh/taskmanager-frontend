// src/components/Dashboard/ExpenseChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for the chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpenseChart = ({ expenses = [] }) => { // Default to an empty array
  const data = {
    labels: ["January", "February", "March", "April"], // Example months
    datasets: [
      {
        label: 'Monthly Spend',
        data: expenses.map(exp => exp.amount || 0), // Use amount or default to 0
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  return <Bar data={data} />;
};

export default ExpenseChart;
