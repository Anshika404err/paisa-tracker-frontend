import React, { useState, useEffect, useCallback } from "react"; // Added useCallback to fix exhaustive-deps
import axios from "axios";
import Navbar from '../../components/Navbar';
import './Savings.css';
import Table from 'react-bootstrap/Table';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import Modal from 'react-bootstrap/Modal';

function Savings2({ user, setUser, thememode, toggle }) {
  const [inputTitle, setInputTitle] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [amount, setAmount] = useState("");
  const [Currency, setCurrency] = useState('inr');
  
  const [savingData, setSavingData] = useState([]);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleInputTitle = (event) => {
    const capitalizedTitle = capitalizeFirstLetter(event.target.value);
    setInputTitle(capitalizedTitle);
  };

  const handleCurrentAmount = (event) => {
    setCurrentAmount(event.target.value);
  };

  const handleAmount = (event) => {
    setAmount(event.target.value);
  };

  const handleCurrency = (event) => {
    setCurrency(event.target.value);
  };

  const [show, setShow] = useState(false);
  const [sellectedsav, setselectedsav] = useState(null);
  const [selectedSavingId, setSelectedSavingId] = useState(null);
  
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  
  const handleShowDeleteModal = (id) => {
    setSelectedSavingId(id);
    setShowDeleteModal(true);
  };

  const [sav, setsav] = useState({
    userId: user?._id || "",
    targetAmt: '',
    currAmt: '',
    currency: '',
    title: ''
  });

  const handleSaving = (name) => (e) => {
    if (name === 'title') {
      const capitalizedTitle = capitalizeFirstLetter(e.target.value);
      setsav({ ...sav, [name]: capitalizedTitle });
    } else {
      setsav({ ...sav, [name]: e.target.value });
    }
  };

  const [errorMessage, setErrorMessage] = useState("");
  
  const handleClose = () => { 
    setShow(false); 
    setselectedsav(null); 
    setErrorMessage(""); 
  };
  
  const handleShow = (savItem) => {
    setShow(true);
    setselectedsav(savItem);
    setsav({
      userId: user?._id,
      targetAmt: savItem.targetAmt,
      currAmt: savItem.currAmt,
      title: savItem.title,
    });
  };

  const handlesavedit = (e, obj) => {
    e.preventDefault();
    const editSavings = async () => {
      try {
        if (!sav.currAmt || !sav.targetAmt || !sav.title) {
          setErrorMessage("All entries should be filled");
          return;
        }
        await axios.put(`${process.env.REACT_APP_BASE_URL}/api/savings/editSaving/${obj._id}`, { sav });
        setUpdateFlag(prev => !prev);
        handleClose();
      } catch (err) {
        console.log(err);
      }
    };
    editSavings();
  };

  const [currencyData, setCurrencyData] = useState({});
  
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=LQvy3LtRMZSLNj7WvwKX3tPoA37h6FdzWNaLbw4f&currencies=INR%2CMXN%2CSEK%2CCHF%2CSGD%2CHKD%2CCNY%2CCAD%2CAUD%2CJPY%2CGBP%2CEUR%2CUSD&base_currency=INR`);
        const result = await response.json();
        setCurrencyData(result.data);
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };
    fetchCurrency();
  }, []);

  const handleAddSaving = async (e) => {
    e.preventDefault();
    try {
      const currencysmall = Currency.toUpperCase();
      const rate = currencyData[currencysmall] || 1;

      const saving = {
        userId: user?._id,
        title: inputTitle,
        currAmt: Math.floor(currentAmount / rate),
        targetAmt: Math.floor(amount / rate),
        Currency: Currency
      };

      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/savings/addSaving`, { saving });
      setSavingData(prev => [...prev, res.data.saving]);
      setInputTitle("");
      setCurrentAmount("");
      setAmount("");
    } catch (err) {
      console.log(err);
    }
  };

  // Wrapped in useCallback to satisfy the useEffect dependency warning
  const addBadge = useCallback(async (img) => {
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/user/addbadge/${user?._id}`, { img });
    } catch (err) {
      console.log(err.response?.data);
    }
  }, [user?._id]);

  useEffect(() => {
  const getSavings = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/savings/getSavings/${user._id}`);
      setSavingData(res.data.savings);
      const numberOfSavings = res.data.savings.filter(s => s.currAmt >= s.targetAmt).length;
      if (numberOfSavings === 5) addBadge('JLLAW.png');
    } catch (err) {
      console.log(err);
    }
  };
  getSavings();
}, [user?._id, updateFlag, addBadge]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/savings/deleteSaving/${selectedSavingId}`);
      setUpdateFlag((prev) => !(prev));
      handleCloseDeleteModal();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }} className="min-h-full overflow-x-hidden">
     <Navbar thememode={thememode} toggle={toggle} setUser={setUser} user={user} />
      <div className="outer min-h-screen w-full" style={{ color: thememode === "dark" ? "white" : "black", backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }}>
        <div className='font-extrabold text-2xl mx-4 mt-4 decoration-[#000080] dark:text-[#f0f0f0]'>Savings Tracker</div>
        <div className='mx-4 text-gray-600 dark:text-gray-200'>Have any financial goals? Track them here!</div>
        <div className="main-body h-full" style={{ color: thememode === "dark" ? "white" : "black" }}>
          <div className="main-left" style={{ borderColor: '#000080', backgroundColor: thememode === 'dark' ? '#2c3034' : 'white' }} >
            
            <div className="due flex justify-between items-center w-full gap-4">
              <label style={{ color: thememode === 'dark' ? 'white' : 'black' }} className='w-[30%]'>Title</label>
              <input
                type="text"
                placeholder="Input the title"
                className="w-[70%] p-2 dark:bg-[#3a3a3a] dark:text-white dark:placeholder-white"
                value={inputTitle}
                onChange={handleInputTitle}
              />
            </div>

            <div className="due flex items-center justify-between w-full gap-4">
              <label className='w-[30%]' style={{ color: thememode === 'dark' ? 'white' : 'black' }}>Current Amount</label>
              <input
                type="number"
                placeholder="Input the Current Amount"
                className="w-[70%] p-2 dark:bg-[#3a3a3a] dark:text-white dark:placeholder-white"
                value={currentAmount}
                onChange={handleCurrentAmount}
                style={{ color: thememode === "dark" ? "white" : "black", backgroundColor: thememode === "dark" ? "#3a3a3a" : "white" }}
              />
            </div>

            <div className="due flex items-center justify-between w-full gap-4">
              {/* FIXED syntax error from image_727a00.png (Ln 311) */}
              <label className='w-[30%]' style={{ color: thememode === 'dark' ? 'white' : 'black' }}>Goal Amount</label>
              <input
                type="number"
                placeholder="Input the Goal Amount"
                className="w-[70%] p-2 dark:bg-[#3a3a3a] dark:text-white dark:placeholder-white"
                value={amount}
                onChange={handleAmount}
                style={{ color: thememode === "dark" ? "white" : "black", backgroundColor: thememode === "dark" ? "#3a3a3a" : "white" }}
              />
            </div>

            <div className="due flex items-center justify-between w-full gap-4">
              <label className='w-[30%]' style={{ color: thememode === 'dark' ? 'white' : 'black' }}>Currency</label>
              <select
                value={Currency}
                onChange={handleCurrency}
                className="w-[70%] p-2 dark:bg-[#3a3a3a] outline rounded-sm outline-slate-200 dark:placeholder-white"
                style={{ color: thememode === "dark" ? "white" : "black", backgroundColor: thememode === "dark" ? "#3a3a3a" : "white" }}
                required
              >
                <option value="">Select:</option>
                <option value="inr">inr</option>
                <option value="usd">usd</option>
                <option value="eur">eur</option>
                <option value="gbp">gbp</option>
                <option value="jpy">jpy</option>
                <option value="aud">aud</option>
                <option value="cad">cad</option>
                <option value="cny">cny</option>
                <option value="hkd">hkd</option>
                <option value="sgd">sgd</option>
                <option value="chf">chf</option>
                <option value="sek">sek</option>
                <option value="mxn">mxn</option>
              </select>
            </div>

            <div className="savings-holder">
              <button className="rounded-md p-1 text-white w-full bg-[#000080]" onClick={handleAddSaving}>
                Add Saving
              </button>
            </div>
          </div>

          <div className="hero-right h-full">
            <div className="storing-savings">
              <div className="overflow-y-scroll w-full max-h-[500px]">
                <Table striped borderless hover variant={thememode === 'dark' ? 'dark' : ''}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Current Amount</th>
                      <th>Goal Amount</th>
                      <th>Completion(%)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingData?.map((item) => (
                      <tr key={item._id}>
                        <td>{item.title}</td>
                        <td>&#8377; {item.currAmt}</td>
                        <td>&#8377; {item.targetAmt}</td>
                        <td>{(Math.min((item.currAmt / item.targetAmt) * 100, 100)).toFixed(2)} %</td>
                        <td>
                          <div className='flex justify-end w-[80%] gap-4 mr-6'>
                            <AiFillEdit onClick={() => handleShow(item)} style={{ cursor: 'pointer' }} />
                            <AiFillDelete onClick={() => handleShowDeleteModal(item._id)} style={{ cursor: 'pointer' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            {/* Edit Modal */}
            <Modal show={show} onHide={handleClose} animation={false} centered>
              <Modal.Header closeButton>
                <Modal.Title className='font-bolder'>Edit Saving</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={(e) => handlesavedit(e, sellectedsav)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-sm">Title</label>
                      <input type="text" className="border border-gray-300 p-2 rounded w-full text-sm" value={sav.title} onChange={handleSaving('title')} />
                    </div>
                    <div>
                      <label className="font-bold text-sm">Current Amount</label>
                      <input type="number" className="border border-gray-300 p-2 rounded w-full text-sm" value={sav.currAmt} onChange={handleSaving('currAmt')} />
                    </div>
                    <div>
                      <label className="font-bold text-sm">Target Amount</label>
                      <input type="number" className="border border-gray-300 p-2 rounded w-full text-sm" value={sav.targetAmt} onChange={handleSaving('targetAmt')} />
                    </div>
                  </div>
                  {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                  <button type="submit" className="mt-4 bg-[#000080] text-white py-2 px-4 rounded">Save Changes</button>
                </form>
              </Modal.Body>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Are you sure you want to delete this saving?</p>
              </Modal.Body>
              <Modal.Footer>
                <div className='flex w-full justify-end'>
                  <button className="bg-[#000080] mx-2 text-white p-2 rounded-md" onClick={handleCloseDeleteModal}>
                    Cancel
                  </button>
                  <button className="bg-[#dc2626] text-white p-2 rounded-md" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Savings2;