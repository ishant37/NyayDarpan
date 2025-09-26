import React from 'react';
import Seal from '../assets/seal.jpg';
import TehsildarSignature from '../assets/signature.png';

const FraPattaTemplate = ({ data, qrCodeDataURL }) => {
  const headerSections = [
    {
      hindi: "भारत सरकार",
      english: ["GOVERNMENT OF INDIA"],
      styles: "text-black",
      fontSizes: ["text-2xl", "text-xl"], // Reduced from 3xl, 2xl
    },
    {
      hindi: "पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय",
      english: ["MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE"],
      styles: "text-green-700",
      fontSizes: ["text-xl", "text-lg"], // Reduced from 2xl, xl
    },
    {
      hindi: "वन अधिकार अधिनियम, 2006",
      english: [
        "THE SCHEDULED TRIBES AND OTHER TRADITIONAL FOREST DWELLERS",
        "(RECOGNITION OF FOREST RIGHTS) ACT, 2006",
      ],
      styles: "text-blue-800",
      fontSizes: ["text-lg", "text-base"], // Reduced from xl, lg
    },
  ];
  return (
    <div id="fra-patta-template" className="bg-white p-12 max-w-5xl mx-auto font-serif text-black min-h-screen">
      {/* Header Section - Government of India */}
      <div className="text-center mb-4 border-b-2 border-black pb-3">
      {headerSections.map((section, index) => (
        // Reduced margin (mb-2) and tightened line height
        <div key={index} className={`mb-2 font-bold leading-tight ${section.styles}`}>
          <h2 className={section.fontSizes[0]}>{section.hindi}</h2>
          {section.english.map((line, lineIndex) => (
            <h3 key={lineIndex} className={section.fontSizes[1]}>
              {line}
            </h3>
          ))}
        </div>
      ))}

      {/* Reduced top margin (mt-3), padding (p-2), and font sizes */}
      <div className="mt-3 border-2 border-red-600 p-2 inline-block bg-yellow-50 font-bold">
       
        <div className="text-base">
          <span className="text-black ">पट्टा संख्या / TITLE NO: </span>
          <span className="text-red-700">{data.id}</span>
        </div>
      </div>
    </div>


      {/* Main Content in Table Format */}
      <div className="mb-8">
        <table className="w-full border-collapse border-2 border-black">
          {/* Administrative Details Row */}
          <tr>
            <td className="border-2 border-black p-2 w-1/4 bg-gray-100">
              <strong className="text-lg">राज्य / STATE</strong>
            </td>
            <td className="border-2 border-black p-2 w-1/4">
              <span className="text-lg">{data.STATE || 'मध्य प्रदेश'}</span>
            </td>
            <td className="border-2 border-black p-2 w-1/4 bg-gray-100">
              <strong className="text-lg">जिला / DISTRICT</strong>
            </td>
            <td className="border-2 border-black p-2 w-1/4">
              <span className="text-lg">{data.DISTRICT}</span>
            </td>
          </tr>

          <tr>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">तहसील / TEHSIL</strong>
            </td>
            <td className="border-2 border-black p-2">
              <span className="text-lg">{data.TEHSIL}</span>
            </td>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">ग्राम पंचायत / GRAM PANCHAYAT</strong>
            </td>
            <td className="border-2 border-black p-2">
              <span className="text-lg">{data.GRAM_PANCHAYAT}</span>
            </td>
          </tr>

          {/* Holder Details */}
          <tr>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">पट्टाधारी का नाम / HOLDER'S NAME</strong>
            </td>
            <td className="border-2 border-black p-2 colspan-3">
              <span className="text-xl font-bold text-blue-800">{data.HOLDER_NAME}</span>
            </td>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">पिता का नाम / FATHER'S NAME</strong>
            </td>
            <td className="border-2 border-black p-2">
              <span className="text-lg">{data.FATHER_NAME}</span>
            </td>
          </tr>

          {/* Land Details */}
          <tr>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">खसरा संख्या / SURVEY NO.</strong>
            </td>
            <td className="border-2 border-black p-2">
              <span className="text-lg">{data.KHASRA_NO}</span>
            </td>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">क्षेत्रफल / AREA</strong>
            </td>
            <td className="border-2 border-black p-2">
              <span className="text-lg font-bold text-red-600">{data.TOTAL_AREA_SQFT} वर्ग फीट / SQ.FT.</span>
            </td>
          </tr>

          {/* Boundaries */}
          <tr>
            <td className="border-2 border-black p-2 mb-1 bg-yellow-100 text-center font-bold text-lg" colSpan="4">
              सीमाएं / BOUNDARIES
            </td>
          </tr>
          <tr>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong>पूर्व / EAST</strong>
            </td>
            <td className="border-2 border-black p-2">
              {data.BOUNDARY_EAST || 'सरकारी जमीन'}
            </td>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong>पश्चिम / WEST</strong>
            </td>
            <td className="border-2 border-black p-2">
              {data.BOUNDARY_WEST || 'वन भूमि'}
            </td>
          </tr>
          <tr>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong>उत्तर / NORTH</strong>
            </td>
            <td className="border-2 border-black p-2">
              {data.BOUNDARY_NORTH || 'पहाड़'}
            </td>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong>दक्षिण / SOUTH</strong>
            </td>
            <td className="border-2 border-black p-2">
              {data.BOUNDARY_SOUTH || 'नदी'}
            </td>
          </tr>

          {/* Date Row */}
          <tr>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">जारी करने की तारीख / DATE OF ISSUE</strong>
            </td>
            <td className="border-2 border-black p-2">
              <span className="text-lg font-bold">{data.DATE}</span>
            </td>
            <td className="border-2 border-black p-2 bg-gray-100">
              <strong className="text-lg">वैधता / VALIDITY</strong>
            </td>
            <td className="border-2 border-black p-2">
              <span className="text-lg font-bold text-green-600">स्थायी / PERMANENT</span>
            </td>
          </tr>
        </table>
      </div>

      {/* Certification Statement */}
      <div className="mb-8 p-6 border-4 border-blue-600 bg-blue-50">
        <h4 className="text-xl font-bold text-center mb-4 text-blue-800">प्रमाणन / CERTIFICATION</h4>
        <p className="text-lg text-justify leading-relaxed mb-4">
          <strong>यह प्रमाणित किया जाता है कि</strong> श्री/श्रीमती <strong className="text-red-600">{data.HOLDER_NAME}</strong> 
          पुत्र/पुत्री <strong>{data.FATHER_NAME}</strong> निवासी ग्राम पंचायत <strong>{data.GRAM_PANCHAYAT}</strong>, 
          तहसील <strong>{data.TEHSIL}</strong>, जिला <strong>{data.DISTRICT}<strong> मध्य प्रदेश</strong></strong> को उपरोक्त वर्णित 
          <strong className="text-red-600"> {data.TOTAL_AREA_SQFT} वर्ग फीट</strong> भूमि पर वन अधिकार अधिनियम, 2006 की 
          धारा 3(1)(क) के अंतर्गत व्यक्तिगत वन अधिकार प्रदान किया जाता है।
        </p>
        
      </div>

      {/* Footer with Seal, QR Code and Signature */}
      <div className="flex justify-between items-end mt-12">
        {/* Left Side - Gram Sabha Secretary */}
        <div className="text-center">
          <div className="w-32 h-32 border-4 border-black mb-4 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <img src={Seal} alt="Official Seal" className="w-24 h-24 object-contain mb-2" />
              {/* <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xs">OFFICIAL<br/>SEAL</span>
              </div> */}
            </div>
          </div>
          <div className="border-t-2 border-black pt-2">
            <p className="text-sm font-bold">ग्राम सभा सचिव</p>
            <p className="text-sm font-bold">GRAM SABHA SECRETARY</p>
          </div>
        </div>
        
        {/* Center - QR Code */}
        <div className="text-center mx-8">
          {qrCodeDataURL ? (
            <div>
              <img src={qrCodeDataURL} alt="QR Code" className="w-32 h-32 mx-auto border-2 border-black mb-2" />
              <p className="text-xs font-bold">वेरिफिकेशन के लिए स्कैन करें</p>
              <p className="text-xs font-bold">SCAN FOR VERIFICATION</p>
              <p className="text-xs font-bold bg-yellow-200 px-2 py-1 mt-1">ID: {data.id}</p>
            </div>
          ) : (
            <div className="w-32 h-32 border-4 border-black bg-white flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                  <span className="text-black font-bold text-xs text-center">QR<br/>CODE</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side - Tehsildar Signature */}
        <div className="text-center">
          <div className="w-32 h-32 border-4 border-black mb-4 bg-gray-50 flex items-center justify-center">
            <div className="text-center transform -rotate-12">
              <img src={TehsildarSignature} alt="Tehsildar Signature" className="w-24 h-16 object-contain mb-2" />
            </div>
          </div>
          <div className="border-t-2 border-black pt-2">
            <p className="text-sm font-bold">तहसीलदार</p>
            <p className="text-sm font-bold">TEHSILDAR</p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-8 pt-4 border-t-2 border-black text-center">
        <p className="text-sm text-gray-600">
          यह एक कंप्यूटर जनरेटेड दस्तावेज है / This is a computer generated document
        </p>
        <p className="text-xs text-gray-500 mt-2">
          जनरेशन तारीख / Generated on: {new Date().toLocaleDateString('hi-IN')} | 
          पट्टा संख्या / Title No: {data.id}
        </p>
      </div>
    </div>
  );
};


export default FraPattaTemplate;