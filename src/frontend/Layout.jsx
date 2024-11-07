import React from 'react'
import Header from '../components/frontend/header';
import { Outlet } from 'react-router-dom';


const Layout = () => {
  return (
    <div>
        <Header />
        <Outlet />
    </div>
  )
}

export default Layout;