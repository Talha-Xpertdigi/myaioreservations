import React from 'react';
import { useParams } from 'react-router-dom';

const CompanyPage = () => {
  const { companyName } = useParams();

  return (
    <div>
      <h1>Welcome to {decodeURIComponent(companyName)}!</h1>
      {/* Additional content for the company page */}
    </div>
  );
};

export default CompanyPage;
