import React from "react";
import "./header.css";
import { Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
// import Image from "../../assets/col_img.jpg"

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

function Header({ isAuthenticated, isAdmin, handleLogout }) {
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
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("companyName");
      handleLogout();
      Toast.fire({
        icon: "success",
        title: "Logged out successfully",
      });
    }
  };

  return (
    <header className="mainHeader container-fluid">
      <Navbar expand="lg" variant="light" className="sticky-top">
        <div className="container-fluid">
          <Navbar.Brand as={Link} to="/">
            Logo
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav">
            <FontAwesomeIcon icon={faBars} />
          </Navbar.Toggle>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ml-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              {isAuthenticated ? (
                isAdmin ? (
                  <>
                    <Nav.Link as={Link} to="/adminDashboard">
                      Admin Dashboard
                    </Nav.Link>
                    <NavDropdown title="Profile" id="collasible-nav-dropdown">
                      <NavDropdown.Item as={Link} to="/adminProfile">
                        View Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={handleSignOut}>
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  </>
                ) : (
                  <>
                    {/* <Nav.Link as={Link} to="/dashboard">User Dashboard</Nav.Link> */}
                    <NavDropdown title="Profile" id="collasible-nav-dropdown">
                      <NavDropdown.Item as={Link} to="/profile">
                        View Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={handleSignOut}>
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  </>
                )
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    Sign In
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
              {/* <img src={Image} alt="" /> */}
    </header>
  );
}

export default Header;
