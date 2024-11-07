import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UserLayout from './backend/layouts/UserLayout';
import AdminLayout from './backend/layouts/AdminLayout';
import HomeContent from './components/frontend/homeContent';
import UserServices from './components/frontend/userServices';
import ServiceSelection from './components/frontend/services';
import UserForm from './components/frontend/datePicker';
import Login from './components/frontend/loginForm';
import Signup from './components/frontend/signupForm';
import Home from './frontend/home';
import UserProfile from './frontend/userProfile';
import AdminSignup from './frontend/adminSignup';
import UserDashboard from './backend/userDashboard';
import AdminDashboard from './backend/adminDashboard';
import ServiceTime from './backend/serviceTime';
import AdminProfile from './components/frontend/adminProfile';
import Confirmation from './components/frontend/confirmation';
import ServiceTable from './backend/servicesTable'; 
import ServiceDetail from './backend/serviceDetail';
import AppointmentTable from './backend/appointment';
import CompanyPage from './components/frontend/companyPage.jsx';
import PageNotFound from './frontend/pageNoFound.jsx'
import ReactDOM from 'react-dom';
import r2wc from 'react-to-webcomponent';


const WebBookingForm = r2wc(HomeContent, React, ReactDOM, {
  props: {
    name: "string",
  },
});
customElements.define('web-booking-form', WebBookingForm);

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const companyName = localStorage.getItem('companyName');
    console.log(companyName)

    if (token && role) {
      setIsAuthenticated(true);
      setUser({ token });
      setAdmin({ token });
      setIsAdmin(role === 'admin');
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setIsAuthenticated(true);
    setUser({ token });
    setIsAdmin(role === 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route element={<UserLayout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout} />}>
            {/* Route that requires companyName */}
            <Route path="/:companyName" element={<Home />} />
            <Route path="/userServices" element={<UserServices /> } />
            <Route path="/homeContent" element={<HomeContent /> } />
            <Route path="/serviceSelection" element={<ServiceSelection />} />
            <Route path="/userForm" element={<UserForm />} />
            <Route path="/login" element={<Login onSignIn={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/404" element={<PageNotFound />} />
            <Route path="/adminSignup" element={<AdminSignup />} />
            <Route path="/page/:companyName" element={<CompanyPage />} />
            <Route path="/confirmation" element={<Confirmation />} />
            {/* User Routes */}
            <Route path="/dashboard" element={isAuthenticated && !isAdmin ? <UserDashboard /> : <Navigate to="/login" />} />
            <Route path="/userProfile" element={isAuthenticated && !isAdmin ? <UserProfile user={user} /> : <Navigate to="/login" />} />
          </Route>

          {/* Admin Routes */}
          <Route path=":isCompanyName" element={<AdminLayout isAuthenticated={isAuthenticated} handleLogout={handleLogout} />}>
            <Route path="dashboard" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="services" element={isAuthenticated && isAdmin ? <ServiceTable /> : <Navigate to="/login" />} />
            <Route path="appointments" element={isAuthenticated && isAdmin ? <AppointmentTable /> : <Navigate to="/login" />} />
            <Route path="services/:serviceId" element={isAuthenticated && isAdmin ? <ServiceDetail /> : <Navigate to="/login" />} />
            <Route path="service-time/:serviceId" element={isAuthenticated && isAdmin ? <ServiceTime /> : <Navigate to="/login" />} />
            <Route path="profile/:userId" element={isAuthenticated && isAdmin ? <AdminProfile user={admin} /> : <Navigate to="/login" />} />
          </Route>

          {/* Fallback route to handle missing company name */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;