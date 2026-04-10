
import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { AiFillEdit, AiFillDelete, AiTwotoneCalendar } from 'react-icons/ai';

const TransactionCard = ({ user, transactionData, thememode, setUpdateFlag }) => {

  const [show, setShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [transInput, setTransInput] = useState({
    userId: user?._id,
    type: 'expense',
    amount: '',
    category: '',
    desc: '',
    date: '',
    currency: '',
  });

  const [errorMessage, setErrorMessage] = useState("");

  if (!transactionData) return null;

  const { type, amount, category, desc, date } = transInput;

  // ---------------- INPUT ----------------
  const handleTransInput = (name) => (e) => {
    setTransInput({ ...transInput, [name]: e.target.value });
  };

  // ---------------- MODAL ----------------
  const handleShow = () => {
    setShow(true);
    setTransInput({
      type: transactionData.type,
      amount: transactionData.amount,
      category: transactionData.category,
      desc: transactionData.desc,
      date: transactionData?.date?.slice(0, 10),
      currency: transactionData.currency
    });
  };

  const handleClose = () => {
    setShow(false);
    setErrorMessage("");
  };

  // ---------------- UPDATE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category || !date || !type) {
      setErrorMessage("Fill all required fields");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/editTransaction/${transactionData._id}`,
        { transInput }
      );

      setUpdateFlag(prev => !prev);
      handleClose();

    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/deleteTransaction/${transactionData._id}`
      );
      setUpdateFlag(prev => !prev);
      setShowDeleteModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>

      {/* ✅ CARD */}
      <Card className='mx-2 md:mx-4 my-2 md:my-4 shadow-sm'>

        <Card.Header
          className='font-bold text-base md:text-lg'
          style={{ backgroundColor: thememode === "dark" ? "#3a3a3a" : "white" }}
        >
          Category: {transactionData.category}
        </Card.Header>

        <Card.Body style={{ backgroundColor: thememode === "dark" ? "#282828" : "white" }}>

          {/* TOP ROW */}
          <div className='flex justify-between items-center flex-wrap gap-2'>

            <Card.Text
              className='text-sm md:text-md font-semibold'
              style={{ color: transactionData.type?.toLowerCase() === "expense" ? 'red' : 'green' }}
            >
              ₹ {transactionData.amount}
            </Card.Text>

            <div className='flex gap-3'>
              <AiFillEdit size={20} onClick={handleShow} style={{ cursor: "pointer" }} />
              <AiFillDelete size={20} onClick={() => setShowDeleteModal(true)} style={{ cursor: "pointer" }} />
            </div>

          </div>

          {/* DESCRIPTION */}
          <Card.Text className='text-sm mt-2'>
            {transactionData.desc || 'No description'}
          </Card.Text>

          {/* DATE */}
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <AiTwotoneCalendar />
            {transactionData?.date?.substring(0, 10)}
          </div>

        </Card.Body>
      </Card>

      {/* ✅ EDIT MODAL */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="text-sm font-semibold">Type</label>
                <select
                  value={type}
                  onChange={handleTransInput('type')}
                  className="border p-2 rounded w-full"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={handleTransInput('amount')}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={handleTransInput('category')}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={handleTransInput('date')}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold">Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={handleTransInput('desc')}
                  className="border p-2 rounded w-full"
                />
              </div>

            </div>

            {errorMessage && (
              <p className="text-red-500 mt-2">{errorMessage}</p>
            )}

            <button className="mt-4 bg-[#000080] text-white px-4 py-2 rounded w-full">
              Save Changes
            </button>

          </form>
        </Modal.Body>
      </Modal>

      {/* ✅ DELETE MODAL */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Transaction</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this transaction?
        </Modal.Body>

        <Modal.Footer>
          <button
            className="bg-gray-400 text-white px-3 py-1 rounded"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>

          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={handleDelete}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default TransactionCard;