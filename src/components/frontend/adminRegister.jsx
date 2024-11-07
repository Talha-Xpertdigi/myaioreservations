import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";
import "./adminRegister.css";
import Logo from "../../assets/logo.svg"


const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 500,
  timerProgressBar: true,
});

const AdminRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
  })
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}api/adminregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network response was not ok");
      }

      Toast.fire({
        icon: "success",
        title: "Admin registered successfully.",
      }).then(() => {
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          company_name: "",
        });
        setError(null);
        navigate("/login");
      });
    } catch (error) {
      console.error("Error during admin registration:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="mainSignup">
      <div className="signupLeft">
        <div className="loginLogo">
          <img src={Logo} alt="" />
          <h2>Bookings</h2>
        </div>
        <h2 className="signUpLink">
          Got an account?
          <Link to="/login"> Login </Link>
        </h2>
      </div>
      <div className="form-container">
        <div className="signupContent">
          <h2>Admin Registration</h2>
          <p>Please sign up to start your adventure</p>
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            <div className="flexField">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="companyName">Company Name:</label>{" "}
              {/* Added Company Name field */}
              <input
                type="text"
                id="companyName"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-btn"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="password-toggle-btn"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Register
            </button>
            <p className="signUpLink rightLink">
              Got an account?
              <Link to="/login"> Login </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterForm;
