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

// ✅ FIX 1 — Register Chart.js components (was completely missing)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyChart = ({ weeklyData, thememode }) => {

  // ✅ FIX 2 — Guard uses weeklyData not monthlyData, and was placed BEFORE darkTheme (wrong order)
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className='flex justify-center items-center h-40 text-gray-400 text-sm'>
        No data available yet.
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
    labels: weeklyData.map((data) => data.date),
    datasets: [
      {
        label: 'Income',
        backgroundColor: colors.income,
        borderColor: colors.incomeBorder,
        borderWidth: 1,
        data: weeklyData.map((data) => data.totalIncome),
      },
      {
        label: 'Expenses',
        backgroundColor: colors.expenses,
        borderColor: colors.expensesBorder,
        borderWidth: 1,
        data: weeklyData.map((data) => data.totalExpense),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: colors.colorText,
        },
      },
      y: {
        ticks: {
          color: colors.colorText,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: colors.colorText,
        },
      },
    },
  };

  return (
    // ✅ FIX 3 — Fixed height container so chart renders properly
    <div
      className='w-full p-4 shadow-md rounded-lg m-auto'
      style={{
        backgroundColor: thememode === 'dark' ? "#2c3034" : "white",
        height: '400px'
      }}
    >
      <p
        className='w-full text-center font-bold mb-2'
        style={{ color: thememode === 'dark' ? 'white' : 'black' }}
      >
        Weekly Statistics
      </p>
      <div style={{ height: '340px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyChart;