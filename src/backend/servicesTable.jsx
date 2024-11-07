import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./serviceTable.css";
import { FaSearch, FaTimes, FaCopy, FaPlus, FaEdit, FaClone } from "react-icons/fa";
import ServiceForm from "./serviceForm";
import ServiceTimeForm from "./serviceTime";
import { API_BASE_URL } from "../utiles/apiLink.jsx";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const ServiceTable = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState(null);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const id = localStorage.getItem("userId");
      const response = await axios.get(`${API_BASE_URL}api/get-services/${id}`);
      const serviceData = await response.data;
      setServices(serviceData.services || []);
      setSelectedService(serviceData.services ? serviceData.services[0] : null);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowForm(false);
    setShowTimeForm(false);
    setNewService(null);
  };

  const companyName = localStorage.getItem("companyName");

  const handleViewDetail = (serviceId) => {
    navigate(`/${companyName}/services/${serviceId}`);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
  };

  const handleShowForm = () => {
    setShowForm(true);
    setSelectedService(null);
    setShowTimeForm(false);
  };

  const handleServiceCreation = (service) => {
    setServices((prevServices) => [...prevServices, service]);
    setNewService(service);
    setShowForm(false);
    setShowTimeForm(true);
    setSelectedService(service);
  };

  const handleTimeCreation = (newTime) => {
    setSelectedService((prevSelectedService) => ({
      ...prevSelectedService,
      times: [...(prevSelectedService?.times || []), newTime],
    }));
  };

  const handleCloneService = async (service) => {
    try {
        const id = localStorage.getItem("userId");
        const response = await axios.post(`${API_BASE_URL}api/add-service`, {
            title: service.title,
            description: service.description,
            price: service.price,
            service_days: JSON.stringify(service.days), 
            service_times: JSON.stringify(service.times), 
            image: service.image,
            user_id: id,
        });

        setServices((prevServices) => [...prevServices, response.data]);

        Toast.fire({
            icon: "success",
            title: "Service cloned successfully",
        });
    } catch (error) {
        console.error("Error cloning service:", error);
        Toast.fire({
            icon: "error",
            title: "Failed to clone service",
        });
    }
};

  const copyToClipboard = () => {
    const companyName = localStorage.getItem("companyName");
    const snippet = `
      <web-booking-form name="${companyName}" style="width: 100%;"></web-booking-form>
    <script src="https://myaioreservations.com/static/js/main.ca3d26b5.js"></script>
    `;

    navigator.clipboard
      .writeText(snippet)
      .then(() => {
        Toast.fire({
          icon: "success",
          title: "Snippet copied to clipboard",
        });
      })
      .catch(() => {
        Toast.fire({
          icon: "error",
          title: "Failed to copy snippet",
        });
      });
  };

  const formatTime = (time) => {
    const date = new Date(`1970-01-01T${time}Z`);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handleCopy = () => {
    if (selectedService) {
      copyToClipboard(selectedService);
    }
  };

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="service-wrapper">
      {loading && <div className="topbar-loading"></div>}
      <div className="service-sidebar">
        <div className="serviceSearch">
          <h2>Services</h2>
          <div className="search-bar">
            <div onClick={handleShowForm} className="addNewService">
              <FaPlus className="plus-icon" />
              <span className="tooltip-text">Add New Service</span>
            </div>
            {showSearch ? (
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search services..."
                autoFocus
              />
            ) : (
              <FaSearch onClick={handleSearchToggle} className="search-icon" />
            )}
            {showSearch && (
              <FaTimes onClick={handleSearchToggle} className="search-icon" />
            )}
          </div>
        </div>
        {filteredServices.length > 0 && (
          <ul>
            {filteredServices.map((service, index) => (
              <li
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`service-item ${
                  selectedService && selectedService.id === service.id
                    ? "active"
                    : ""
                }`}
              >
                <div className="sidebarMain">
                  <span>{index + 1}</span>
                  <div className="sideBarText">
                    <h3>{service.title}</h3>
                    <p>${service.price}</p>
                   
                  </div>
                  <button onClick={() => handleCloneService(service)} className="cloneButton">
                    <FaClone  className="clone-icon" />

                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="service-details">
        {showForm && (
          <ServiceForm
            key="service-form"
            onServiceCreated={handleServiceCreation}
          />
        )}
        {showTimeForm && newService && (
          <ServiceTimeForm
            key={`service-time-form-${newService.id}`}
            serviceId={newService.id}
            onTimeCreated={handleTimeCreation}
          />
        )}
        {!showForm && !newService && filteredServices.length === 0 && (
          <div className="no-services">
            <p>No services found</p>
          </div>
        )}
        {!showForm && !newService && selectedService && (
          <div className="innerDetailDiv">
            <div className="service-header">
              <div className="serviceHeaderContent">
                <img
                  src={`${API_BASE_URL}public/${selectedService.image}`}
                  alt={selectedService.title}
                  className="service-detail-icon"
                />
                <div>
                  <h1>{selectedService.title}</h1>
                  <p>${selectedService.price}</p>
                </div>
              </div>
              <div className="service-actions">
                <button className="copyButton" onClick={handleCopy}>
                  <FaCopy className="copy-icon" />
                </button>
                <button
                  className="goToButton"
                  onClick={() => handleViewDetail(selectedService.id)}
                >
                <FaEdit className="edit-icon" />
                </button>
              </div>
            </div>
            <div className="service-info">
              <h2>Details:</h2>
              <p>{selectedService.description}</p>
              <div className="days-list">
                {selectedService.days?.map((day) => {
                  const dayTimes = selectedService.times.filter(
                    (time) => time.day_id === day.id
                  );
                  return (
                    <div key={day.id} className="day-box">
                      <strong>{day.days}:</strong>
                      <ul>
                        {dayTimes.length > 0 ? (
                          dayTimes.map((time) => (
                            <li key={time.id} className="time-box">
                              <p>
                                {formatTime(time.start_time)} -{" "}
                                {formatTime(time.end_time)}
                              </p>
                              <p>Time Gap: {time.time_gap || "N/A"} mints</p>
                              <p>Discount Day: {time.dates || "N/A"}</p>
                              <p>Price: ${time.price || "N/A"}</p>
                              <p>Holiday: {time.holiday || "N/A"}</p>
                            </li>
                          ))
                        ) : (
                          <li>No timings available</li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <div className="priceBox">
                <strong>Price:</strong>
                <ul>
                  <li>${selectedService.price}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceTable;
