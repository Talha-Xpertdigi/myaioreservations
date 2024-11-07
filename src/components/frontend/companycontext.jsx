import React, { createContext, useContext, useState } from 'react';

// Create a context with default value
const CompanyContext = createContext({ companyName: '', setCompanyName: () => {} });

export const CompanyProvider = ({ children }) => {
  const [companyName, setCompanyName] = useState('');

  return (
    <CompanyContext.Provider value={{ companyName, setCompanyName }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
