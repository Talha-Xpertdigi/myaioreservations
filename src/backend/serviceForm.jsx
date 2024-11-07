import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { motion } from "framer-motion"; 
import { API_BASE_URL } from "../utiles/apiLink.jsx";
import "./serviceForm.css";

const ServiceForm = ({ onServiceCreated }) => {
  const [formData, setFormData] = useState({
    image: null,
    imageUrl: "",
    title: "",
    description: "",
    price: "",
    service_days: [],
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(id);
    } else {
      console.error("User ID not found in localStorage");
    }
  }, []);

  const daysOfWeek = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  const handleChange = (selectedOptions) => {
    const selectedDays = selectedOptions.map((option) => option.value);
    setFormData({
      ...formData,
      service_days: selectedDays,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Format',
          text: 'Only JPG, PNG, Webp, and SVG formats are allowed.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      setFormData({
        ...formData,
        image: file,
        imageUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'User ID not found. Please log in again.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", formData.image);
      formDataUpload.append("title", formData.title);
      formDataUpload.append("description", formData.description);
      formDataUpload.append("price", formData.price);
      formDataUpload.append("service_days", JSON.stringify(formData.service_days));
      formDataUpload.append("user_id", userId);

      const response = await axios.post(
        `${API_BASE_URL}api/services`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: 'success',
        text: 'Service created successfully.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });

      // Clear the form data
      setFormData({
        image: null,
        imageUrl: "",
        title: "",
        description: "",
        price: "",
        service_days: [],
      });

      if (typeof onServiceCreated === 'function') {
        onServiceCreated(response.data);
      } else {
        console.error("onServiceCreated is not a function");
      }

    } catch (error) {
      console.error("There was an error creating the service!", error);
      Swal.fire({
        icon: 'error',
        text: 'There was an error creating the service.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="service-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="form-group"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="mb-3">Add New Service:</h2>
        <div className="image-upload-wrapper">
          {formData.imageUrl ? (
            <motion.img
              src={formData.imageUrl}
              alt="Uploaded"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <motion.div
              className="upload-text"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              Upload Image
            </motion.div>
          )}
          <input
            className="imageUpload"
            type="file"
            accept="image/*"
            name="image"
            onChange={handleImageChange}
            required
          />
        </div>
      </motion.div>

      <motion.div
        className="form-group"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </motion.div>

      <motion.div
        className="form-group"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </motion.div>

      <motion.div
        className="form-group"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </motion.div>

      <motion.div
        className="form-group"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <label>Service Days:</label>
        <Select
          name="service_days"
          options={daysOfWeek}
          isMulti
          value={daysOfWeek.filter((day) =>
            formData.service_days.includes(day.value)
          )}
          onChange={handleChange}
          required
        />
        <small className="form-text">
          Select days (multiple selections allowed)
        </small>
      </motion.div>

      <button
        type="submit"
        className="btn-create-service"
      >
        Create Service
      </button>
    </motion.form>
  );
};

export default ServiceForm;
