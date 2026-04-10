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

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/transactions/getTransactions/${user._id}`
        );
        const trans = res.data.trans;
        setTransactionData(trans);
        setFilteredData(trans);

        // ✅ FIX 1 — Calculate stats from fetched transactions
        const totalIncome = trans
          .filter(t => t.type?.toLowerCase() === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = trans
          .filter(t => t.type?.toLowerCase() === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        setStats({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense
        });

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

  // ✅ FIX 2 — Reset filter
  const handleResetFilter = () => {
    setFilterState(false);
    setFilteredData(transactionData);
    setFilterInput({ userId: user._id, category: '', startDate: '', endDate: '' });
  };

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
      <div
        className='font-extrabold text-xl md:text-2xl px-4 md:px-6 mt-2'
        style={{ color: thememode === "dark" ? "white" : "black" }}
      >
        Welcome, {user?.username}!
      </div>

      <div className='px-4 md:px-6 text-gray-500'>
        Let's add some transactions!
      </div>

      {/* STATS */}
      <div className='flex flex-col md:flex-row gap-4 w-full p-4'>
        <div className='w-full md:w-1/3 bg-[#000080] text-white p-4 rounded-md shadow-md'>
          <div className='text-xs uppercase tracking-wide opacity-75'>Total Income</div>
          <div className='text-2xl font-bold mt-1'>₹{stats.totalIncome || 0}</div>
        </div>
        <div className='w-full md:w-1/3 bg-[#000080] text-white p-4 rounded-md shadow-md'>
          <div className='text-xs uppercase tracking-wide opacity-75'>Balance</div>
          <div className='text-2xl font-bold mt-1'>₹{stats.balance || 0}</div>
        </div>
        <div className='w-full md:w-1/3 bg-[#000080] text-white p-4 rounded-md shadow-md'>
          <div className='text-xs uppercase tracking-wide opacity-75'>Total Expense</div>
          <div className='text-2xl font-bold mt-1'>₹{stats.totalExpense || 0}</div>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className='flex flex-col md:flex-row w-full'>

        {/* FILTER SIDEBAR */}
        <div className='w-full md:w-1/4 p-4'>
          <div
            className='flex flex-col gap-3 p-4 rounded-lg shadow-sm'
            style={{ backgroundColor: thememode === "dark" ? "#282828" : "white" }}
          >
            <div
              className='font-semibold text-sm uppercase tracking-wide'
              style={{ color: thememode === "dark" ? "white" : "black" }}
            >
              Filters
            </div>

            <select
              className='border rounded p-2 text-sm'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
              onChange={handleFilterInput('category')}
              value={filterInput.category}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div style={{ color: thememode === "dark" ? "#aaa" : "#555" }} className='text-xs'>
              Start Date
            </div>
            <input
              type="date"
              className='border p-2 rounded text-sm'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
              onChange={handleFilterInput('startDate')}
              value={filterInput.startDate}
            />

            <div style={{ color: thememode === "dark" ? "#aaa" : "#555" }} className='text-xs'>
              End Date
            </div>
            <input
              type="date"
              className='border p-2 rounded text-sm'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
              onChange={handleFilterInput('endDate')}
              value={filterInput.endDate}
            />

            <button
              onClick={handleFilter}
              className='bg-[#000080] text-white p-2 rounded text-sm font-medium hover:opacity-90 transition'
            >
              Apply Filter
            </button>

            {/* ✅ FIX 2 — Reset filter button */}
            {filterstate && (
              <button
                onClick={handleResetFilter}
                className='bg-gray-500 text-white p-2 rounded text-sm font-medium hover:opacity-90 transition'
              >
                Reset Filter
              </button>
            )}

            {/* ✅ FIX 3 — CSV export with filename and full width */}
            <CSVLink
              data={filteredData}
              headers={headers}
              filename={"transactions.csv"}
              className='w-full'
            >
              <button className='bg-[#000080] text-white p-2 rounded text-sm font-medium w-full hover:opacity-90 transition'>
                Export CSV
              </button>
            </CSVLink>

          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className='w-full md:w-3/4 p-2'>
          <div className='h-[70vh] overflow-y-auto'>
            {(filterstate ? filteredData : transactionData).length === 0 ? (
              <div
                className='flex justify-center items-center h-full text-gray-400 text-sm'
              >
                No transactions found. Click + to add one!
              </div>
            ) : (
              (filterstate ? filteredData : transactionData).map(trans => (
                <TransactionCard
                  key={trans._id}
                  transactionData={trans}
                  user={user}
                  thememode={thememode}
                  setTransactionData={setTransactionData}
                  setUpdateFlag={setUpdateFlag}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* FLOATING ADD BUTTON */}
      <button
        onClick={handleShow}
        className='fixed bottom-6 right-6 bg-[#000080] text-white rounded-full w-14 h-14 text-2xl shadow-lg hover:opacity-90 transition z-50'
      >
        +
      </button>

      {/* ADD TRANSACTION MODAL */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: thememode === "dark" ? "#282828" : "white", color: thememode === "dark" ? "white" : "black" }}
        >
          <Modal.Title>Add Transaction</Modal.Title>
        </Modal.Header>

        {/* ✅ FIX 4 — inline style to override Bootstrap on Modal.Body */}
        <Modal.Body
          className='flex flex-col gap-2'
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: thememode === "dark" ? "#282828" : "white",
            color: thememode === "dark" ? "white" : "black"
          }}
        >
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium'>Type</label>
            <select
              onChange={handleTransInput('type')}
              className='border p-2 rounded'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium'>Amount *</label>
            <input
              type="number"
              placeholder='Enter amount'
              onChange={handleTransInput('amount')}
              className='border p-2 rounded'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium'>Category *</label>
            <input
              type="text"
              placeholder='e.g. Food, Rent, Salary'
              onChange={handleTransInput('category')}
              className='border p-2 rounded'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium'>Description</label>
            <input
              type="text"
              placeholder='Optional description'
              onChange={handleTransInput('desc')}
              className='border p-2 rounded'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium'>Date *</label>
            <input
              type="date"
              onChange={handleTransInput('date')}
              className='border p-2 rounded'
              style={{
                backgroundColor: thememode === "dark" ? "#3a3a3a" : "white",
                color: thememode === "dark" ? "white" : "black",
                borderColor: thememode === "dark" ? "#555" : "#ccc"
              }}
            />
          </div>

        </Modal.Body>

        <Modal.Footer
          style={{ backgroundColor: thememode === "dark" ? "#282828" : "white" }}
        >
          {errorMessage && <p className="text-red-500 text-sm w-full">{errorMessage}</p>}
          <button
            onClick={handleSubmit}
            className='bg-[#000080] text-white p-2 rounded w-full font-medium hover:opacity-90 transition'
          >
            Save Transaction
          </button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default Dashboard;