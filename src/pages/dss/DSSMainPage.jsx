// src/pages/dss/DSSMainPage.jsx
import React from 'react';
import { Users, User } from 'lucide-react';

const FeatureCard = ({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-gray-200 rounded-xl p-6 text-center cursor-pointer transition-all hover:shadow-lg hover:border-blue-500 hover:-translate-y-1"
  >
    <div className="mx-auto bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const DSSMainPage = ({ onSchemeSelect }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Decision Support System</h1>
        <p className="mt-2 text-lg text-gray-600">
          Select the type of scheme you want to analyze.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FeatureCard
          title="Community Schemes"
          description="Analyze and find schemes applicable to an entire community or village, focusing on infrastructure and shared resources."
          icon={<Users className="w-8 h-8 text-blue-600" />}
          onClick={() => onSchemeSelect('Community')}
        />
        <FeatureCard
          title="Individual Schemes"
          description="Find schemes tailored for individual beneficiaries based on their specific land assets and socio-economic profile."
          icon={<User className="w-8 h-8 text-blue-600" />}
          onClick={() => onSchemeSelect('Individual')}
        />
      </div>
    </div>
  );
};

export default DSSMainPage;