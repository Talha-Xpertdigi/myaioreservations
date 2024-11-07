import React, { useEffect, useState, useCallback } from "react";
import "./appointment.css";
import CalnderIcon from "../assets/calendarIcon.svg";
import RevenueIcon from "../assets/revenue.png";
import { API_BASE_URL } from "../utiles/apiLink.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock } from "@fortawesome/free-solid-svg-icons";

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [sortBy, setSortBy] = useState("created_at");

  const fetchAppointments = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}api/get-appointments/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data);
      setFilteredAppointments(data);
      setTotalAppointments(data.length);
      updateTotalRevenue(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      fetchAppointments(id);
    } else {
      console.error("User ID not found in localStorage");
    }
  }, [fetchAppointments]);

  useEffect(() => {
    let filtered = appointments.filter(
      (appointment) =>
        appointment.service_name.toLowerCase().includes(search.toLowerCase()) ||
        appointment.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered = filtered.sort((a, b) => {
      if (sortBy === "service_name") {
        return a.service_name.localeCompare(b.service_name);
      } else if (sortBy === "customer_name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        return a.service_price - b.service_price;
      } else if (sortBy === "email") {
        return a.email.localeCompare(b.email);
      } else if (sortBy === "date") {
        return new Date(b.selected_date) - new Date(a.selected_date);
      } else if (sortBy === "created_at") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

    setFilteredAppointments(filtered);
    setTotalAppointments(filtered.length);
    updateTotalRevenue(filtered);
  }, [search, appointments, sortBy]);
  

  const updateTotalRevenue = (appointmentsList) => {
    const total = appointmentsList.reduce(
      (acc, appointment) => acc + parseFloat(appointment.service_price || 0),
      0
    );
    setTotalRevenue(total.toFixed(2));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

  const totalPages = Math.ceil(totalAppointments / itemsPerPage);

  return (
    <div className="wrapper appointmentsWrapper">
      <div className="appointment-grid">
        <div className="header">
          <h1>Appointments</h1>

          <div className="filters">
            <input
              type="text"
              placeholder="Search by service or customer name"
              className="tableSearch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sortSelect"
            >
              <option value="created_at">Recent Appointments</option>
              <option value="date">Sort by Date</option>
              <option value="service_name">Sort by Service Name</option>
              <option value="customer_name">Sort by Customer Name</option>
              <option value="price">Sort by Price</option>
              <option value="email">Sort by Email</option>
            </select>
          </div>
        </div>
        <div className="grid-container">
          {filteredAppointments.length === 0 ? (
            <div className="noAppointments">
              <p>No appointments available</p>
            </div>
          ) : (
            paginatedAppointments.map((appointment, index) => (
              <div key={appointment.id} className="grid-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="grid-header">
                  <h2 className="grid-icon">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {new Date(appointment.selected_date).toLocaleDateString()}
                  </h2>
                  <p>${appointment.service_price}</p>
                  {/* <select className="selectStatus" disabled>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Complete">Complete</option>
                  </select> */}
                </div>
                <div className="grid-content">
                  <div className="grid-icon">
                    <FontAwesomeIcon icon={faClock} />
                    {appointment.selected_time_slot}
                  </div>
                  <div>Service: {appointment.service_name}</div>
                  <div className="grid-info gridLast">
                    <div>
                      <p>Customer: {appointment.name}</p>
                      <p>Email: {appointment.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="appointmentsFooter">
          <h4 className="totalAppointments">
            <div>
              <img src={CalnderIcon} alt="" />
              Total Appointments: <span>{totalAppointments}</span>
            </div>
            <div>
              <img src={RevenueIcon} alt="" />
              Total Revenue: <span>${totalRevenue}</span>
            </div>
          </h4>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;
