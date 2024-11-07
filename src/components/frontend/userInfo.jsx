import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import Swal from "sweetalert2";
import "react-phone-input-2/lib/style.css";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";
import "./userInfo.css";

const UserInfo = ({onFormSubmit, userId}) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    booking_notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // const id = localStorage.getItem("userId");
    if (userId) {
      setUserId(userId);
      console.log("user_id", userId)
    } else {
      console.error("User ID not found in localStorage");
    }

    const serviceKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("service_")
    );
    const services = serviceKeys
      .map((key) => JSON.parse(localStorage.getItem(key)))
      .filter(
        (service) =>
          service &&
          service.serviceName &&
          service.selectedDate &&
          service.selectedTime
      );
    console.log("Retrieved services:", services);
    setSelectedServices(services);
  }, [userId]);

  useEffect(() => {
    const total = selectedServices.reduce((acc, service) => {
      return (
        acc + parseFloat(service.discountPrice || service.servicePrice || 0)
      );
    }, 0);
    setTotalPrice(total);
    console.log("Selected services and total price:", selectedServices, total);
  }, [selectedServices]);

  const formatDateToLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}/${month}/${day}`;
  };

  const uploadService = async (service) => {
    console.log("service", selectedServices);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("name", formData.name);
      formDataUpload.append("email", formData.email);
      formDataUpload.append("phone", formData.phone);
      formDataUpload.append("user_id", userId);
      formDataUpload.append("booking_notes", formData.booking_notes);
      formDataUpload.append("service_id", service.serviceId);
      formDataUpload.append("service_name", service.serviceName);
      formDataUpload.append(
        "service_price",
        service.discountPrice || service.servicePrice
      );
      formDataUpload.append(
        "selected_date",
        formatDateToLocal(service.selectedDate)
      );
      formDataUpload.append("selected_time_slot", service.selectedTime);

      const response = await fetch(`${API_BASE_URL}api/submit-form-data`, {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Service uploaded:", service);
      console.log("Response:", data);
    } catch (error) {
      console.error("Error uploading service data:", error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      for (const service of selectedServices) {
        if (service && service.serviceId) {
          await uploadService(service);
        }
      }

      const serviceKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("service_")
      );
      serviceKeys.forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem("selectedServices");
      onFormSubmit();

      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your appointment has been booked.",
      });
    } catch (error) {
      console.error("Error:", error.message);
      Swal.fire({
        icon: "error",
        title: "Reservation Failed",
        text: `Reservation failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
    <style>
      {`
      .react-tel-input .country-list .country-name {
  margin-right: 6px;
  color: #000;
}

label.required-label {
    margin-bottom: 6px;
    display: block;
    font-size: 13px;
}

.phoneInput .form-control {
    // height: 15px !important;
    width: 100%;
    max-width: 370px;
}

.totalPrice {
  margin-top: 20px;
  text-align: right;
}

.formSubmit {
  margin-top: 30px;
}

td.tableHeader {
  border-bottom: 1px solid #fff;
}

/* userInfo.css */

.required-label:after {
  content: "*";
  color: red;
  margin-left: 4px;
}

.form-group {
  width: 100%;
}

.form-control {
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

  textarea#bookingNotes {
    width: 100%;
    max-width: 370px;
    margin-top: 7px;
}
  .form-group label {
    font-size: 12px;
    color: #50497F;
    font-weight: 600;
}

.special-label {
    display: none;
}

.phoneInput {
  width: 100%;
}

.confirmationTable {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.confirmationTable td,
.confirmationTable th {
  border: 1px solid #ddd;
  padding: 8px;
}

.tableHeader {
  font-weight: bold;
}

.tableData {
  text-align: right;
}

.mainForm .formSubmit {
  padding: 10px 22px;
  cursor: pointer;
}

.btn-secondary {
  border-radius: 7px;
}

.btn-primary:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
  cursor: not-allowed;
}

/* .serviceCardsContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.serviceCard {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.serviceTitle {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
  */

.serviceCard {
  margin-top: 10px;
}

.serviceCard p {
  margin: 0.5rem 0;
}

.firstFields {
  display: flex;
  gap: 10px;
}

.innerUserForm,
.secondFormCards {
  width: 100%;
  padding: 25px;
}

.innerUserForm {
  border-right: 1px solid #ccc;
}

/* .innerUserForm {
  padding: 20px;
  box-shadow: 0 0 10px #0000003b;
  border-radius: 15px;
} */

.secondFormCards h3 {
  margin-top: 0;
}

.appointmentsInnerForm h2 {
  font-size: 26px;
  margin-top: 0px;
}

.appointmentsInnerForm .forUserFormFlex {
  display: flex;
  background: #fff;
  border-radius: 15px;
  /* box-shadow: 0 0 10px #0000003b;
  padding: 34px 25px; */
  border: 1px solid #ccc;
}

@media screen and (max-width: 787px) {
  .appointmentsInnerForm .forUserFormFlex {
    flex-direction: column;
  }

  .innerUserForm {
    border-right: none;
    border-bottom: 1px solid #ccc;
  }

  .innerUserForm,
  .secondFormCards {
    width: unset;
    padding: 20px;
  }
}

@media screen and (max-width: 567px) {
  .firstFields {
    flex-direction: column;
    gap: 0;
  }
.phoneInput .form-control {
    max-width: 285px;
}

    textarea#bookingNotes {
       max-width: 285px;

}

.form-control {
    width: 100%;
    max-width: 285px;
}
  .appointmentsInnerForm h2 {
    font-size: 20px;
  }

  .serviceCard .serviceTitle {
    font-size: 19px;
  }

  .totalPrice h5 {
    font-size: 15px;
  }

  .innerUserForm,
  .secondFormCards {
    padding: 15px;
  }

  .mainForm .formSubmit {
    padding: 8px 17px;
    font-size: 13px;
  }

  .formSubmit {
    margin-top: 10px;
  }
}
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
  h4.serviceTitle {
    margin-top: 0;
}
    .serviceCard {
    margin-top: 10px;
    box-shadow: 0 0 10px #9b9ac573;
    padding: 13px 15px;
    border-radius: 10px;
    color: #000 !important;
}
    .totalPrice h5 {
    font-size: 18px;
    font-weight: 500;
}
    .form-control:focus {
    color: #495057;
    background-color: #fff;
    outline: 0;
    border-color: #50497F;
    box-shadow: 0 2px 6px 0 rgba(115, 103, 240, .3);
}
      `}
    </style>
    <div className="datepickerForm appointmentsInnerForm">
      <form onSubmit={handleSubmit}>
        <div className="forUserFormFlex">
          <div className="innerUserForm">
            <h2>Your Information:</h2>
            <div className="firstFields">
              <div className="form-group">
                <label htmlFor="nameInput" className="required-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nameInput"
                  name="name"
                  placeholder="Enter your name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="emailInput" className="required-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="emailInput"
                  name="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="required-label">
                Phone Number
              </label>
              <PhoneInput
                country={"us"}
                name="phone"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                className="phoneInput"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bookingNotes">Booking Notes</label>
              <textarea
                className="form-control"
                id="bookingNotes"
                name="booking_notes"
                rows="3"
                placeholder="Any special requests or notes"
                value={formData.booking_notes}
                onChange={(e) =>
                  setFormData({ ...formData, booking_notes: e.target.value })
                }
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary formSubmit"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Reserve My Order"}
            </button>
          </div>

          <div className="secondFormCards">
            <h2>Your Order Details:</h2>
            <div className="serviceCardsContainer">
              {selectedServices.length > 0 ? (
                <>
                  {selectedServices.map((service, index) =>
                    service && service.serviceName ? (
                      <div key={index} className="serviceCard">
                        <h4 className="serviceTitle">{service.serviceName}:</h4>
                        <p>
                          <strong>Price:</strong>{" "}
                          {service.discountPrice ? (
                            <>
                              <span className="discountPrice">
                                ${service.discountPrice}
                              </span>
                              <span className="originalPrice">
                                {" "}
                                (Original Price: ${service.servicePrice})
                              </span>
                            </>
                          ) : (
                            `$${service.servicePrice}`
                          )}
                        </p>
                        <p>
                          <strong>Date:</strong> {service.selectedDate}
                        </p>
                        <p>
                          <strong>Time Slot:</strong> {service.selectedTime}
                        </p>
                      </div>
                    ) : null
                  )}
                  <div className="totalPrice">
                    <h5 className="mb-0">Total: ${totalPrice.toFixed(2)}</h5>
                  </div>
                </>
              ) : (
                <p>No services selected.</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
    </>
  );
};

export default UserInfo;
