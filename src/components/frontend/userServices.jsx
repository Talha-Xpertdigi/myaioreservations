import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import ServiceSelection from "./services.jsx";
import DateSelection from "./datePicker.jsx";
import Confirmation from "./confirmation.jsx";
import UserInfo from "./userInfo.jsx";
import { API_BASE_URL } from "../../utiles/apiLink.jsx";
import StepIndicator from "../frontend/layouts/stepIndicator.jsx"; 
import axios from "axios";
import "./homeContent.css";

function UserServices() {
  const { companyName } = useParams();
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

  const fetchServices = useCallback(async () => {
    if (!companyName) {
      console.error("Company name is undefined");
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}api/get-service/${companyName}`
      );
      console.log("API Response:", response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setServices(response.data);
        setUserId(response.data[0].user_id); 
        console.log("userId", response.data[0].user_id)
      } else {
        console.error("No services found in response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, [companyName]);

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
  }

  const { date, time } = formData;

  return (
    <>
      {/* Step Indicator */}

      <div className="container-fluid mainForm">
      <StepIndicator currentStep={step} />

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <ServiceSelection
            onServiceToggle={handleServiceToggle}
            services={services}
            onNextStep={handleNextStep}
          />
        )}

        {/* Step 2: Date Selection */}
        {step === 2 && serviceId && (
          <DateSelection
            serviceId={serviceId}
            services={services}
            selectedServices={formData.services}
            date={date}
            userId={userId}
            time={time}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            onSubmit={handleSubmit}
            onPrevStep={handlePrevStep}
            submitting={submitting}
          />
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && submittedData && (
          <Confirmation
            submittedData={submittedData}
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
            onFormSubmit={handleForm}
            userId={userId}
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

export default UserServices;
