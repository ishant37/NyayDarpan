

import React, { useState, useEffect } from 'react';
import { sampleFraData } from '../data/fraData';
import { generatePDFFilename, generatePDF } from '../utils/pdfGenerator';
import FraPattaTemplate from './FraPattaTemplate';
import { generateQRCode } from '../utils/fraUtils';

const FraPattaGenerator = () => {
  const [selectedData, setSelectedData] = useState(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (selectedData) {
      generateQRCode(selectedData).then(setQrCodeDataURL);
    }
  }, [selectedData]);

  const handleSampleSelect = (data) => {
    setSelectedData(data);
  };

  const handleDownloadPDF = async () => {
    if (!selectedData) {
      alert('Please select a record first.');
      return;
    }

    setIsGenerating(true);
    try {
      const filename = generatePDFFilename(selectedData);
      
      // Call generatePDF with the ID of the hidden component
      const result = await generatePDF('fra-patta-for-pdf', filename);
    
      if (result.success) {
        alert('PDF generated successfully!');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`An error occurred while generating the PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* 1. RENDER THE TEMPLATE OFF-SCREEN */}
      {/* This div is hidden from the user but available in the DOM */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {selectedData && (
          <div id="fra-patta-for-pdf"> {/* The ID for the PDF generator */}
            <FraPattaTemplate data={selectedData} qrCodeDataURL={qrCodeDataURL} />
          </div>
        )}
      </div>

      {/* 2. THE VISIBLE UI REMAINS THE SAME */}
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              FRA Patta Generator
            </h1>
            <p className="text-gray-600">
              Select a record to generate a Forest Rights Act (FRA) Patta certificate.
            </p>
          </header>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Sample Data:</h3>
              <div className="space-y-2">
                {sampleFraData.map((data) => (
                  <button
                    key={data.id}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      selectedData?.id === data.id
                        ? 'bg-blue-100 border-blue-400'
                        : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                    onClick={() => handleSampleSelect(data)}
                  >
                    <div className="font-medium">{data.HOLDER_NAME}</div>
                    <div className="text-sm text-gray-500">
                      ID: {data.id} | {data.DISTRICT}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedData && (
              <div className="mt-6 border-t pt-6">
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Selected Record:</h4>
                  <div className="text-sm text-gray-600">
                    <div><strong>ID:</strong> {selectedData.id}</div>
                    <div><strong>Name:</strong> {selectedData.HOLDER_NAME}</div>
                    <div><strong>District:</strong> {selectedData.DISTRICT}</div>
                  </div>
                </div>
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  onClick={handleDownloadPDF}
                  disabled={!selectedData || isGenerating}
                >
                  {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">How to Use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Choose a record from the list above.</li>
              <li>Once selected, click the "Download PDF" button to generate the certificate.</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default FraPattaGenerator;