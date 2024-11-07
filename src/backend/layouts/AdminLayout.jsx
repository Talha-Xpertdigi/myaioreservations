import React from 'react';
import AdminHeader from './AdminHeader.jsx';
// import AdminSidebar from './sidebar.jsx'; 
import { Outlet } from 'react-router-dom';

const AdminLayout = ({ isAuthenticated, handleLogout }) => (
  <div>
    <AdminHeader isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
    <div className="adminContent">
      <main>
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;