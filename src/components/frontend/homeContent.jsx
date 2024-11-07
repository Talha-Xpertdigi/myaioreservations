import React, { useState, useEffect, useCallback } from "react";
import ServiceSelection from "./services.jsx";
import DateSelection from "./datePicker.jsx";
import Confirmation from "./confirmation.jsx";
import UserInfo from "./userInfo.jsx";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";
import StepIndicator from "../frontend/layouts/stepIndicator.jsx";

import axios from "axios";
import "./homeContent.css";

function HomeContent({ name }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    services: [],
    date: null,
    time: null,
  });
  const [submittedData, setSubmittedData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [disabledTimes, setDisabledTimes] = useState({}); // Store disabled times for each service

  const fetchServices = useCallback(async () => {
    if (!name) {
      console.error("Company name is undefined");
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}api/get-service/${name}`);
      console.log("API Response:", response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setServices(response.data);
        setUserId(response.data[0].user_id);
        console.log("userId", response.data[0].user_id);
      } else {
        console.error("No services found in response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, [name]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceToggle = (serviceId) => {
    const isSelected = formData.services.includes(serviceId);
    if (isSelected) {
      setFormData((prevState) => ({
        ...prevState,
        services: prevState.services.filter((id) => id !== serviceId),
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        services: [...prevState.services, serviceId],
      }));
      setStep(2);
      setServiceId(serviceId);
    }
  };

  const handleDateChange = (date) => {
    setFormData((prevState) => ({
      ...prevState,
      date: date,
      time: null,
    }));
    setStep(2);
  };

  const handleTimeChange = (time) => {
    const selectedTime = new Date(`January 1, 2000 ${time}`);
    setFormData((prevState) => ({
      ...prevState,
      time: selectedTime,
    }));
  };

  const handleSubmit = (e) => {
    setSubmitting(true);

    setTimeout(() => {
      if (formData.date && formData.time instanceof Date) {
        setSubmittedData({
          services: formData.services,
          date: formData.date.toLocaleDateString(),
          time: formData.time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        // Disable the selected time slot for the current service
        setDisabledTimes((prevDisabledTimes) => ({
          ...prevDisabledTimes,
          [serviceId]: [
            ...(prevDisabledTimes[serviceId] || []),
            formData.time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          ],
        }));

        setSubmitting(false);
        setFormData({
          services: [],
          date: null,
          time: null,
        });
        setStep(3);
      } else {
        setSubmitting(false);
      }
    }, 1000);
  };

  const handleConfirm = () => {
    setShowSuccess(true);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleNextStep = () => {
    setStep(4);
  };

  const handleAddMore = () => {
    setStep(1);
  };

  const handleForm = () => {
    setStep(1);
  };

  const { date, time } = formData;

  return (
    <>
      <style>
        {`
@import url('https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap');

          .service-icons {
display: flex;
flex-wrap: wrap;
gap: 20px;
justify-content: space-between;
margin: 0 auto;
}

.service-icon {
padding: 20px 40px;
border: 1px solid transparent;
width: 100%;
max-width: 400px;
}

.service-icon .select-button {
background: transparent;
padding: 3px 20px;
color: #fff;
margin-top: 5px;
border: 1px solid #fff;
}

/* .service-icon.selected {
border: 1px solid;
} */

.service-icon .fa-brands.fa-servicestack {
font-size: 46px;
}

.service-icon img {
width: 70px;
height: 70px;
margin-bottom: 30px;
border-radius: 100px;
}

.service-icon p {
margin-bottom: 0;
}

.service-icon h3 {
margin-bottom: 10px;
}

.mainForm {
margin-top: 60px;
margin-bottom: 120px;
padding: 0 30px;
max-width: 991px;
/* color: #fff; */
}

.stepsHeading {
margin-bottom: 0px;
}

.formButtons {
margin-top: 40px;
}

.formButtons button {
padding: 10px 30px;
color: #fff;
border: none;
border-radius: 6px;
}

button{
cursor: pointer;
}

.serviceName {
font-size: 24px;
font-weight: 500;
}

.selectedService {
margin-bottom: 30px;
}

.loadingServices {
font-weight: 500;
text-align: center;
margin-top: 50px;
}


.loading-spinner {
text-align: center;
font-size: 18px;
color: #666;
}

.stepsHeading {
font-size: 32px;
}

.service-cards {
margin-top: 25px;
}

.service-card {
background: #fff;
border-radius: 10px;
box-shadow: 0 0 10px #9b9ac573;
/* border: 1px solid #50499440; */
overflow: hidden;
/* width: 100%; */
text-align: center;
transition: transform 0.2s, box-shadow 0.2s;
cursor: pointer;
}

.service-cards .service-card-info {
width: 100%;
}

.service-card:hover {
transform: scale(1.05);
box-shadow: 0 0 10px #54547e73;
}

.services-image {
width: 100%;
height: 260px;
object-fit: cover;
cursor: pointer;
}

.service-info {
padding: 15px;
}

.service-title {
font-size: 18px;
margin: 10px 0;
color: #000;
}

.service-description {
font-size: 14px;
color: #666;
margin-bottom: 0;
}

.service-price {
font-size: 16px;
margin-top: 7px;
color: #000;
}

.select-button {
background: #007bff;
color: #fff;
border: none;
padding: 10px 15px;
border-radius: 5px;
cursor: pointer;
transition: background 0.3s;
width: 100%;
margin-top: 20px;
}

.select-button.selected {
background: #0056b3;
}

.select-button:hover {
background: #0056b3;
}

@media screen and (max-width: 991px) {
.service-cards {
grid-template-columns: auto auto;
}
}

@media screen and (max-width: 576px) {
.service-cards {
grid-template-columns: auto;
}
}

.service-selection {
/* max-width: 900px; */
margin: 0 auto;
}

.stepsHeading {
font-size: 24px;
text-align: left;
color: #50497F;
}

.service-cards {
display: flex;
flex-direction: column;
gap: 20px;
}

.service-card {
display: flex;
align-items: center;
padding: 10px;
transition: box-shadow 0.3s ease;
}

.service-card.selected {
border: 2px solid #50497F;
background-color: #fff;
}

.service-image-container {
flex-shrink: 0;
margin-right: 12px;
display: flex;
align-items: center;

}

.service-cards .service-card-image {
width: 70px;
border-radius: 6px;
object-fit: cover;
height: auto;
height: 70px;
max-height: 69px;
}

.service-cards .service-image-placeholder {
width: 60px;
height: 60px;
background-color: #6c63ff;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
color: white;
font-size: 24px;
}

.service-cards .service-info {
flex-grow: 1;
}


.service-cards .service-title {
font-size: 18px;
font-weight: 600;
margin: 0;
color: #50497F;
}

.service-cards .selected-icon {
color: #4c498d;
font-size: 15px;
margin-left: 4px;
filter: hue-rotate(136deg);
}

.service-cards .service-details {
margin-top: 8px;
color: #6c757d;
}

.service-cards .service-description {
font-size: 14px;
margin-top: 4px;
line-height: 19px;
}

.service-cards .service-duration {
font-size: 14px;
font-weight: 500;
margin-top: 2px;
margin-bottom: 0;
}

.service-cards .service-card-detail {
text-align: left;
}

.service-cards .service-card-info {
text-align: left;
}

.service-card-header {
display: flex;
align-items: center;
justify-content: space-between;
}

.service-content {
width: 100%;
display: flex;
align-items: center;
}
.container-fluid {
font-family: "Jost", sans-serif !important;
width: unset;
max-width: 871px;
margin: 50px auto;
    box-shadow: 0 0 10px #9b9ac573;
    padding: 40px 30px;
    border-radius: 20px;
    position: relative;
    z-index: 999;
}

.buttonDiv{
display: flex;
align-items: center;
gap: 20px;
margin-top: 30px;
margin-bottom: 30px;
}


/* topbar loading */

.topbar-loading {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 4px;
background-color: #7368b4;
z-index: 9999;
animation: loading-animation 2s linear infinite;
}

button:focus{
outline: none !important; 
}

.d-flex.align-items-center {
display: flex;
align-items: flex-start;
}

/* Define the keyframes for the animation */
@keyframes slideIn {
from {
opacity: 0;
transform: translateY(20px);
}

to {
opacity: 1;
transform: translateY(0);
}
}

/* Apply the animation to each service card */
.service-card {
animation: slideIn 0.5s ease-out;
opacity: 0;
transform: translateY(20px);
}

.service-card-enter {
animation: slideIn 0.5s ease-out forwards;
}

.service-selection .stepsHeading {
margin-bottom: -12px;
font-weight: 500;
}

@media screen and (max-width: 992px) {
.service-cards .service-card-image {
height: 100%;
max-height: 100%;
object-fit: cover;
}
}

@media screen and (max-width: 576px) {
.service-cards .service-description {
font-size: 12px;
}

.service-content .service-image-container {
margin-bottom: 0;
text-align: left;
}

.service-content {
flex-direction: column;
}

.service-cards .service-card-image {
height: 60px;
max-height: 100%;
object-fit: cover;

margin-bottom: 13px;
}

.container-fluid {
  box-shadow: none;
}
.mainForm {
padding: 0 10px;
}
}
 `}
      </style>
      <div className="container-fluid mainForm">
        <StepIndicator currentStep={step} />

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <ServiceSelection
            onServiceToggle={handleServiceToggle}
            services={services}
            userId={userId}
            onNextStep={handleNextStep}
          />
        )}

        {/* Step 2: Date Selection */}
        {step === 2 && serviceId && (
          <DateSelection
            serviceId={serviceId}
            services={services}
            userId={userId}
            selectedServices={formData.services}
            date={date}
            time={time}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            onSubmit={handleSubmit}
            onPrevStep={handlePrevStep}
            submitting={submitting}
            disabledTimes={disabledTimes[serviceId] || []} 
          />
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && submittedData && (
          <Confirmation
            submittedData={submittedData}
            userId={userId}
            onPrevStep={handlePrevStep}
            onConfirm={handleConfirm}
            onNextStep={handleNextStep}
            services={services}
            onAddMore={handleAddMore}
          />
        )}

        {/* Step 4: UserInfo */}
        {step === 4 && (
          <UserInfo
            services={services}
            userId={userId}
            onFormSubmit={handleForm}
          />
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="successMessage">
            <p>Form successfully submitted!</p>
          </div>
        )}
      </div>
    </>
  );
}

export default HomeContent;
