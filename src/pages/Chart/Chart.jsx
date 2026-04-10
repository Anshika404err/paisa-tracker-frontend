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
  // incomeArray and expenseArray were removed because they were assigned values but never used
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    // local storage check
    const check = async () => {
      try {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
          const foundUser = JSON.parse(loggedInUser);
          await setUser(foundUser);
        }
      } catch (err) {
        console.error(err)
      }
    }
    
    // fetching previous week's transaction data
    const getWeeklyData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getWeeklyTransaction/${user._id}`)
        setWeeklyData(res.data.weeklyData)
      } catch (err) {
        console.error(err)
      }
    }

    // fetching monthly transaction data
    const getMonthlyData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getMonthlyTransaction/${user._id}`)
        setMonthlyData(res.data.monthlyData)
      } catch (err) {
        console.error(err)
      }
    }

    // fetching yearly transaction data
    const getYearlyData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getYearlyTransaction/${user._id}`)
        setYearlyData(res.data.yearlyData)
      } catch (err) {
        console.error(err)
      }
    }

    // fetching category-wise transactions
    const getCategory = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transactions/getCategoryWiseTransaction/${user._id}`)
        const result = res.data
        setCategoryData(result)
        
        // Update allCategories state
        const categories = result.map(item => item._id);
        setAllCategories(categories)
        
        // Note: expenseArray and incomeArray variables were deleted from state 
        // as they were not being used anywhere in the JSX.
      } catch (err) {
        console.error(err)
      }
    }

    if (user?._id) {
      check()
      getWeeklyData()
      getMonthlyData()
      getYearlyData()
      getCategory()
    }
    // Added setUser to the dependency array to satisfy exhaustive-deps
  }, [user._id, setUser]) 
if (!user) return <div className="p-10 text-center">Loading User Data...</div>;
  return (
    // Changed '==' to '===' for strict equality comparison
    <div style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }} className='min-h-screen overflow-x-hidden'>
      {/* ------------ Navbar ------------------------ */}
      <Navbar thememode={thememode} toggle={toggle} />

      {/* ----------------------- title --------------------------------  */}
      <div className='h-screen'>
        <div className='font-extrabold text-2xl mx-4 mt-4 dark:text-[#f0f0f0]'>Visualise your Transactions</div>
        <div className='mx-4 mb-4 text-gray-600 dark:text-gray-400'>Analyze how much you spent or earned on a weekly, monthly, yearly or category-wise basis</div>
        <div className='flex justify-around p-4'>
          <div className='grid grid-rows-2 grid-cols-2 gap-4'>
            <div>
              <WeeklyChart weeklyData={weeklyData} thememode={thememode} toggle={toggle} />
            </div>

            {/* ------------------------- Monthly Chart -------------------------  */}
            <div>
              <MonthlyChart monthlyData={monthlyData} thememode={thememode} />
            </div>
            <div>
              <YearlyChart yearlyData={yearlyData} thememode={thememode} />
            </div>
          </div>

          {/* ------------------------- Category chart ------------------------- */}
          <div className='flex align-middle'>
            <CategoryChart categoryData={categoryData} allCategories={allCategories} thememode={thememode} toggle={toggle} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chart