import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { auth, provider } from "../firebase.js";
import { signInWithPopup } from "firebase/auth";
import GoogleButton from 'react-google-button';
import './SignUp.css';

function Signup({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPass: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const googlelogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/google`, {
        username: result.user.displayName,
        email: result.user.email,
        img: result.user.photoURL,
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("Google Sign-in failed");
    }
  };

  const submitFunction = async (event) => {
  event.preventDefault();
  const { username, email, password, confirmPass } = formData;

  if (username.length < 5) return alert("Username must be at least 5 characters.");
  if (password.length < 8) return alert("Password must be at least 8 characters.");
  if (password !== confirmPass) return alert("Passwords do not match!");

  try {
    const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/signup`, {
      username, email, password
    });

    // Handle both response shapes: res.data.newUser OR res.data directly
    const userData = res.data.newUser || res.data;

    if (userData && userData._id) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      alert("Account created successfully!");
      navigate('/dashboard');
    } else {
      alert("Signup failed. Please try again.");
    }
  } catch (err) {
    console.error("AXIOS ERROR:", err);
    alert(err.response?.data?.message || "User already exists or invalid data.");
  }
};

  return (
    <div className="super-container">
      <div className="container-signup">

        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-icon">💰</div>
          <div className="title">Create Account</div>
          <p className="brand-subtitle">Join Paisa Vasooli today</p>
        </div>

        <form className="content" onSubmit={submitFunction}>
          <div className="user-details">
            <div className="input-box">
              <label>Username</label>
              <input
                type="text" name="username" value={formData.username}
                placeholder="Min 5 characters" onChange={handleChange}
                className="input-signup" required
              />
            </div>
            <div className="input-box">
              <label>Email</label>
              <input
                type="email" name="email" value={formData.email}
                placeholder="Enter your email" onChange={handleChange}
                className="input-signup" required
              />
            </div>
            <div className="input-box">
              <label>Password</label>
              <input
                type="password" name="password" value={formData.password}
                placeholder="Min 8 characters" onChange={handleChange}
                className="input-signup" required
              />
            </div>
            <div className="input-box">
              <label>Confirm Password</label>
              <input
                type="password" name="confirmPass" value={formData.confirmPass}
                placeholder="Confirm your password" onChange={handleChange}
                className="input-signup" required
              />
            </div>
          </div>

          <div className="btn-signup">
            <button type="submit" className="button">Create Account</button>
            <div className="divider"><span>or continue with</span></div>
            <div className="google-btn-wrapper">
              <GoogleButton onClick={googlelogin} />
            </div>
          </div>

          <div className="forgotPass">
            <span>Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Signup;
