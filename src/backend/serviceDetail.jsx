import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../utiles/apiLink.jsx";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import "./serviceDetail.css";

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [timeInputs, setTimeInputs] = useState({});
  const [showAddDayPopup, setShowAddDayPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [newDay, setNewDay] = useState("");
  const navigate = useNavigate();
  const [existingDays, setExistingDays] = useState(new Set());
  const [formTimeData, setFormTimeData] = useState({
    day_id: "",
    time_id: "",
    day: "",
    start_time: "",
    end_time: "",
    time_gap: "",
    holiday: "",
    dates: "",
    price: "",
    message: "",
  });

  const fetchServiceDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/services/${serviceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch service details");
      }
      const data = await response.json();
      setService(data);

      const initialTimeInputs = {};
      data.days.forEach((day) => {
        day.times.forEach((time) => {
          initialTimeInputs[`${time.id}-${day.id}`] = {
            days: day.days,
            start_time: time.start_time,
            end_time: time.end_time,
            time_gap: time.time_gap,
            holiday: time.holiday || "",
            price: time.price || "",
            message: time.message || "",
            dates: time.dates || "",
          };
        });
      });
      setTimeInputs(initialTimeInputs);

      const existingDays = new Set(data.days.map((day) => day.days));
      setExistingDays(existingDays);
    } catch (error) {
      console.error("Error fetching service details:", error);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      setService((prevService) => ({
        ...prevService,
        price: value,
      }));
    } else if (
      name.includes("start_time") ||
      name.includes("end_time") ||
      name.includes("time_gap") ||
      name.includes("holiday") ||
      name.includes("price") ||
      name.includes("message")
    ) {
      const [timeId, dayId, field] = name.split("-");
      setTimeInputs((prevInputs) => ({
        ...prevInputs,
        [`${timeId}-${dayId}`]: {
          ...prevInputs[`${timeId}-${dayId}`],
          [field]: value,
        },
      }));
    } else {
      setService((prevService) => ({
        ...prevService,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleUpdateDetails = async () => {
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("title", service.title);
      formData.append("description", service.description);
      formData.append("price", service.price);

      Object.keys(timeInputs).forEach((key) => {
        const [timeId, dayId] = key.split("-");
        const { start_time, end_time, time_gap, holiday, price, message } =
          timeInputs[key];
        formData.append(`times[${timeId}][${dayId}][start_time]`, start_time);
        formData.append(`times[${timeId}][${dayId}][end_time]`, end_time);
        formData.append(`times[${timeId}][${dayId}][time_gap]`, time_gap);
        formData.append(`times[${timeId}][${dayId}][holiday]`, holiday);
        formData.append(`times[${timeId}][${dayId}][price]`, price);
        formData.append(`times[${timeId}][${dayId}][message]`, message);
      });

      const response = await fetch(`${API_BASE_URL}api/services/${serviceId}`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to update service details"
        );
      }

      Swal.fire("Success!", "Service details updated successfully!", "success");
    } catch (error) {
      console.error("Error updating service details:", error);
      Swal.fire("Error!", "Failed to update service details.", "error");
    }
  };

  const showUpdatePopupModal = async (id, timeId) => {
    try {
      const data = await fetch(`${API_BASE_URL}api/service-days/days/${id}`);
      const response = await data.json();
      const { id: day_id, days: day, times } = response.serviceDay;
      const { start_time, end_time, time_gap, holiday, price, message, dates } =
        times[0];
      console.log("Fetched data:", {
        start_time,
        end_time,
        time_gap,
        holiday,
        price,
        message,
        dates,
      });
      setFormTimeData({
        day_id: day_id,
        time_id: timeId,
        day: day,
        start_time: start_time,
        end_time: end_time,
        time_gap: time_gap,
        holiday: holiday || "",
        price: price || "",
        message: message || "",
        dates: dates || "",
      });
    } catch (error) {
      console.error("Error fetching service day:", error);
    }
    setShowUpdatePopup(true);
  };

  const characterLimit = 100;

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= characterLimit) {
      setFormTimeData({
        ...formTimeData,
        [name]: value,
      });
    }
  };

  const handleSaveTimeUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}api/service-days-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formTimeData),
      });

      if (!response.ok) {
        throw new Error("Failed to update days and time");
      }

      setShowUpdatePopup(false);
      fetchServiceDetails();
      Swal.fire(
        "Success!",
        "Service day and time updated successfully!",
        "success"
      );
    } catch (error) {
      console.error("Error updating days and time", error);
      Swal.fire("Error!", "Failed to update days and time.", "error");
    }
  };

  const handleCancelTimeUpdate = () => {
    setShowUpdatePopup(false);
  };

  const handleAddDay = () => {
    setShowAddDayPopup(true);
  };

  const handleSaveNewDay = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}api/service-days/${serviceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            days: newDay,
            start_time: formTimeData.start_time,
            end_time: formTimeData.end_time,
            time_gap: formTimeData.time_gap,
            holiday: formTimeData.holiday,
            price: formTimeData.price,
            message: formTimeData.message,
            dates: formTimeData.dates,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add new day");
      }

      const responseData = await response.json();
      console.log(responseData);
      setShowAddDayPopup(false);
      fetchServiceDetails();
      Swal.fire("Success!", "New day added successfully!", "success");
    } catch (error) {
      console.error("Error adding new day:", error);
      Swal.fire("Error!", "Failed to add new day.", "error");
    }
  };

  const handleDeleteTime = async (dayId, timeId) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this day and its times!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}api/service-days-delete/${dayId}/${timeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete service time");
      }

      const updatedService = { ...service };
      updatedService.days = updatedService.days
        .map((day) => {
          return {
            ...day,
            times: day.times.filter((time) => time.id !== timeId),
          };
        })
        .filter((day) => day.times.length > 0);
      setService(updatedService);
      Swal.fire(
        "Deleted!",
        "Service day and time deleted successfully.",
        "success"
      );
    } catch (error) {
      Swal.fire("Error!", "Failed to delete service day and time.", "error");
    }
  };

  const handleBack = () => {
    navigate(-1); 
  };

  if (!service) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="wrapper">
      <div className="service-detail-container">
        <div className="serviceDetailMain" onClick={handleBack}> <button type="button"
          className="backButton"
          > <FaArrowLeft className="arrow-icon" />
        </button> <h1>Service Detail</h1></div>
        <div className="service-detail">
          <div className="service-info">
            <div className="service-info-card">
              <h3>Update Image</h3>
              <div className="service-image-container mt-4">
                <img
                  src={`${API_BASE_URL}public/${service.image}`}
                  alt={service.title}
                  className="service-detail-image"
                />
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/jpeg, image/png, image/svg+xml"
                  onChange={handleImageChange}
                  className="image-upload"
                />
              </div>
              <label htmlFor="title">Update Title</label>
              <input
                type="text"
                name="title"
                value={service.title}
                onChange={handleChange}
                className="service-title mb-3"
              />
              <label htmlFor="description">Update Description</label>
              <textarea
                name="description"
                value={service.description}
                onChange={handleChange}
                className="service-description mb-2"
              />
              <label htmlFor="price">Update Price</label>
              <input
                type="number"
                name="price"
                value={service.price}
                onChange={handleChange}
                className="service-price mb-4"
              />
              <button className="updateButton" onClick={handleUpdateDetails}>
                Update Details
              </button>
            </div>
          </div>

          <div className="service-info">
            <div className="service-info-card">
              <h3>Update Service Days & Timing</h3>
              <div className="service-cards-container">
                {service.days.map((day) => (
                  <div className="service-day-card" key={day.id}>
                    <div className="day-header">
                      <h4>{day.days}</h4>
                    </div>
                    <div className="cardSection">
                      <div className="timings-section">
                        {/* <h5>Timings</h5> */}
                        {day.times.length > 0 ? (
                          day.times.map((time) => (
                            <div className="time-info" key={time.id}>
                              <p>
                                <b>Time: </b> {time.start_time || "N/A"} -{" "}
                                {time.end_time || "N/A"}
                              </p>

                              <p>
                                <b>Holiday: </b> {time.holiday || "N/A"}
                              </p>
                              <p>
                                <b>Discount Day: </b> {time.dates || "N/A"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No timings available</p>
                        )}
                      </div>
                      <div className="details-section">
                        {/* <h5>Details</h5> */}
                        {day.times.length > 0 ? (
                          day.times.map((time) => (
                            <div className="time-details" key={time.id}>
                              <p>
                                <b>Time-Interval: </b>{" "}
                                {`${time.time_gap} mints` || "N/A"}
                              </p>
                              <p>
                                <b>Message: </b> {time.message || "N/A"}
                              </p>
                              <p>
                                <b>Price: </b>{" "}
                                {time.price ? `$${time.price}` : "N/A"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No details available</p>
                        )}
                      </div>
                    </div>
                    <div className="card-actions">
                      {day.times.length > 0 && (
                        <>
                          <button
                            className="updateTimeButton updateBtn"
                            onClick={() =>
                              showUpdatePopupModal(day.id, day.times[0].id)
                            }
                          >
                            Update
                          </button>
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="deleteIcon"
                            onClick={() =>
                              handleDeleteTime(day.id, day.times[0].id)
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="updateButton" onClick={handleAddDay}>
                Add Day
              </button>
            </div>
          </div>

          {showUpdatePopup && (
            <div className="popup">
              <form className="popup-inner" onSubmit={handleSaveTimeUpdate}>
                <input
                  type="hidden"
                  value={formTimeData.day_id}
                  onChange={handleUpdateChange}
                />
                <input
                  type="hidden"
                  value={formTimeData.time_id}
                  onChange={handleUpdateChange}
                />
                <label htmlFor="days">Choose Day</label>
                <select
                  name="day"
                  id="days"
                  value={formTimeData.day}
                  onChange={handleUpdateChange}
                  className="mb-3 popupSelect"
                >
                  {[
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((day) => (
                    <option
                      key={day}
                      value={day}
                      disabled={
                        existingDays.has(day) && formTimeData.day !== day
                      }
                    >
                      {day}
                    </option>
                  ))}
                </select>
                <h3>Update Time</h3>
                <div className="poputTimes d-flex">
                  <div className="slotsPopup">
                    <label htmlFor="popup_start_time">Start Time</label>
                    <input
                      type="time"
                      id="popup_start_time"
                      value={formTimeData.start_time}
                      onChange={handleUpdateChange}
                      name="start_time"
                      className="time-input"
                    />
                  </div>
                  <div className="slotsPopup">
                    <label htmlFor="popup_end_time">End Time</label>
                    <input
                      type="time"
                      id="popup_end_time"
                      value={formTimeData.end_time}
                      onChange={handleUpdateChange}
                      name="end_time"
                      className="time-input"
                    />
                  </div>
                </div>
                <label htmlFor="popup_time_gap">Time Gap</label>
                <input
                  type="number"
                  value={formTimeData.time_gap}
                  id="popup_time_gap"
                  onChange={handleUpdateChange}
                  name="time_gap"
                  className="time-input"
                />
                <label htmlFor="popup_dates">
                  Discount Day{" "}
                  <span>(Only select date against selected day)</span>
                </label>{" "}
                {/* Updated label */}
                <input
                  type="date"
                  id="popup_dates"
                  value={formTimeData.dates}
                  onChange={handleUpdateChange}
                  name="dates"
                  className="time-input"
                />
                <label htmlFor="popup_price">Price</label>
                <input
                  type="number"
                  id="popup_price"
                  value={formTimeData.price}
                  onChange={handleUpdateChange}
                  name="price"
                  className="time-input"
                />
                <label htmlFor="popup_dates">
                  Holiday <span>(Only select date against selected day)</span>
                </label>{" "}
                {/* Updated label */}
                <input
                  type="date"
                  id="popup_dates"
                  value={formTimeData.holiday}
                  onChange={handleUpdateChange}
                  name="holiday"
                  className="time-input"
                />
                <label htmlFor="popup_message">Message</label>
                <textarea
                  type="text"
                  id="new_message"
                  value={formTimeData.message}
                  onChange={handleUpdateChange}
                  name="message"
                  rows="3"
                  cols="50"
                  placeholder="Type your message here..."
                />
                <div className="counter">
                  {characterLimit - formTimeData.message.length} characters
                  remaining
                </div>
                <div className="popupBtns">
                  <button className="updateButton" type="submit">
                    Update
                  </button>
                  <button
                    className="cancelButton updateButton"
                    onClick={handleCancelTimeUpdate}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showAddDayPopup && (
            <div className="popup">
              <form className="popup-inner" onSubmit={handleSaveNewDay}>
                <h3>Add New Day</h3>
                <div className="time-inputs">
                  <label htmlFor="new_day">Select Day</label>
                  <select
                    id="new_day"
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="mb-3 popupSelect"
                  >
                    <option value="">Select a day</option>
                    {[
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => (
                      <option
                        key={day}
                        value={day}
                        disabled={existingDays.has(day)}
                      >
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="time-inputs">
                  <div className="poputTimes d-flex">
                    <div className="slotsPopup">
                      <label htmlFor="new_start_time">Start Time</label>
                      <input
                        type="time"
                        id="new_start_time"
                        value={formTimeData.start_time}
                        onChange={handleUpdateChange}
                        name="start_time"
                      />
                    </div>
                    <div className="slotsPopup">
                      <label htmlFor="new_end_time">End Time</label>
                      <input
                        type="time"
                        id="new_end_time"
                        value={formTimeData.end_time}
                        onChange={handleUpdateChange}
                        name="end_time"
                      />
                    </div>
                  </div>
                  <label htmlFor="new_time_gap">Time Gap</label>
                  <input
                    type="number"
                    id="new_time_gap"
                    value={formTimeData.time_gap}
                    onChange={handleUpdateChange}
                    name="time_gap"
                  />

                  <label htmlFor="new_dates">
                    Discount Day{" "}
                    <span>(Only select date against selected day)</span>
                  </label>
                  <input
                    type="date"
                    id="new_dates"
                    value={formTimeData.dates}
                    onChange={handleUpdateChange}
                    name="dates"
                  />
                  <label htmlFor="new_price">Price</label>
                  <input
                    type="number"
                    id="new_price"
                    value={formTimeData.price}
                    onChange={handleUpdateChange}
                    name="price"
                  />
                  <label htmlFor="new_holiday">
                    Holiday <span>(Only select date against selected day)</span>
                  </label>
                  <input
                    type="date"
                    id="new_holiday"
                    value={formTimeData.holiday}
                    onChange={handleUpdateChange}
                    name="holiday"
                  />
                  <label htmlFor="new_message">Message</label>
                  <textarea
                    type="text"
                    id="new_message"
                    value={formTimeData.message}
                    onChange={handleUpdateChange}
                    name="message"
                    rows="3"
                    cols="50"
                    placeholder="Type your message here..."
                  />
                  <div className="counter">
                    {characterLimit - formTimeData.message.length} characters
                    remaining
                  </div>
                </div>
                <div className="popupBtns">
                  <button className="updateButton" type="submit">
                    Add Day
                  </button>
                  <button
                    className="cancelButton updateButton"
                    onClick={() => setShowAddDayPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
