import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// ✅ FIX 1 — Register Chart.js (was completely missing)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyChart = ({ monthlyData, thememode }) => {

  // ✅ FIX 2 — Guard against empty/undefined data
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div
        className='w-full h-40 p-4 shadow-md rounded-lg flex justify-center items-center text-gray-400 text-sm'
        style={{ backgroundColor: thememode === 'dark' ? "#2c3034" : "white" }}
      >
        No monthly data available yet.
      </div>
    );
  }

  const lightTheme = {
    colorText: 'black',
    income: 'rgba(75,192,192,0.5)',
    incomeBorder: 'rgba(75,192,192,1)',
    expenses: 'rgba(255,99,132,0.5)',
    expensesBorder: 'rgba(255,99,132,1)',
  };

  const darkTheme = {
    colorText: 'white',
    income: 'rgba(34,139,34,0.5)',
    incomeBorder: 'rgba(34,139,34,1)',
    expenses: 'rgba(165,42,42,0.5)',
    expensesBorder: 'rgba(165,42,42,1)',
  };

  const colors = thememode === 'dark' ? darkTheme : lightTheme;

  const data = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Income',
        backgroundColor: colors.income,
        borderColor: colors.incomeBorder,
        borderWidth: 1,
        data: monthlyData.map(data => data.totalIncome),
      },
      {
        label: 'Expenses',
        backgroundColor: colors.expenses,
        borderColor: colors.expensesBorder,
        borderWidth: 1,
        data: monthlyData.map(data => data.totalExpense),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: colors.colorText } },
      y: { ticks: { color: colors.colorText } },
    },
    plugins: {
      legend: { labels: { color: colors.colorText } },
    },
  };

  return (
    // ✅ FIX 3 — explicit height so chart renders (w-100/h-auto breaks Chart.js)
    <div
      className='w-full p-4 shadow-md rounded-lg m-auto'
      style={{ backgroundColor: thememode === 'dark' ? "#2c3034" : "white", height: '400px' }}
    >
      <p className='w-full text-center font-bold' style={{ color: colors.colorText }}>
        Monthly Statistics
      </p>
      <div style={{ height: '340px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default MonthlyChart;