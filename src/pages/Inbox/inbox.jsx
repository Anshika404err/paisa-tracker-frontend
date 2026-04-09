import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar'
import axios from "axios"
import MailIcon from '@mui/icons-material/Mail';

const Inbox = ({ user, setUser, thememode, toggle }) => {
  const [inboxuser, setinboxuser] = useState({});

  // Use useCallback to prevent the function from being recreated on every render
  const syncUserFromStorage = useCallback(() => {
    try {
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        setinboxuser(foundUser);
        
        // Only update parent state if it's different to avoid loops
        if (JSON.stringify(foundUser) !== JSON.stringify(user)) {
          setUser(foundUser);
        }
      }
    } catch (err) {
      console.error("Error parsing user from storage:", err);
    }
  }, [user, setUser]);

  useEffect(() => {
    syncUserFromStorage();
    // Dependency array is now stable
  }, [syncUserFromStorage]);

  // Function to accept friend request
  const handleAccept = async (key) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/friend/acceptRequest/${user._id}`, { 
        friendName: key 
      });
      
      alert(res.data.message);
      const updatedUser = res.data.res1;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setinboxuser(updatedUser);
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  return (
    <div className='dark:bg-[#181818] bg-[#f0f0f0] min-h-screen'>
      <Navbar thememode={thememode} toggle={toggle} />
      <div className='font-extrabold text-2xl mx-4 mt-4 dark:text-[#f0f0f0]'>
        Inbox <MailIcon />
      </div>

      <div className='pb-10'>
        {inboxuser.inbox?.toReversed().map((msg, index) => {
          const tokens = msg.split(' ');
          let i = 0;
          let key = "";
          
          while (i < tokens.length) {
            if (tokens[i] === "sent") break;
            key += tokens[i] + " ";
            i++;
          }
          key = key.trim();

          const isFriend = inboxuser.friends?.includes(key);

          return (
            <div key={`${key}-${index}`}>
              {msg.includes('sent') ? (
                <div className='m-4 bg-gray-200 p-2 rounded-md flex justify-between items-center dark:bg-[#6f00c9] dark:text-white shadow-sm'>
                  <div className='m-3 font-medium'>{msg}</div>
                  <button 
                    className='p-2 px-4 m-2 rounded-md text-white transition-colors' 
                    style={{ backgroundColor: isFriend ? "#2e7d32" : "#000080" }} 
                    onClick={() => !isFriend && handleAccept(key)}
                    disabled={isFriend}
                  >
                    {isFriend ? "Accepted" : "Accept"}
                  </button>
                </div>
              ) : (
                <div className='m-4 bg-gray-200 p-3 rounded-md dark:bg-[#282828] dark:text-white border-l-4 border-blue-800 shadow-sm'>
                  {msg}
                </div>
              )}
            </div>
          );
        })}
        {(!inboxuser.inbox || inboxuser.inbox.length === 0) && (
          <div className='m-10 text-center text-gray-500 italic'>
            Your inbox is empty.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;