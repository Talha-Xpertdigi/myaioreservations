import React, { useState } from "react";
import ServiceForm from "./serviceForm.jsx";
import ServiceTimeForm from "./serviceTime.jsx";
import "./dashboard.css";

const AdminDashboard = () => {
  const [service, setService] = useState(null);

  const handleServiceCreated = (newService) => {
    setService(newService);
  };

  return (
    <div className="admin-dashboard">
      {!service ? (
        <ServiceForm onServiceCreated={handleServiceCreated} />
      ) : (
        <ServiceTimeForm serviceId={service.id} />
      )}
    </div>
  );
};

export default AdminDashboard;
