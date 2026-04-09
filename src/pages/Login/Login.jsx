import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { auth, provider } from "../firebase.js";
import { signInWithPopup } from "firebase/auth";
import GoogleButton from 'react-google-button';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [, setAllEntry] = useState([]);

  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);

  const submitFunction = async (event) => {
    event.preventDefault();
    setAllEntry((prev) => [...prev, { username, password, email }]);
    try {
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/signin`, {
        username, email, password
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
    setEmail(""); setPassword(""); setUsername("");
  };

  const googlesekar = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/google`, {
          username: result.user.displayName,
          email: result.user.email,
          image: result.user.photoURL,
        }).then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          navigate("/dashboard");
        });
      })
      .catch((err) => console.error(err));
  };

  return (
    <form onSubmit={submitFunction}>
      <div className="super-container">
        <div className="container-login">

          {/* Brand Header */}
          <div className="brand-header">
            <div className="brand-icon">💰</div>
            <div className="title-login">Paisa Vasooli</div>
            <p className="brand-subtitle">Sign in to your account</p>
          </div>

          {/* Fields */}
          <div className="user-details">
            <div className="input-box">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                className="input-login"
                required
              />
            </div>
            <div className="input-box">
              <label>Email</label>
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
              <label>Password</label>
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

          {/* Buttons */}
          <div className="btn-login">
            <button type="submit" className="button">Login</button>
            <div className="divider"><span>or continue with</span></div>
            <div className="google-btn-wrapper">
              <GoogleButton onClick={googlesekar} />
            </div>
          </div>

          <div className="forgotPass">
            <span>Don't have an account?</span>
            <Link to="/signup">Sign up</Link>
          </div>

        </div>
      </div>
    </form>
  );
}

export default Login;
