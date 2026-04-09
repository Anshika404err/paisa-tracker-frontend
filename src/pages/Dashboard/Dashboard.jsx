/* eslint-disable */
import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Modal from 'react-bootstrap/Modal';
import axios from "axios"
import TransactionCard from '../../components/Cards/TransactionCard';
import { CSVLink } from "react-csv"
import './Dashboard.css'

const Dashboard = ({ user, thememode, toggle, setUser }) => {

  const [updateFlag, setUpdateFlag] = useState(false);
  const [show, setShow] = useState(false)

  const [transInput, setTransInput] = useState({
    userId: user._id,
    type: 'Expense',
    amount: '',
    category: '',
    desc: '',
    date: '',
    currency: 'inr'
  })

  const [filterInput, setFilterInput] = useState({
    userId: user._id,
    category: '',
    startDate: '',
    endDate: '',
  })

  const [errorMessage, setErrorMessage] = useState("");
  const [transactionData, setTransactionData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filterstate, setFilterState] = useState(false)
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [stats, setStats] = useState({})

  const headers = [
    { label: "Transaction Type", key: "type" },
    { label: "Amount", key: "amount" },
    { label: "Category", key: "category" },
    { label: "Description", key: "desc" },
    { label: "Date", key: "date" }
  ];

  const { type, category, desc, date, currency } = transInput
  let { amount } = transInput

  // ---------------- MODAL ----------------
  const handleClose = () => {
    setShow(false);
    setTransInput({
      userId: user._id,
      type: 'Expense',
      amount: '',
      category: '',
      desc: '',
      date: '',
      currency: 'inr'
    });
    setErrorMessage("")
  };

  const handleShow = () => setShow(true);

  // ---------------- INPUT ----------------
  const handleTransInput = name => (e) => {
    setTransInput({ ...transInput, [name]: e.target.value })
  }

  const handleFilterInput = name => e => {
    setFilterInput({ ...filterInput, [name]: e.target.value })
  }

  const isFilterEmpty =
    filterInput.category === "" &&
    filterInput.startDate === "" &&
    filterInput.endDate === "";

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/transactions/getTransactions/${user._id}`
        );
        setTransactionData(res.data.trans)
        setFilteredData(res.data.trans)
      } catch (err) {
        console.log(err)
      }
    }
    if (user?._id) fetchData();
  }, [updateFlag, user?._id]);

  useEffect(() => {
    const categoriesSet = new Set(transactionData.map(t => t.category));
    setUniqueCategories([...categoriesSet]);
  }, [transactionData]);

  // ---------------- FILTER ----------------
  const handleFilter = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/getTransactionsByFilter`,
        { filterInput }
      );
      setFilteredData(res.data.trans)
      setFilterState(true)
    } catch (err) {
      console.log(err)
    }
  }

  // ---------------- ADD TRANSACTION ----------------
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || !category || !date || !type) {
      setErrorMessage("Fill all required fields");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/addTransaction`,
        { userId: user._id, type, category, desc, date, currency, amount }
      );

      setTransactionData(prev => [...prev, res.data.transaction])
      setUpdateFlag(prev => !prev)
      handleClose()

    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div
      style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }}
      className='min-h-screen'
    >

      {/* NAVBAR */}
      <Navbar thememode={thememode} toggle={toggle} />

      {/* HEADER */}
      <div className='font-extrabold text-xl md:text-2xl px-4 md:px-6 mt-2'>
        Welcome, {user?.username}!
      </div>

      <div className='px-4 md:px-6 text-gray-500'>
        Let's add some transactions!
      </div>

      {/* STATS */}
      <div className='flex flex-col md:flex-row gap-4 w-full p-4'>
        <div className='w-full md:w-1/3 bg-[#000080] text-white p-4 rounded-md'>
          Income: ₹{stats.totalIncome || 0}
        </div>
        <div className='w-full md:w-1/3 bg-[#000080] text-white p-4 rounded-md'>
          Balance: ₹{stats.balance || 0}
        </div>
        <div className='w-full md:w-1/3 bg-[#000080] text-white p-4 rounded-md'>
          Expense: ₹{stats.totalExpense || 0}
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className='flex flex-col md:flex-row w-full'>

        {/* FILTER */}
        <div className='w-full md:w-1/4 p-4'>
          <div className='flex flex-col gap-3'>

            <select
              className='border rounded p-2'
              onChange={handleFilterInput('category')}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="date"
              className='border p-2 rounded'
              onChange={handleFilterInput('startDate')}
            />

            <input
              type="date"
              className='border p-2 rounded'
              onChange={handleFilterInput('endDate')}
            />

            <button
              onClick={handleFilter}
              className='bg-[#000080] text-white p-2 rounded'
            >
              Apply Filter
            </button>

            <CSVLink data={filteredData} headers={headers}>
              <button className='bg-[#000080] text-white p-2 rounded'>
                Export CSV
              </button>
            </CSVLink>

            {/* FLOAT BUTTON */}
            <button
              onClick={handleShow}
              className='fixed bottom-5 right-5 md:bottom-8 md:right-8 bg-[#000080] text-white rounded-full w-12 h-12'
            >
              +
            </button>

          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className='w-full md:w-3/4 p-2'>
          <div className='h-[70vh] overflow-y-auto'>
            {(filterstate ? filteredData : transactionData).map(trans => (
              <TransactionCard
                key={trans._id}
                transactionData={trans}
                user={user}
                thememode={thememode}
                setTransactionData={setTransactionData}
                setUpdateFlag={setUpdateFlag}
              />
            ))}
          </div>
        </div>

      </div>

      {/* MODAL */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Transaction</Modal.Title>
        </Modal.Header>

        <Modal.Body className='flex flex-col gap-2'>

          <select onChange={handleTransInput('type')} className='border p-2'>
            <option>Expense</option>
            <option>Income</option>
          </select>

          <input type="number" placeholder='Amount' onChange={handleTransInput('amount')} className='border p-2' />

          <input type="text" placeholder='Category' onChange={handleTransInput('category')} className='border p-2' />

          <input type="text" placeholder='Description' onChange={handleTransInput('desc')} className='border p-2' />

          <input type="date" onChange={handleTransInput('date')} className='border p-2' />

        </Modal.Body>

        <Modal.Footer>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <button onClick={handleSubmit} className='bg-[#000080] text-white p-2 rounded w-full'>
            Save
          </button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default Dashboard;