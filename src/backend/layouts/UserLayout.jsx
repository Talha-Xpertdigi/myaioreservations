import React from 'react';
// import Header from '../../components/frontend/header.jsx';
//  import UserSideBar from '../../components/frontend/layouts/userSideBar.jsx';

import { Outlet } from 'react-router-dom';

const UserLayout = ({ isAuthenticated, isAdmin }) => (
  <div className='userLayout'>
    {/* <Header isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout} /> */}
    {/* <UserSideBar isAuthenticated={isAuthenticated} isAdmin={isAdmin} /> */}
    <main>
      <Outlet />
    </main>
  </div>
);

export default UserLayout;
