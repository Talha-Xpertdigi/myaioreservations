import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./loginForm.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";  
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1000,
  timerProgressBar: true,
});

const SignupForm = ({ onSignup }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const data = {
      name: username,
      email: email,
      password: password,
    };

    try {
      const response = await fetch(`${API_BASE_URL}api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);

        Toast.fire({
          icon: "success",
          title: "Signed up successfully"
        }).then(() => {
          if (typeof onSignup === 'function') {
            onSignup(username);
          } else {
            console.error('onSignup is not a function');
          }
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setError("");
          navigate("/login");
        });
      } else {
        const responseData = await response.json();
        console.log(responseData);

        if (responseData && responseData.error) {
          setError(responseData.error);
        } else {
          setError("Signup failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError('Signup failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(
      (prevShowConfirmPassword) => !prevShowConfirmPassword
    );
  };

  return (
    <div className="login-container">
      <h2>User Registration</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button type="submit">Sign Up</button>
        <p className="signUpLink">
          If you are Admin then <Link to="/adminSignup">Sign Up as Admin</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
