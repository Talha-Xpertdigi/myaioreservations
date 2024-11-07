import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTable, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css';

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div><h2><Link to="/">Logo</Link></h2></div>
      <ul>
        <li>
          <Link to="/adminDashboard">
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/service-table">
            <FontAwesomeIcon icon={faTable} /> Service Table
          </Link>
        </li>
        <li>
          <Link to="/appointment-table">
            <FontAwesomeIcon icon={faCalendarAlt} /> Appointment Table
          </Link>
        </li>
        {/* Add more links for admin-specific pages */}
      </ul>
    </div>
  );
};

export default AdminSidebar;
