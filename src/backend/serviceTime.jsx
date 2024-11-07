import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL } from "../utiles/apiLink.jsx";
import "./serviceTime.css";

const ServiceTimeForm = ({ serviceId }) => {
  const [start_time, setStartTime] = useState("");
  const [end_time, setEndTime] = useState("");
  const [time_gap, setTimeGap] = useState(0);
  const [, setPrice] = useState("");
  const [holiday, setHoliday] = useState(null);
  const [holidayMessage, setHolidayMessage] = useState("");
  const [datePrice, setDatePrice] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [, setMessage] = useState("");
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [serviceTimes, setServiceTimes] = useState([]);
  const [disabledDays, setDisabledDays] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showExtras, setShowExtras] = useState(false);

  const dayOfWeekMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}api/service-days/${serviceId}`
        );
        const fetchedDays = response.data.serviceDays || [];
        setDays(fetchedDays);
        setLoading(false);

        if (fetchedDays.length > 0) {
          setSelectedDay(fetchedDays[0].id);
        }
      } catch (error) {
        console.error("Error fetching days:", error);
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchDays();
    }
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      new Date(`1970-01-01T${start_time}:00Z`) >=
      new Date(`1970-01-01T${end_time}:00Z`)
    ) {
      Swal.fire({
        icon: "error",
        text: "End time must be after start time.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (time_gap <= 0) {
      Swal.fire({
        icon: "error",
        text: "Time gap must be a positive number.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      const formattedHoliday = holiday
        ? `${holiday.getFullYear()}-${(holiday.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${holiday
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : null;

      const formattedSelectedDate = selectedDate
        ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${selectedDate
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : null;

      const response = await axios.post(
        `${API_BASE_URL}api/servicesTime/times`,
        {
          service_id: serviceId,
          day_id: selectedDay,
          start_time,
          end_time,
          time_gap,
          dates: formattedSelectedDate,
          price: datePrice || null,
          holiday: formattedHoliday,
          message: holidayMessage || null,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setServiceTimes((prevServiceTimes) => [
        ...prevServiceTimes,
        { ...response.data, day_id: selectedDay, start_time, end_time },
      ]);

      setDisabledDays((prevDisabledDays) => [...prevDisabledDays, selectedDay]); 

      const nextDayIndex = days.findIndex(day => day.id === selectedDay) + 1;
      if (nextDayIndex < days.length) {
        setSelectedDay(days[nextDayIndex].id);
      } else {
        window.location.reload(); 
      }

      setStartTime("");
      setEndTime("");
      setTimeGap(0);
      setPrice("");
      setHoliday(null);
      setMessage("");
      setSelectedDate(null);
      setDatePrice("");
      setShowExtras(false);

      Swal.fire({
        icon: "success",
        text: "Service time created successfully.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      console.error("Error creating service time:", error);
      Swal.fire({
        icon: "error",
        text: "Failed to create service time.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const filterDates = (date) => {
    const today = new Date();
    if (!selectedDay) return date >= today;
    const selectedDayName = days.find((day) => day.id === selectedDay)?.days;
    const selectedWeekday = dayOfWeekMap[selectedDayName];
    return date.getDay() === selectedWeekday && date >= today;
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="wrapper">
      <div className="service-time-form">
        <h2>Set Times for Service</h2>
        <div className="serviceTimeMain">
          {serviceTimes.map((time) => (
            <div key={time.day_id} className="service-time-info">
              <h3>{days.find((day) => day.id === time.day_id)?.days}:</h3>
              <p>
                Selected Time: {time.start_time} - {time.end_time}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="day-group">
            <label>Selected Day:</label>
            <div className="day-radios">
              {days.map((day) => (
                <label
                  key={day.id}
                  className={`day-label ${
                    selectedDay === day.id ? "selected" : ""
                  } ${disabledDays.includes(day.id) ? "disabled" : ""}`}
                  style={{ opacity: disabledDays.includes(day.id) ? 0.5 : 1 }}
                >
                  <input
                    type="radio"
                    name="day"
                    value={day.id}
                    checked={selectedDay === day.id}
                    onChange={() => setSelectedDay(day.id)}
                    disabled={disabledDays.includes(day.id)} 
                  />
                  {day.days}
                </label>
              ))}
            </div>
          </div>

          <div className="startEndTime d-flex">
            <div className="time-group">
              <label>Start Time:</label>
              <input
                type="time"
                value={start_time}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="time-group">
              <label>End Time:</label>
              <input
                type="time"
                value={end_time}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="time-group">
            <label>Time Interval (in minutes):</label>
            <input
              type="number"
              min="1"
              value={time_gap}
              onChange={(e) => setTimeGap(parseInt(e.target.value, 10))}
              required
            />
          </div>

          <div className="extras-checkbox">
            <label>
              <input
                type="checkbox"
                checked={showExtras}
                onChange={(e) => setShowExtras(e.target.checked)}
              />{" "}
              Show Price, Holiday, and Message
            </label>
          </div>

          {showExtras && (
            <>
              <div className="holiday-group">
                <label>Holiday (if any):</label>
                <DatePicker
                  selected={holiday}
                  onChange={(date) => setHoliday(date)}
                  filterDate={filterDates}
                  placeholderText="Select a date for holiday"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                />
              </div>

              <div className="message-group">
                <label>Holiday Message/Reason (if any):</label>
                <textarea
                  value={holidayMessage}
                  onChange={(e) => setHolidayMessage(e.target.value)}
                  placeholder="Reason for the holiday"
                ></textarea>
              </div>

              <div className="date-price-group">
                <label>Select Date for Special Price:</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  filterDate={filterDates}
                  placeholderText="Select a date"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                />
                <label>
                  {selectedDate
                    ? `Price for ${selectedDate.toDateString()}:`
                    : "Price for Selected Date:"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={datePrice}
                  onChange={(e) => setDatePrice(e.target.value)}
                  placeholder="Enter price for selected date"
                />
              </div>
            </>
          )}

          <button type="submit">Create Service Time</button>
        </form>
      </div>
    </div>
  );
};

export default ServiceTimeForm;
