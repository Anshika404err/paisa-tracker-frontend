import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar.jsx';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export const Grouphome = ({ user, thememode, toggle }) => {
  const { id } = useParams();
  const [groupData, setgroupData] = useState([]);
  const [show, setShow] = useState(false);
  const [showPart, setShowPart] = useState(false);
  const [membersdata, setmembersdata] = useState([]);
  const [billSplitData, setBillSplitData] = useState([]);
  
  // We wrap getgroup in useCallback so it can be safely used in useEffect dependencies
  const getgroup = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/group/getgroup/${id}`);
      setgroupData(res.data);
      setBillSplitData(res.data.billSplit || []);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const [input, setInput] = useState({
    amount: '',
    groupData,
    user
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowPart = () => setShowPart(true);
  const handleClosePart = () => setShowPart(false);

  const handleInput = (name) => (e) => {
    setInput({ ...input, [name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/group/splitbill`, { input });
      setBillSplitData(res.data.billSplit);
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproved = async (memid) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/group/markapproved/${groupData._id}`, { userId: memid });
      setBillSplitData(res.data.billSplit);
      getgroup();
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch group on mount or when ID changes
  useEffect(() => {
    getgroup();
  }, [getgroup]);

  // Fetch members when groupData._id is available
  useEffect(() => {
    const getMembers = async () => {
      if (!groupData?._id) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/group/getmembers/${groupData._id}`);
        setmembersdata(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    getMembers();
  }, [groupData._id]);

  // Sync input state when groupData updates
  useEffect(() => {
    setInput((prevInput) => ({
      ...prevInput,
      groupData,
    }));
  }, [groupData]);

  return (
    <div className='min-h-screen overflow-x-hidden'>
      <Navbar thememode={thememode} toggle={toggle} />

      <div className='flex flex-col justify-center items-start' style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }}>
        <div className='font-extrabold text-5xl mx-4 mt-4 dark:text-[#f0f0f0]'>Split Bills</div>
        <div className="m-3 pt-3 text-4xl bg-[#f0f0f0] light:text-black font-bold dark:bg-[#181818] dark:text-white p-2">
          Group Title: {groupData?.title}
        </div>

        <div className=" min-h-screen w-[98%] flex-col align-middle justify-center dark:text-white m-3">
          <div className='flex'> 
            <button onClick={handleShowPart} className='bg-[#000080] text-white rounded-lg w-full p-1 m-2'>
              Participants
            </button>
            <button className="bg-[#000080] text-white p-1 rounded-lg m-2 w-full" onClick={handleShow}>Split Bill</button>
          </div>

          <Modal show={show} onHide={handleClose} animation={false} centered>
            <Modal.Header closeButton>
              <Modal.Title>Split Bill</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label htmlFor='amount'>Bill Amount: </label>
              <input 
                type="number"
                name={'amount'}
                value={input.amount}
                onChange={handleInput('amount')}
                className="ml-2 border p-1"
                required
              />
            </Modal.Body>
            <Modal.Footer>
              <button onClick={handleSubmit} className='bg-[#000080] text-white rounded-lg w-full p-1 m-2'>Split Bill</button>
            </Modal.Footer>
          </Modal>

          <Modal show={showPart} onHide={handleClosePart} animation={false} centered>
            <Modal.Header closeButton>
              <Modal.Title>Group Participants</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className='flex flex-col gap-1'>
                {membersdata?.map((data, index) => (
                  <div key={data._id || index}> {data.username} </div>
                ))}
              </div>
            </Modal.Body>
          </Modal>

          {billSplitData.length > 0 && billSplitData[billSplitData.length - 1]?.map((mem) => (
            <div key={mem.userId} className='mx-auto w-[50%] flex justify-around gap-2 items-center'>
              <div><b>Name: </b>{mem.name}</div>
              <div><b>Amount: </b>{mem.amount}</div>
              {(groupData.userId === user?._id) && (
                <button 
                  onClick={() => handleApproved(mem.userId)} 
                  className='bg-[#000080] text-white p-2 m-2 rounded-md'
                >
                  {mem.approved === false ? "Approve" : "Approved"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grouphome;