import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./confirmation.css";

const Confirmation = ({ onPrevStep, onNextStep, onAddMore }) => {
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    const fetchSelectedServices = () => {
      const serviceKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("service_")
      );
      const services = serviceKeys
        .map((key) => JSON.parse(localStorage.getItem(key)))
        .filter(
          (service) =>
            service &&
            service.serviceId &&
            service.serviceName &&
            service.selectedDate
        );
      setSelectedServices(services);
    };

    fetchSelectedServices();
  }, []);

  const handleRemoveData = (serviceId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(`service_${serviceId}`);
        setSelectedServices((prevServices) =>
          prevServices.filter((service) => service.serviceId !== serviceId)
        );
        const serviceKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith("service_")
        );
        serviceKeys.forEach((key) => localStorage.removeItem(key));
        localStorage.removeItem("selectedServices");

        Swal.fire({
          icon: "success",
          title: "Data Removed",
          text: "Now please select new service",
        });
      }
    });
  };

  const handleNext = () => {
    onNextStep();
  };


  

  return (
    <>
      <style>
        {`
      .successMessage p {
  color: green;
  font-size: 20px;
  width: 100%;
  max-width: 800px;
  margin: 15px auto;
}

.confirmation button {
  padding: 10px 30px;
}

.confirmation .stepsHeading {
  margin-bottom: 22px;
}

.selectedServices {
  border: 1px solid #ffffff50;
  padding: 20px;
}

.confirmationTable {
  width: 100%;
  border-collapse: collapse;
  /* Ensures borders are collapsed */
  border: 1px solid #ddd;
  /* Optional: Overall table border */
}

.tableHeader,
.tableData {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
  /* Border for each row */
}

.tableHeader {
  background: transparent;
  /* Optional: Header row background color */
}

.tableData {
  background: transparent;
  /* Optional: Data row background color */
}

.confirmBtns {
  display: flex;
  gap: 20px;
}

.stepsHeading {
  font-size: 1.5em;
  margin-bottom: 20px;
}

.servicesContainer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.serviceCard {
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px;
  background-color: #fff;
  color: #000;
}

.serviceHeader h3 {
  font-size: 25px;
  margin-bottom: 20px;
  margin-top: 5px;
}

.serviceBody p {
  margin: 5px 0;
}

.serviceFooter {
  margin-top: 10px;
  text-align: right;
}

/* .btn-danger {
 border-radius: 100px;
} */

.btn-primary {
  background-color: #50497F !important;
  border-color: #50497F !important;
  color: #fff !important;
  border: none !important;
  border-radius: 7px !important;
}

.btn-primary:hover {
  color: #fff !important;
  background-color: #3f3963 !important;
  border-color: #3f3963 !important;
}

.btn-primary:focus {
  color: #fff !important;
  background-color: #3f3963 !important;
  border-color: #3f3963 !important;
  box-shadow: 0 0 0 .2rem #615797 !important;
}

.btn-primary:not(:disabled):not(.disabled).active,
.btn-primary:not(:disabled):not(.disabled):active,
.show>.btn-primary.dropdown-toggle {
  color: #fff !important;
  background-color: #3f3963 !important;
  border-color: #3f3963 !important;
}

.btn-primary:not(:disabled):not(.disabled).active:focus,
.btn-primary:not(:disabled):not(.disabled):active:focus,
.show>.btn-primary.dropdown-toggle:focus {
  box-shadow: 0 0 0 .2rem #615797 !important;
}
.confirmBtns {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.buttonDiv {
  display: flex;
  gap: 10px;
}

button.btn.btn-danger {
    border: none !important;
    background: #d93c3c !important;
    color: #fff !important;
    border-radius: 6px !important;
}

button.btn.btn-secondary {
    background: #858585;
    border: none;
    color: #fff;
    border-radius: 6px;
}

button{
  cursor: pointer;
}

@media screen and (max-width: 576px) {
  .confirmation button {
    padding: 8px 26px;
  }
}
      `}
      </style>
      <div className="confirmation">
        <h2 className="stepsHeading">Confirmation</h2>
        {selectedServices.length > 0 ? (
          <div className="servicesContainer">
            {selectedServices.map((service) => (
              <div key={service.serviceId} className="serviceCard">
                <div className="serviceHeader">
                  <h3>{service.serviceName}:</h3>
                </div>
                <div className="serviceBody">
                  <p>
                    <strong>Price:</strong>{" "}
                    {service.discountPrice ? (
                      <>
                        <span className="discountPrice">
                          ${service.discountPrice}
                        </span>
                      </>
                    ) : (
                      `$${service.servicePrice}`
                    )}
                  </p>
                  <p>
                    <strong>Date Selected:</strong> {service.selectedDate}
                  </p>
                  <p>
                    <strong>Time Slot Selected:</strong> {service.selectedTime}
                  </p>
                </div>
                <div className="serviceFooter">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemoveData(service.serviceId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No services selected.</p>
        )}
        <div className="confirmBtns">
          <div className="buttonDiv">
            <button
              type="button"
              onClick={onPrevStep}
              className="btn btn-secondary"
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAddMore}
            >
              Add More
            </button>
          </div>
          <div className="buttonDiv">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={selectedServices.length === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Confirmation;
