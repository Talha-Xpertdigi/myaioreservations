import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";
import "./datepicker.css";
import Swal from "sweetalert2";

const toLocalDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

const DateSelection = ({
  serviceId,
  services,
  date,
  onDateChange,
  onTimeChange,
  onSubmit,
  onPrevStep,
  submitting,
  userId,
}) => {
  const [serviceDays, setServiceDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [, setSelectedPrice] = useState(0);
  const [specialPrice, setSpecialPrice] = useState({});
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [selectedServices] = useState(
    JSON.parse(localStorage.getItem("selectedServices") || "[]")
  );
  const [timeSlotsLoaded, setTimeSlotsLoaded] = useState(false);
  const [holidays, setHolidays] = useState([]);

  console.log("user", userId);

  useEffect(() => {
    const fetchServiceDays = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}api/service-days/${serviceId}`
        );
        const data = await response.json();
        setServiceDays(data.serviceDays);
        const holidayData = data.serviceDays.flatMap((day) =>
          day.times
            .filter((time) => time.holiday)
            .map((time) => ({
              date: toLocalDate(time.holiday).toLocaleDateString(),
              message: time.message,
            }))
        );
        setHolidays(holidayData);

        if (data.serviceDays.length > 0 && date) {
          const initialDateDayName = date
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase();
          const initialSelectedDay = data.serviceDays.find(
            (day) => day.days.toLowerCase() === initialDateDayName
          );
          if (initialSelectedDay) {
            setSelectedDay(initialSelectedDay);
            fetchBookedTimeSlots(date);
          }
        }

        const currentService = services.find((s) => s.id === serviceId);
        if (currentService) {
          setSelectedPrice(currentService.price);
        }

        const specialPriceData = data.serviceDays.flatMap((day) =>
          day.times
            .filter((time) => time.price)
            .map((time) => ({
              date: toLocalDate(time.dates).toLocaleDateString(),
              price: time.price,
            }))
        );
        const specialPriceMap = specialPriceData.reduce(
          (acc, { date, price }) => {
            acc[date] = price;
            return acc;
          },
          {}
        );
        setSpecialPrice(specialPriceMap);
      } catch (error) {
        console.error("Error fetching service days:", error);
      }
    };

    fetchServiceDays();
  }, [serviceId, date, services]);

  const fetchBookedTimeSlots = async (selectedDate) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}api/get-appointments/${userId}?date=${selectedDate.toISOString()}`
      );
      const data = await response.json();
      const bookedSlots = data
        .filter(
          (appointment) =>
            appointment.service_id === serviceId &&
            toLocalDate(appointment.selected_date).toLocaleDateString() ===
              selectedDate.toLocaleDateString()
        )
        .map((appointment) => appointment.selected_time_slot);

      setBookedTimeSlots(bookedSlots);
      setTimeSlotsLoaded(true);
    } catch (error) {
      console.error("Error fetching booked time slots:", error);
    }
  };

  const handleDateChange = async (selectedDate) => {
    onDateChange(selectedDate);
    const selectedDateDayName = selectedDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const selectedDateDay = serviceDays.find(
      (day) => day.days.toLowerCase() === selectedDateDayName
    );

    const holiday = holidays.find(
      (holiday) =>
        toLocalDate(holiday.date).toLocaleDateString() ===
        selectedDate.toLocaleDateString()
    );

    if (holiday) {
      await Swal.fire({
        icon: "info",
        title: "Holiday",
        text: holiday.message,
        confirmButtonText: "OK",
      });

      setSelectedDay(null);
      setSelectedTimeSlot(null);
      setBookedTimeSlots([]);
      setTimeSlotsLoaded(false);
      setSpecialPrice({});
    } else {
      if (selectedDateDay) {
        setSelectedDay(selectedDateDay);
        setSelectedTimeSlot(null);
        fetchBookedTimeSlots(selectedDate);

        const timeSlot = selectedDateDay.times.find(
          (time) =>
            toLocalDate(time.dates).toLocaleDateString() ===
            selectedDate.toLocaleDateString()
        );
        setSpecialPrice(
          timeSlot
            ? { [selectedDate.toLocaleDateString()]: timeSlot.price }
            : {}
        );
      } else {
        setSelectedDay(null);
        setBookedTimeSlots([]);
        setTimeSlotsLoaded(false);
        setSpecialPrice({});
      }
    }
  };

  const handleTimeSlotChange = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    onTimeChange(timeSlot);
  };

  const generateTimeSlots = () => {
    if (selectedDay && !isHolidayDate(date)) {
      const timeSlots = [];
      const startTime = new Date(
        `January 1, 2000 ${selectedDay.times[0].start_time}`
      );
      const endTime = new Date(
        `January 1, 2000 ${selectedDay.times[0].end_time}`
      );
      const timeGap = parseInt(selectedDay.times[0].time_gap, 10);

      let currentTime = new Date(startTime);

      while (currentTime <= endTime) {
        const timeSlot = currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        timeSlots.push(timeSlot);
        currentTime.setMinutes(currentTime.getMinutes() + timeGap);
      }

      return timeSlots;
    }

    return [];
  };

  const isHolidayDate = (date) => {
    return holidays.some(
      (holiday) =>
        toLocalDate(holiday.date).toLocaleDateString() ===
        date.toLocaleDateString()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !selectedTimeSlot) {
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select both a date and a time slot.",
      });
      return;
    }

    const updatedServices = [...selectedServices];
    const index = updatedServices.findIndex((s) => s.serviceId === serviceId);

    const discountPrice = specialPrice[date.toLocaleDateString()] || null;
    const servicePrice =
      services.find((service) => service.id === serviceId)?.price || 0;

    if (index > -1) {
      updatedServices[index] = {
        serviceId,
        serviceName:
          services.find((service) => service.id === serviceId)?.title || "",
        selectedDate: date.toLocaleDateString(),
        selectedTime: selectedTimeSlot,
        servicePrice: parseFloat(servicePrice).toFixed(2),
        discountPrice: discountPrice
          ? parseFloat(discountPrice).toFixed(2)
          : null,
      };
    } else {
      updatedServices.push({
        serviceId,
        serviceName:
          services.find((service) => service.id === serviceId)?.title || "",
        selectedDate: date.toLocaleDateString(),
        selectedTime: selectedTimeSlot,
        servicePrice: parseFloat(servicePrice).toFixed(2),
        discountPrice: discountPrice
          ? parseFloat(discountPrice).toFixed(2)
          : null,
      });
    }

    localStorage.setItem("selectedServices", JSON.stringify(updatedServices));
    updatedServices.forEach((service) => {
      localStorage.setItem(
        `service_${service.serviceId}`,
        JSON.stringify(service)
      );
    });

    onSubmit("/confirmation");
  };

  return (
    <>
                 <style>
        {`
      .datepicker {
  display: flex;
  flex-direction: column;
}

.datepicker input {
  width: 100%;
  height: 40px;
  padding-left: 15px;
}

/* .datepickerForm {
  background: var(--background-color);
  box-shadow: 0 0 10px #9b9ac573;
  padding: 40px 35px;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
} */

.react-datepicker-popper {
  width: 100%;
  max-width: 500px;
}

.react-datepicker {
  width: 100%;
  border: none;
}

.react-datepicker__month-container {
  width: 100%;
  border-radius: 4px;
  background: var(--background-color);
}

.react-datepicker__day--selected {
  background-color: #50497F;
  color: #fff !important;
}

.react-datepicker__day:hover,
.react-datepicker__month-text:hover,
.react-datepicker__quarter-text:hover,
.react-datepicker__year-text:hover {
  border-radius: 30px;
}

.react-datepicker__day.react-datepicker__day--021.react-datepicker__day--selected {
  border-radius: 30px;
  background: #413b6e;
}

.react-datepicker__day-name,
.react-datepicker__day,
.react-datepicker__time-name {
  color: var(--text-color);
}

.react-datepicker__header {
  background-color: var(--background-color);
}

.react-datepicker__week {
  display: flex;
  justify-content: space-between;
}

.react-datepicker__day-name,
.react-datepicker__day,
.react-datepicker__time-name {
  width: 2.5rem;
  line-height: 2.5rem;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  cursor: pointer;
}

.react-datepicker__day--keyboard-selected,
.react-datepicker__month-text--keyboard-selected,
.react-datepicker__quarter-text--keyboard-selected,
.react-datepicker__year-text--keyboard-selected {
  background-color: #50497F;
  color: #fff;
}

.react-datepicker__day--keyboard-selected:hover {
  color: #000;
}

.react-datepicker__day--today,
.react-datepicker__month-text--today,
.react-datepicker__quarter-text--today,
.react-datepicker__year-text--today {
  font-weight: bold;
  background: #9b9ac5;
  color: #fff !important;
}

.react-datepicker__day--today:hover {
  background-color: #9b9ac5;
}

h2.react-datepicker__current-month {
  color: #000;
}

.react-time-picker {
  width: 100%;
}

input.react-time-picker__inputGroup__input {
  width: 45px !important;
}

.react-time-picker__clock.react-time-picker__clock--open {
  display: none;
}

.react-datepicker__day-names {
  overflow: auto;
}

.react-datepicker__day--disabled {
  opacity: 0.3 !important;
      cursor: no-drop;
  /* Opacity for disabled dates */
}

.react-datepicker__day-names {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding: 0 6px;
}

.userTime {
  display: flex;
  gap: 30px;
}

.timeSlotButton {
  padding: 8px 12px;
  margin-right: 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  background: transparent;
  cursor: pointer;
}

.timeSlotButton.selected {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}

.timeSlotButtons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
  gap: 10px;
}

.timeSlotButtonWrapper {
  display: inline-block;
}

.timeSlotButton {
  display: none;
  /* Hide the actual radio button */
}

.timeSlotButton+label {
    display: flex;
    height: 34px;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: 1px solid #50497F;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    margin-bottom: 0;
    font-size: 13px;
    border-radius: 7px;
    font-weight: 600;
    color: #50497F;
}

button.btn.btn-secondary {
    background: #858585 !important;
}

.timeSlotButton:checked+label {
  background-color: #50497F;
  color: white;
}

.disabledTimeSlot {
  opacity: 0.5;
  pointer-events: none;
}

button.react-datepicker__navigation {
    border: 1px solid #50497F;
    border-radius: 6px;
    padding: 5px 10px;
    cursor: pointer;
    color: #fff;
    background: #50497F;
}

span.react-datepicker__aria-live {
    display: none;
}


button.react-datepicker__navigation.react-datepicker__navigation--next {
    float: right;
}

.react-datepicker__navigation-icon--next::before {
  transform: rotate(45deg);
  left: -4px;
}

.react-datepicker__navigation-icon--previous::before {
  transform: rotate(225deg);
  right: -4px;
}

.react-datepicker__year-read-view--down-arrow,
.react-datepicker__month-read-view--down-arrow,
.react-datepicker__month-year-read-view--down-arrow,
.react-datepicker__navigation-icon::before {
  border-color: #50497F;
  top: 8px;
}

.react-datepicker__day--selected:hover,
.react-datepicker__day--in-selecting-range:hover,
.react-datepicker__day--in-range:hover,
.react-datepicker__month-text--selected:hover,
.react-datepicker__month-text--in-selecting-range:hover,
.react-datepicker__month-text--in-range:hover,
.react-datepicker__quarter-text--selected:hover,
.react-datepicker__quarter-text--in-selecting-range:hover,
.react-datepicker__quarter-text--in-range:hover,
.react-datepicker__year-text--selected:hover,
.react-datepicker__year-text--in-selecting-range:hover,
.react-datepicker__year-text--in-range:hover {
  background-color: #50497F;
}

.forFormFlex {
  display: flex;
  gap: 20px;
}

.datepicker_flex .selectedService {
  margin-bottom: 30px;
  font-size: 18px;
}

.timeDetails h4 {
  font-size: 18px;
  margin-bottom: 35px;
  margin-top: 16px;
}

.timeTotalDetails {
  padding-left: 20px;
  border-left: 1px solid #ccc;
}

/* Define keyframes for the animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Apply the animations */
.date-picker-wrapper {
  animation: fadeIn 0.5s ease-out;
}

.time-slot-wrapper {
  animation: slideUp 0.5s ease-out;
  opacity: 0;
  transform: translateY(20px);
}

.time-slot-wrapper.loaded {
  animation: slideUp 0.5s ease-out forwards;
}

.datepicker_flex {
  width: 100%;
  max-width: 50%;
}

form.formButtons.datepickerForm {
  max-width: 738px;
  margin: 0 auto;
  margin-top: 40px;
}

.custom-day-content {
  position: relative;
}

span.holiday-text {
  position: absolute;
  left: -14px;
  font-size: 12px;
  top: -18px;
}

span.special-price-text {
  position: absolute;
  left: -15px;
  font-size: 11px;
  top: -16px;
  opacity: 0.8;
}

.react-datepicker__day--selected .special-price-text {
  color: #000;
  top: -27px;
}

.buttonDiv .btn-primary {
  background-color: #50497F !important;
  border-color: #50497F;
}

button{
  cursor: pointer;
}


@media screen and (max-width: 787px) {
  .forFormFlex {
    flex-direction: column;
}

.timeTotalDetails {
  padding-top: 20px;
  border-top: 1px solid #ccc;
  padding-left: 0;
  border-left: none;
}
.datepicker_flex {
  max-width: 100%;
}
  form.formButtons.datepickerForm {
    margin-top: 5px;
}
.stepsHeading {
    margin-top: 40px;
}
}

@media screen and (max-width: 380px) {
  .confirmation button {
    padding: 8px 22px;
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
      `}
      </style>
      <div>
        <h2 className="stepsHeading">Choose Date and Time</h2>
        <form className="formButtons datepickerForm">
          <div className="forFormFlex">
            <div className="datepicker_flex">
              <h3 className="selectedService">
                Selected Service:{" "}
                {services.find((service) => service.id === serviceId)?.title ||
                  ""}
              </h3>
              <div className="datepicker date-picker-wrapper">
                <DatePicker
                  selected={date}
                  onChange={handleDateChange}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select a date"
                  className="date-picker"
                  required
                  showPopperArrow={false}
                  inline
                  filterDate={(date) => {
                    const isPast = date < new Date();
                    const isValidDay = serviceDays.some(
                      (day) =>
                        day.days.toLowerCase() ===
                        date
                          .toLocaleDateString("en-US", { weekday: "long" })
                          .toLowerCase()
                    );
                    const isHoliday = holidays.some(
                      (holiday) =>
                        toLocalDate(holiday.date).toLocaleDateString() ===
                        date.toLocaleDateString()
                    );
                    return !isPast && isValidDay && !isHoliday;
                  }}
                  renderDayContents={(day, date) => {
                    const formattedDate = date.toLocaleDateString();
                    const holiday = holidays.find(
                      (holiday) =>
                        toLocalDate(holiday.date).toLocaleDateString() ===
                        formattedDate
                    );
                    const specialPriceLabel = specialPrice[formattedDate]
                      ? `Discount`
                      : "";

                    return (
                      <div className="custom-day-content">
                        {day}
                        {holiday && (
                          <span className="holiday-text">Holiday</span>
                        )}
                        {specialPriceLabel && (
                          <span className="special-price-text">
                            {specialPriceLabel}
                          </span>
                        )}
                      </div>
                    );
                  }}
                  customInput={<CustomDatePickerInput />}
                />
              </div>
            </div>

            {selectedDay && !isHolidayDate(date) && (
              <div className="timeTotalDetails">
                <div className="timeDetails">
                  <h4>{selectedDay.days} Times:</h4>
                  <div className="priceDetails">
                    {specialPrice[date.toLocaleDateString()] !== undefined && (
                      <p>
                        <strong>After Discount:</strong> $
                        {specialPrice[date.toLocaleDateString()]}
                      </p>
                    )}
                  </div>
                  <div className="userTime">
                    <p>
                      <strong>Start Time:</strong>{" "}
                      {selectedDay.times[0].start_time}
                    </p>
                    <p>
                      <strong>End Time:</strong>{" "}
                      {selectedDay.times[0].end_time}
                    </p>
                  </div>
                  <div
                    className={`timeSlotButtons time-slot-wrapper ${
                      timeSlotsLoaded ? "loaded" : ""
                    }`}
                  >
                    {generateTimeSlots().map((slot, index) => (
                      <div
                        key={index}
                        className={`timeSlotButtonWrapper ${
                          bookedTimeSlots.includes(slot)
                            ? "disabledTimeSlot"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          id={`${serviceId}-${slot}`}
                          name="timeSlot"
                          checked={selectedTimeSlot === slot}
                          onChange={() => handleTimeSlotChange(slot)}
                          className="timeSlotButton"
                          disabled={bookedTimeSlots.includes(slot)}
                        />
                        <label htmlFor={`${serviceId}-${slot}`}>{slot}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="buttonDiv">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onPrevStep}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const CustomDatePickerInput = ({ value, onClick }) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    className="customDatePicker"
    readOnly
  />
);

export default DateSelection;
