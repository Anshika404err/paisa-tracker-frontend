import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { auth, provider } from "../firebase.js";
import { signInWithPopup } from "firebase/auth";
import GoogleButton from 'react-google-button';

function Login({ setUser }) { // Removed unused 'user' prop
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  
  // State for tracking form history (optional, but fixed logic)
  const [, setAllEntry] = useState([]);

  // Removed unused: isPasswordValid, isUsernameValid, validEmail, setValidemail, emailValidation

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Fixed handleEmail logic (added setEmail)
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const submitFunction = async (event) => {
    event.preventDefault();
    
    // Fixed state update: use functional update for arrays
    const newEntry = { username, password, email };
    setAllEntry((prev) => [...prev, newEntry]);

    try {
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/signin`, { 
        username, 
        email, 
        password 
      });
      
      console.log("response data:", res.data);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }

    // Reset fields
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const googlesekar = () => { // Removed unused req, res params
    signInWithPopup(auth, provider)
      .then((result) => {
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/google`, {
          username: result.user.displayName,
          email: result.user.email,
          image: result.user.photoURL,
        })
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          navigate("/dashboard");
        });
      })
      .catch((err) => { console.error(err); });
  };

  return (
    <>
      <form onSubmit={submitFunction}>
        <div className="super-container">
          <div className="container-login">
            <div className="title-login">Login</div>
            <div className="content">
              <div className="user-details">
                <div className="input-box">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={handleUsernameChange}
                    className="input-login"
                    required
                  />
                </div>
                {/* Optional Email Input if needed for manual login */}
                <div className="input-box">
                   <label htmlFor="email">Email</label>
                   <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    className="input-login"
                    required
                  />
                </div>
                <div className="input-box">
                  <label htmlFor="psw">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="input-login"
                    required
                  />
                </div>
              </div>

              <div className="btn-login flex justify-between items-center">
                <button type="submit" className="button">
                  Login
                </button>
                <GoogleButton onClick={googlesekar} />
              </div>
              
              <div className="forgotPass">
                <div>Not having any account? </div>
                <div> 
                  <Link to="/signup">Sign up</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default Login;