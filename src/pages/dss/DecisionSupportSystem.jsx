// src/pages/dss/DecisionSupportSystem.jsx
import React, { useState } from 'react';
import DSSMainPage from './DSSMainPage';
import DSSAgentRunner from './DSSAgentRunner';

/**
 * Main container for the Decision Support System.
 * It manages the flow between the main DSS page and the agent runner.
 */
const DecisionSupportSystem = () => {
  const [selectedSchemeType, setSelectedSchemeType] = useState(null);

  const handleSchemeSelect = (schemeType) => {
    setSelectedSchemeType(schemeType);
  };

  const handleBack = () => {
    setSelectedSchemeType(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {!selectedSchemeType ? (
        <DSSMainPage onSchemeSelect={handleSchemeSelect} />
      ) : (
        <DSSAgentRunner schemeType={selectedSchemeType} onBack={handleBack} />
      )}
    </div>
  );
};

export default DecisionSupportSystem;