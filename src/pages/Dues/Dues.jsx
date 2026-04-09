import React, { useState, useEffect } from 'react';
import './Dues.css'
import axios from "axios";
import Navbar from '../../components/Navbar.jsx'
import Table from 'react-bootstrap/Table';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import Modal from 'react-bootstrap/Modal';

function Dues({ user, thememode, toggle, setUser }) {
  const [billflag, setbillflag] = useState(false)
  const [selecteddue, setselecteddue] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [dueItem, setdueItem] = useState({
    userId: user._id,
    title: '',
    dueDate: '',
    amount: '',
    toWhom: '',
    recurring: 'daily',
    currency: 'inr'
  });

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const [BillData, setBillData] = useState([]);
  const [errorMessageAdd, setErrorMessageAdd] = useState("");

  // ---------------input ----------------------- 
  const handleBillInput = (name) => (e) => {
    if (name === 'title' || name === 'toWhom') {
      const capitalizedTitle = capitalizeFirstLetter(e.target.value);
      setdueItem({ ...dueItem, [name]: capitalizedTitle });
    }
    else {
      setdueItem({ ...dueItem, [name]: e.target.value });
    }
  };

  // -----------------function to manage mails ------------------- 
  const mailsendstart = async () => {
    try {
      const reqmail = user.email;
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/mail/sendstartmail`, { reqmail });
      alert('Message Sent Successfully');
    } catch (err) {
      console.error('Error sending start mail:', err);
    }
  };

  const mailsendrecurring = async (recurringType) => {
    try {
      const reqmail = user.email;
      const duedate = dueItem.dueDate;
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/mail/sendmailrecurring`, { reqmail, duedate, recurring: recurringType });
    } catch (err) {
      console.error('Error sending recurring mail:', err);
    }
  };

  // ----------------------- Submit ------------------- 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Currency conversion logic
    const currencysmall = dueItem.currency.toUpperCase();
    const conversionRate = currenciData && currenciData[currencysmall] ? currenciData[currencysmall] : 1;
    const finalAmount = Math.floor(dueItem.amount / conversionRate);

    if (dueItem.amount === '' || dueItem.title === '' || dueItem.toWhom === '' || dueItem.dueDate === '') {
      setErrorMessageAdd("All entries should be filled");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/bills/addBill`, { 
        dueItem: { ...dueItem, amount: finalAmount } 
      });
      
      const val = res.data.bill;
      setBillData((prev) => [...prev, val]);
      mailsendstart();

      // Fix: Date comparison logic
      const currdate = new Date();
      const duedate = new Date(dueItem.dueDate);
      
      if (
        currdate.getFullYear() === duedate.getFullYear() && 
        currdate.getMonth() === duedate.getMonth() && 
        currdate.getDate() === duedate.getDate()
      ) {
        mailsendrecurring(dueItem.recurring);
      }

      setdueItem({
        userId: user._id,
        title: '',
        dueDate: '',
        amount: '',
        toWhom: '',
        recurring: 'daily',
        currency: 'inr'
      });
      setErrorMessageAdd("");
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  useEffect(() => {
    const check = async () => {
      try {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
          const foundUser = JSON.parse(loggedInUser);
          setUser(foundUser);
        }
      } catch (err) {
        console.log(err)
      }
    }
    check()
  }, [setUser]); // Added setUser dependency

  useEffect(() => {
    const getBills = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/bills/getBills/${user._id}`);
        setBillData(res.data.bill);
      } catch (err) {
        console.log(err);
      }
    };
    if(user._id) getBills();
  }, [billflag, user._id])

  const UCurrency = (currency) => {
    const [data, setData] = useState({})
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=LQvy3LtRMZSLNj7WvwKX3tPoA37h6FdzWNaLbw4f&currencies=INR%2CMXN%2CSEK%2CCHF%2CSGD%2CHKD%2CCNY%2CCAD%2CAUD%2CJPY%2CGBP%2CEUR%2CUSD%2CCAD&base_currency=INR`);
          const result = await response.json();
          setData(result.data);
        } catch (error) {
          console.error('Error fetching currency data:', error);
        }
      };
      fetchData();
    }, [currency]);
    return data
  }

  const [currenci] = useState('inr');
  const currenciData = UCurrency(currenci);

  const [errorMessage, setErrorMessage] = useState("");
  const [show, setShow] = useState(false);
  const [sellectedbill, setselectedbill] = useState(null);
  const [Bill, setBill] = useState({
    userId: user._id,
    titleedit: '',
    dueDateedit: '',
    amountedit: '',
    toWhomedit: '',
  });

  const { titleedit, amountedit, toWhomedit, dueDateedit } = Bill;

  const handleBill = (name) => (e) => {
    if (name === 'titleedit' || name === 'toWhomedit') {
      const capitalizedTitle = capitalizeFirstLetter(e.target.value);
      setBill({ ...Bill, [name]: capitalizedTitle });
    }
    else {
      setBill({ ...Bill, [name]: e.target.value });
    }
  };

  const handleClose = () => { setShow(false); setselectedbill(null); setErrorMessage("") }
  
  const handleShow = (bill) => {
    setShow(true);
    setselectedbill(bill)
    setBill({
      userId: user._id,
      titleedit: bill.title,
      dueDateedit: bill.dueDate.slice(0, 10),
      amountedit: bill.amount,
      toWhomedit: bill.toWhom,
    });
  }

  const handleSubmitBill = (e, obj) => {
    e.preventDefault();
    const editBill = async () => {
      try {
        if (Bill.amountedit === '' || Bill.dueDateedit === '' || Bill.titleedit === '' || Bill.toWhomedit === '') {
          setErrorMessage("All entries should be filled");
          return;
        }
        await axios.put(`${process.env.REACT_APP_BASE_URL}/api/bills/editBill/${obj._id}`, { Bill });
        setbillflag((prev) => !(prev))
        handleClose();
      } catch (err) {
        console.log(err);
      }
    };
    editBill();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/bills/deleteBill/${selecteddue}`);
      setbillflag((prev) => !(prev))
      setShowDeleteModal(false)
    } catch (err) {
      console.log(err);
    }
  };

  const handleopendeletemodal = (id) => {
    setShowDeleteModal(true)
    setselecteddue(id)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setselecteddue(null)
  }

  return (
    <div style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }} className='min-h-screen overflow-x-hidden'>
      <Navbar thememode={thememode} toggle={toggle} />
      <div className="outer min-h-screen w-full">
        <div className='font-extrabold text-2xl mx-4 mt-4 dark:text-[#f0f0f0]'>Bills and Dues</div>
        <div className='mx-4 text-gray-600 dark:text-gray-200'>Manage your recurring bills and dues here. Receive reminders through email</div>
        <div className="hero-section h-full p-4 flex flex-col md:flex-row gap-4">
          
          {/* Hero Left - Form */}
          <div className="hero-left p-4 rounded-lg shadow-md md:w-1/3" style={{ backgroundColor: thememode === 'dark' ? '#2c3034' : 'white', color: thememode === 'dark' ? 'white' : 'black' }}>
            <div className="due mb-3 flex flex-col">
              <label>Title</label>
              <input type="text" value={dueItem.title} onChange={handleBillInput('title')} className="p-2 border rounded dark:bg-[#3a3a3a] text-black dark:text-white" />
            </div>
            <div className="due mb-3 flex flex-col">
              <label>Due date</label>
              <input type="date" value={dueItem.dueDate} onChange={handleBillInput('dueDate')} className="p-2 border rounded dark:bg-[#3a3a3a] text-black dark:text-white" />
            </div>
            <div className="due mb-3 flex flex-col">
              <label>Amount</label>
              <input type="number" value={dueItem.amount} onChange={handleBillInput('amount')} className="p-2 border rounded dark:bg-[#3a3a3a] text-black dark:text-white" />
            </div>
            <div className="due mb-3 flex flex-col">
              <label>Due To</label>
              <input type="text" value={dueItem.toWhom} onChange={handleBillInput('toWhom')} className="p-2 border rounded dark:bg-[#3a3a3a] text-black dark:text-white" />
            </div>
            <div className="due mb-3 flex flex-col">
              <label>Currency</label>
              <select value={dueItem.currency} onChange={handleBillInput('currency')} className="p-2 border rounded dark:bg-[#3a3a3a] text-black dark:text-white">
                <option value="inr">INR</option>
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
              </select>
            </div>
            <div className="due mb-3 flex flex-col">
              <label>Recurring</label>
              <select value={dueItem.recurring} onChange={handleBillInput('recurring')} className="p-2 border rounded dark:bg-[#3a3a3a] text-black dark:text-white">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {errorMessageAdd && <p className="text-red-500">{errorMessageAdd}</p>}
            <button className="w-full bg-[#000080] text-white p-2 rounded hover:opacity-90" onClick={handleSubmit}>Add Due</button>
          </div>

          {/* Hero Right - Table */}
          <div className="hero-right flex-1">
            <div className="overflow-x-auto">
              <Table striped bordered hover variant={thememode === 'dark' ? 'dark' : 'light'}>
                <thead>
                  <tr>
                    <th>To Whom</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {BillData?.map((bill) => (
                    <tr key={bill._id}>
                      <td>{bill.toWhom}</td>
                      <td>₹{bill.amount}</td>
                      <td>{bill.dueDate?.substring(0, 10)}</td>
                      <td>{bill.title}</td>
                      <td>
                        <div className='flex gap-2'>
                          <AiFillEdit onClick={() => handleShow(bill)} className="cursor-pointer text-blue-500" />
                          <AiFillDelete onClick={() => handleopendeletemodal(bill._id)} className="cursor-pointer text-red-500" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Bill</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={(e) => handleSubmitBill(e, sellectedbill)}>
              <div className="grid grid-cols-1 gap-3">
                <input type="text" placeholder="Title" className="p-2 border w-full" value={titleedit} onChange={handleBill('titleedit')} />
                <input type="date" className="p-2 border w-full" value={dueDateedit} onChange={handleBill('dueDateedit')} />
                <input type="number" placeholder="Amount" className="p-2 border w-full" value={amountedit} onChange={handleBill('amountedit')} />
                <input type="text" placeholder="To Whom" className="p-2 border w-full" value={toWhomedit} onChange={handleBill('toWhomedit')} />
              </div>
              {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
              <button type="submit" className="mt-3 w-full bg-[#000080] text-white p-2 rounded">Save Changes</button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this Bill?</Modal.Body>
          <Modal.Footer>
            <button className="bg-gray-500 text-white p-2 rounded mr-2" onClick={handleCloseDeleteModal}>Cancel</button>
            <button className="bg-red-600 text-white p-2 rounded" onClick={handleDelete}>Delete</button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Dues;