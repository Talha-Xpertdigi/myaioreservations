import React from "react";
import { Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "./adminHeader.css";
import Swal from "sweetalert2";
import Logo from "../../assets/logo.svg";

function AdminHeader({ isAuthenticated, handleLogout }) {
  const username = localStorage.getItem("userName") || "User";
  const userId = localStorage.getItem("userId");
  const companyName = localStorage.getItem("companyName");

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      localStorage.clear();
      handleLogout();

      Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: "success",
      }).fire({
        title: "You have been logged out successfully.",
      });
    }
  };

  return (
    <header className="adminHeader">
      <Navbar expand="lg" variant="light" className="sticky-top">
        <div className="mainHeaderNav">
          <h2>
            <Link to={`/${companyName}/dashboard`}>
              <img src={Logo} alt="Logo" />
              Bookings
            </Link>
          </h2>
          
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="adminHeaderNav">
              <div className="headerNavLogo">
                <ul className="headerUl">
                  <li>
                    <Link to={`/${companyName}/dashboard`}>Add New Service</Link>
                  </li>
                  <li>
                    <Link to={`/${companyName}/services`}>Services</Link>
                  </li>
                  <li>
                    <Link to={`/${companyName}/appointments`}>Appointments</Link>
                  </li>
                </ul>
              </div>
            
            </Nav>
          </Navbar.Collapse>
          <div className="d-flex">
         

          {isAuthenticated && (
                <NavDropdown title={username} id="collasible-nav-dropdown">
                  <NavDropdown.Item as={Link} to={`/${companyName}/profile/${userId}`}>
                    View Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleSignOut}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}
               <Navbar.Toggle aria-controls="responsive-navbar-nav">
            <FontAwesomeIcon icon={faBars} />
          </Navbar.Toggle>
              </div>
        </div>
      </Navbar>
    </header>
  );
}

export default AdminHeader;
