import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';

const BillCard = ({ billflag, setbillflag, user, BillData, thememode }) => {

  const [show, setShow] = useState(false);
  const [BillInput, setBillInput] = useState({
    userId: user._id,
    title: '',
    dueDate: '',
    amount: '',
    toWhom: '',
    recurring: '',
  });

  const { title, amount, toWhom, dueDate } = BillInput;

  {/*-----------------function to handle the bill's input8--------*/ }
  const handleBillInput = (name) => (e) => {
    setBillInput({ ...BillInput, [name]: e.target.value });
  };

  // -------------- handling the closing and opening of edit ------------- 
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setBillInput({
      userId: user._id,
      title: BillData.title,
      dueDate: BillData.dueDate ? BillData.dueDate.substring(0, 10) : '',
      amount: BillData.amount,
      toWhom: BillData.toWhom || '', // Handle potential missing field
      recurring: BillData.recurring || '', // Handle potential missing field
    });
    setShow(true);
  };

  // --------------funtion to handle the submitting the edit data --------------------- 
  const handleSubmit = (e) => {
    e.preventDefault();
    const editBill = async () => {
      try {
        const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/bills/editBill/${BillData._id}`, { BillInput });
        console.log(res.data);
        setBillInput({
          userId: user._id,
          title: '',
          dueDate: '',
          amount: '',
          toWhom: '',
          recurring: '',
        });
        setbillflag((prev) => !(prev))
        handleClose();
      } catch (err) {
        console.log(err);
      }
    };
    editBill();
  };

  // ----------------  handling the delete function -------------------- 
  const handleDelete = (id) => {
    const delBill = async (id) => {
      try {
        const res = await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/bills/deleteBill/${id}`);
        console.log(res.data);
        setbillflag((prev) => !(prev))
      } catch (err) {
        console.log(err);
      }
    };
    delBill(id);
  };

  //function to track past due payments
  const paymentTime = () => {
    let duedate = new Date(BillData.dueDate)
    let currDate = new Date();

    return currDate > duedate;
  };

  return (
    <>
      <tr>
        <td>{BillData.title}</td>
        <td>&#8377; {BillData.amount}</td>
        <td>{BillData.dueDate?.substring(0, 10)}</td>
        <td>
          <div className='flex justify-end w-[80%] gap-4 mr-6'>
            <AiFillEdit onClick={handleShow} style={{ cursor: 'pointer' }} />
            <AiFillDelete onClick={() => handleDelete(BillData._id)} style={{ cursor: 'pointer' }} />
          </div>
        </td>
      </tr>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={title}
                  onChange={handleBillInput('title')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={amount}
                  onChange={handleBillInput('amount')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={dueDate}
                  onChange={handleBillInput('dueDate')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Whom</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={toWhom}
                  onChange={handleBillInput('toWhom')}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BillCard;
