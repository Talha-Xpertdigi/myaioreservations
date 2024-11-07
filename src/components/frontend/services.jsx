import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";  
import "./homeContent.css";

const MAX_DESCRIPTION_LENGTH = 190;

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const ServiceSelection = ({ services, onServiceToggle }) => {
  const [selectedServices, setSelectedServices] = useState(() => {
    const storedServices = localStorage.getItem("selectedServices");
    return storedServices ? JSON.parse(storedServices) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleServiceToggle = (serviceId) => {
    let updatedSelectedServices;
    const isSelected = selectedServices.includes(serviceId);

    if (isSelected) {
      updatedSelectedServices = selectedServices.filter(id => id !== serviceId);
    } else {
      updatedSelectedServices = [...selectedServices, serviceId];
    }
    setSelectedServices(updatedSelectedServices);
    localStorage.setItem("selectedServices", JSON.stringify(updatedSelectedServices));
    onServiceToggle(serviceId);
  };

  const handleTitleClick = (service) => {
    Swal.fire({
      title: service.title,
      text: service.description,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  return (
    <div className="service-selection">
      {loading && <div className="topbar-loading"></div>}
      <h1 className="stepsHeading">Welcome!</h1>
      <p>
        Book your appointment in a few simple steps: Choose a service, pick your date and time, and fill in your details. See you soon!
      </p>
      <div className="service-cards">
        {services.length > 0 ? (
          services.map((service, index) => (
            <div
            key={service.id}
            className={`service-card ${
              selectedServices.includes(service.id) ? "selected" : ""
            } service-card-enter`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
              <div className="service-content" onClick={() => handleServiceToggle(service.id)}>
                <div className="service-image-container">
                  {service.image ? (
                    <img
                      className="service-card-image"
                      src={`${API_BASE_URL}public/${service.image}`}
                      alt={service.title}
                      onClick={() => handleTitleClick(service)}
                    />
                  ) : (
                    <div className="service-image-placeholder">
                      {service.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="service-card-info">
                  <div className="service-card-header">
                    <div className="d-flex align-items-center">
                    <h3 className="service-title">{service.title}</h3>
                    {selectedServices.includes(service.id) && (
                      <span className="selected-icon">✔️</span>
                    )}
                    </div>
                   <p className="service-duration">${service.price}</p>

                  </div>
                  <div className="service-card-detail">
                    <p className="service-description">
                      {truncateText(service.description, MAX_DESCRIPTION_LENGTH)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No services available</p>
        )}
      </div>
    </div>
  );
};

export default ServiceSelection;
