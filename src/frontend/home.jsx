import React from 'react';
import UserServices from '../components/frontend/userServices.jsx';

function Home() {

  // Define the company name, or fetch it dynamically (e.g., from the URL or state)
  const companyName = 'XpertDigi'; // Replace this with the actual company name

  return (
    <div>
      {/* Pass companyName as a prop to HomeContent */}
      <UserServices companyName={companyName} />
    </div>
  );
}

export default Home;
