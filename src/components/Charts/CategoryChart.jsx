import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';

// ✅ Register all required Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const CategoryChart = ({ allCategories, categoryData, thememode }) => {

  // ✅ Guard against empty data
  if (!categoryData || categoryData.length === 0) {
    return (
      <div
        className='w-[400px] h-[200px] p-6 shadow-md rounded-lg flex justify-center items-center text-gray-400 text-sm'
        style={{ backgroundColor: thememode === 'dark' ? "#2c3034" : "white" }}
      >
        No category data available yet.
      </div>
    );
  }

  const colors = generateColors(allCategories.length, thememode);

  const lightTheme = {
    colorText: 'black',
  };

  const darkTheme = {
    colorText: 'white',
  };

  const theme = thememode === 'dark' ? darkTheme : lightTheme;

  const data = {
    labels: categoryData.map((data) => data._id),
    datasets: [
      {
        label: 'Income',
        backgroundColor: colors.incomeBackgroundColors,
        borderColor: colors.incomeBorderColors,
        borderWidth: 1,
        data: categoryData.map((data) => data.totalIncome),
      },
      {
        label: 'Expenses',
        backgroundColor: colors.expensesBackgroundColors,
        borderColor: colors.expensesBorderColors,
        borderWidth: 1,
        data: categoryData.map((data) => data.totalExpense),
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: theme.colorText,
        },
      },
    },
  };

  return (
    <div
      className='w-[400px] h-[500px] p-6 shadow-md rounded-lg m-auto'
      style={{ backgroundColor: thememode === 'dark' ? "#2c3034" : "white" }}
    >
      <p className='w-full text-center font-bold' style={{ color: theme.colorText }}>
        Category wise data
      </p>
      <Pie data={data} options={options} />
    </div>
  );
};

export default CategoryChart;

const generateColors = (count, thememode) => {
  const backgroundColors = [];
  const borderColors = [];

  const generateColor = (index) => {
    const hue = (index * (360 / count)) % 360;
    const lightness = thememode === 'dark' ? 25 : 75;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  for (let i = 0; i < count; i++) {
    backgroundColors.push(generateColor(i));
    borderColors.push(generateColor(i));
  }

  return {
    incomeBackgroundColors: backgroundColors,
    incomeBorderColors: borderColors,
    expensesBackgroundColors: backgroundColors,
    expensesBorderColors: borderColors,
  };
};