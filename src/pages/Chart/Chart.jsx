import React, { useEffect, useState } from 'react'
import WeeklyChart from '../../components/Charts/WeeklyChart'
import MonthlyChart from '../../components/Charts/MonthlyChart'
import YearlyChart from '../../components/Charts/YearlyChart'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import CategoryChart from '../../components/Charts/CategoryChart'

const Chart = ({ user, setUser, thememode, toggle }) => {
  const [weeklyData, setWeeklyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [yearlyData, setYearlyData] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    const getWeeklyData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getWeeklyTransaction/${user._id}`)
        setWeeklyData(res.data.weeklyData)
      } catch (err) { console.error(err) }
    }

    const getMonthlyData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getMonthlyTransaction/${user._id}`)
        setMonthlyData(res.data.monthlyData)
      } catch (err) { console.error(err) }
    }

    const getYearlyData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getYearlyTransaction/${user._id}`)
        setYearlyData(res.data.yearlyData)
      } catch (err) { console.error(err) }
    }

    const getCategory = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getCategoryWiseTransaction/${user._id}`)
        const result = res.data
        setCategoryData(result)
        setAllCategories(result.map(item => item._id))
      } catch (err) { console.error(err) }
    }

    // ✅ FIX — removed check() from here, App.js already handles localStorage
    // check() was overwriting user state and causing race condition
    if (user?._id) {
      getWeeklyData()
      getMonthlyData()
      getYearlyData()
      getCategory()
    }
  }, [user?._id]) // ✅ use optional chaining to avoid crash when user is {}

  if (!user?._id) return (
    <div
      style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }}
      className='min-h-screen flex justify-center items-center'
    >
      <div style={{ color: thememode === "dark" ? "white" : "black" }}>
        Loading...
      </div>
    </div>
  );

  return (
    <div
      style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }}
      className='min-h-screen overflow-x-hidden'
    >
      {/* ✅ FIX — pass user and setUser to Navbar */}
      <Navbar thememode={thememode} toggle={toggle} setUser={setUser} user={user} />

      <div className='font-extrabold text-2xl mx-4 mt-4'
        style={{ color: thememode === "dark" ? "white" : "black" }}>
        Visualise your Transactions
      </div>
      <div className='mx-4 mb-4 text-gray-500'>
        Analyze how much you spent or earned on a weekly, monthly, yearly or category-wise basis
      </div>

      {/* ✅ FIX — responsive grid layout that doesn't overflow */}
      <div className='flex flex-col lg:flex-row gap-6 p-4'>

        {/* Left — 3 bar charts in a grid */}
        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <WeeklyChart weeklyData={weeklyData} thememode={thememode} />
          <MonthlyChart monthlyData={monthlyData} thememode={thememode} />
          <YearlyChart yearlyData={yearlyData} thememode={thememode} />
        </div>

        {/* Right — category pie chart */}
        <div className='flex justify-center items-start'>
          <CategoryChart
            categoryData={categoryData}
            allCategories={allCategories}
            thememode={thememode}
          />
        </div>

      </div>
    </div>
  )
}

export default Chart