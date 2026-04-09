import React, { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar.jsx'
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import GroupCard from '../../components/GroupCard/GroupCard.jsx'
import { Button as Buttonmui } from '@mui/material';
import Menu from '@mui/material/Menu';
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';

export const Main = ({ user, setUser, thememode, toggle, groupData, setgroupData }) => {
  const theme = useTheme()
  const [showGroup, setShowGroup] = useState(false);
  const [showGroupJoin, setShowGroupJoin] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupflag, setgroupflag] = useState(false)
  const [friendName, setFriendName] = useState("")
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [groupInput, setgroupInput] = useState({
    userId: user?._id,
    title: '',
  })

  const [joincode, setjoincode] = useState({
    userId: user?._id,
    JoingCode: ''
  })

  const { title } = groupInput
  const { JoingCode } = joincode

  // modal opening and closing logic
  const handleGroupClose = () => setShowGroup(false);
  const handleGroupShow = () => setShowGroup(true);
  const handleGroupJoinClose = () => setShowGroupJoin(false);
  const handleGroupJoinShow = () => setShowGroupJoin(true);
  const handleAddFriendShow = () => setShowAddFriend(true);
  const handleAddFriendClose = () => setShowAddFriend(false);

  // handling input
  const handleGroupInput = name => e => {
    setgroupInput({ ...groupInput, [name]: e.target.value })
  }
  const handleGroupJoinInput = name => e => {
    setjoincode({ ...joincode, [name]: e.target.value })
  }
  const handleAddFriendInput = (e) => {
    setFriendName(e.target.value)
  }

  // Simple UUID generator
  const generateUuid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSendRequest = async () => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/friend/sendRequest/${user._id}`, { friendName })
      alert(res.data.message)
      setFriendName("")
      handleAddFriendClose()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    let groupCode = generateUuid()
    try {
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/group/creategroup`, { 
        groupInput: { ...groupInput, groupCode: groupCode } 
      })
      const val = res.data.newgroup
      setgroupData(prev => [...prev, val])
      setgroupflag((prev) => !prev)
      handleGroupClose()
      setgroupInput({ userId: user._id, title: '' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleJoin = async () => {
    try {
      setgroupflag((prev) => !prev)
      handleGroupJoinClose()
      setjoincode({ userId: user._id, JoingCode: '' })
    } catch (err) {
      console.error(err.response?.data?.error || err.message)
    }
  }

  // Memoized fetch function to satisfy useEffect dependencies
  const getGroups = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/group/getgroups/${user._id}`)
      setgroupData(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [user?._id, setgroupData])

  useEffect(() => {
    const checkUser = async () => {
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        if (foundUser._id !== user?._id) {
            setUser(foundUser);
        }
      }
    }
    checkUser()
  }, [user?._id, setUser])

  useEffect(() => {
    getGroups()
  }, [getGroups, groupflag])

  return (
    <div style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }} className='min-h-screen overflow-x-hidden'>
      <Navbar thememode={thememode} toggle={toggle} />
      <div className='flex flex-col gap-2 justify-start items-start min-h-screen' style={{ backgroundColor: thememode === "dark" ? "#181818" : "#f0f0f0" }}>
        <div className='flex justify-between w-full'>
          <div>
            <div className='font-extrabold text-2xl mx-4 mt-4 dark:text-[#f0f0f0]'> Groups</div>
            <div className='mx-4 text-gray-600 dark:text-gray-200 '>Invite friends, create groups and streamline bill splitting and debt settlements</div>
          </div>

          <div>
            <Buttonmui
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              sx={{
                backgroundColor: '#000080',
                margin: '2rem',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#00009A',
                },
              }}
              className='dark:bg-slate-200 dark:hover:bg-slate-400 dark:text-blue-400'
            >
              + NEW
            </Buttonmui>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  backgroundColor: thememode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
                  color: thememode === 'dark' ? 'white' : 'black',
                },
              }}
            >
              <MenuItem onClick={() => { handleGroupShow(); handleClose() }}>Create new group</MenuItem>
              <MenuItem onClick={() => { handleGroupJoinShow(); handleClose() }}>Join Group</MenuItem>
              <MenuItem onClick={() => { handleAddFriendShow(); handleClose() }}>Invite a friend</MenuItem>
            </Menu>
          </div>
        </div>

        <div className='flex flex-col lg:grid lg:grid-cols-4 mx-4 justify-evenly items-center gap-6 w-full h-fit dark:bg-[#181818]'>
          {groupData?.map(data => (
              <GroupCard
                key={data._id}
                setgroupData={setgroupData}
                groupData={data}
                allgroupsdata={groupData}
                setSelectedGroup={setSelectedGroup}
                selectedGroup={selectedGroup}
                thememode={thememode}
                toggle={toggle}
                user={user}
                setgroupflag={setgroupflag}
              />
          ))}
        </div>

        {/* MODALS */}
        <Modal show={showGroup} onHide={handleGroupClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label htmlFor='title'>Group Name: </label>
            <input 
              type="text"
              name='title'
              value={title}
              onChange={handleGroupInput('title')}
              className="ml-2 border p-1"
              required
            />
          </Modal.Body>
          <Modal.Footer>
            <button className='bg-[#000080] p-2 rounded-md text-white' onClick={handleSubmit}>Save</button>
          </Modal.Footer>
        </Modal>

        <Modal show={showGroupJoin} onHide={handleGroupJoinClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Join Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label htmlFor='JoingCode'>Group Code: </label>
            <input 
              type="text"
              name='JoingCode'
              value={JoingCode}
              onChange={handleGroupJoinInput('JoingCode')}
              className="ml-2 border p-1"
              required
            />
          </Modal.Body>
          <Modal.Footer>
            <button className="bg-[#000080] p-2 rounded-md text-white" onClick={handleJoin}>Save</button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAddFriend} onHide={handleAddFriendClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Friend</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label htmlFor='friendName'>Enter Username: </label>
            <input 
              type="text"
              name='friendName'
              value={friendName}
              onChange={handleAddFriendInput}
              className="ml-2 border p-1"
              required
            />
          </Modal.Body>
          <Modal.Footer>
            <button className="bg-[#000080] p-2 rounded-md text-white" onClick={handleSendRequest}>Invite</button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}

export default Main;