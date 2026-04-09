import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { auth, provider } from "../firebase.js";
import { signInWithPopup } from "firebase/auth";
import GoogleButton from 'react-google-button';
import './SignUp.css';

function Signup({ user, setUser }) {
  const navigate = useNavigate();

  // 1. State Management
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPass: ""
  });

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Google OAuth Login
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

  // 4. Main Submit Function
  const submitFunction = async (event) => {
    event.preventDefault(); // STOPS REFRESH
    
    // DEBUG LOG: See what is being submitted
    console.log("Submit button clicked. Current data:", formData);

    const { username, email, password, confirmPass } = formData;

    // Validation Logic with Detailed Logging
    const isUsernameValid = username.length >= 5;
    const isPasswordValid = password.length >= 8;
    const isMatch = password === confirmPass;

    if (isUsernameValid && isPasswordValid && isMatch) {
      console.log("VALIDATION PASSED: Sending to backend...");
      
      try {
        const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/signup`, {
          username,
          email,
          password,
        });

        if (res.data) {
          console.log("Signup Response:", res.data);
          setUser(res.data.newUser);
          localStorage.setItem('user', JSON.stringify(res.data.newUser));
          alert("Account created successfully!");
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("AXIOS ERROR:", err);
        if (err.response) {
          console.log("Error Data:", err.response.data);
          alert(`Error: ${err.response.data.message || "User already exists or invalid data."}`);
        } else {
          alert("Server error. Check your Internet or if Backend is down.");
        }
      }
    } else {
      // THE NEW DEBUGGING ELSE BLOCK
      console.log("VALIDATION FAILED", {
        usernameLength: username.length,
        passwordLength: password.length,
        passwordsMatch: isMatch
      });

      if (!isMatch) {
        alert("Passwords do not match!");
      } else if (!isUsernameValid) {
        alert("Username must be at least 5 characters long.");
      } else if (!isPasswordValid) {
        alert("Password must be at least 8 characters long.");
      }
    }
  };

  return (
    <div className="super-container">
      <div className="container-signup">
        <div className="title">Sign Up</div>

        <form className="content" onSubmit={submitFunction}>
          <div className="user-details">
            <div className="input-box">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                placeholder="Min 5 characters"
                onChange={handleChange}
                className="input-signup"
                required
              />
            </div>

            <div className="input-box">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter your email"
                onChange={handleChange}
                className="input-signup"
                required
              />
            </div>

            <div className="input-box">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Min 8 characters"
                onChange={handleChange}
                className="input-signup"
                required
              />
            </div>

            <div className="input-box">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPass"
                value={formData.confirmPass}
                placeholder="Confirm your password"
                onChange={handleChange}
                className="input-signup"
                required
              />
            </div>
          </div>

          <div className="btn-signup">
            <button type="submit" className="button">
              Submit
            </button>
            <GoogleButton onClick={googlelogin} />
          </div>

          <div className="forgotPass">
            <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;