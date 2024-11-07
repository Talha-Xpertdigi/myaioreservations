import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./loginForm.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";
import Swal from "sweetalert2";
import Logo from "../../assets/logo.svg"

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

function Login({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const responseData = await response.json();
        setError(responseData.error || "Invalid email or password.");
        return;
      }

      const responseData = await response.json();
      localStorage.setItem("userEmail", responseData.email);
      localStorage.setItem("userName", responseData.name);
      localStorage.setItem("userId", responseData.user_id);
      localStorage.setItem("companyName", responseData.company_name);

      onSignIn(responseData.token, responseData.role);
      setEmail("");
      setPassword("");
      setError("");
      Toast.fire({
        icon: "success",
        title: "Signed in successfully",
      });

      navigate(`/${responseData.company_name}/services`);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="mainLogin">
      <div className="loginLeft">
        <div className="loginLogo">
          <img src={Logo} alt="" />
          <h2>Bookings</h2>
        </div>
        <h2 className="signUpLink">
          Looking to sign up?
          <Link to="/adminSignup"> Sign Up </Link>
        </h2>
      </div>
      <div className="login-container">
        <div className="loginCotent">
          <h2>Welcome to Bookings! 👋</h2>
          <p>Please sign in to start your adventure</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
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
            <button type="submit">Sign In</button>
            <p className="signUpLink rightLink">
              Looking to sign up?
              <Link to="/adminSignup"> Sign Up </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
