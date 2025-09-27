import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import applicantPhoto from '../assets/claim_photo.png';
import {
  UploadCloud,
  FileText,
  ScanLine,
  CheckCircle,
  Loader2,
  Trash2,
  Camera,
  Map,
  FileSignature,
  Download,
  ShieldCheck,
} from 'lucide-react';
import FraPattaTemplate from '../components/FraPattaTemplate';
import { generatePDF, generatePDFFilename } from '../utils/pdfGenerator';
import { generateQRCode, generateFraId } from '../utils/fraUtils';
import { Button } from '../components/ui/button'; // Using the consistent button

// --- Reusable Components for this page ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-800 flex items-center gap-3 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// --- Mock function (no changes) ---
const simulateDocumentAnalysis = (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: generateFraId(),
        applicantImage: applicantPhoto,
        documentType: 'स्वामित्व प्रमाण पत्र',
        KHASRA_NO: "88/4",
        HOLDER_NAME: 'बुधनी बाई गोंड',
        FATHER_NAME: 'स्व. फूल सिंह गोंड',
        CASTE: "गोंड",
        CATEGORY: " अनुसूचित जनजाति",
        AGE: "52 वर्ष",
        DISTRICT: "मंडला",
        GRAM_PANCHAYAT: "भोजपुर",
        VILLAGE: "भोजपुर",
        TOTAL_AREA_SQFT: "2500",
        BOUNDARY_EAST: "सुरेश वर्मा का मकान",
        BOUNDARY_WEST: "स्कूल की बाउंड्री",
        BOUNDARY_NORTH: "ग्राम पंचायत मार्ग",
        BOUNDARY_SOUTH: "नरेश तिवारी का खेत",
        confidenceScore: 94.7,
        verificationStatus: 'Verified'
      });
    }, 2500);
  });
};

const generatePattaPDF = async (data) => {
    const qrCodeDataURL = await generateQRCode(data);
    const filename = generatePDFFilename(data);
    return { success: true, filename, qrCodeDataURL, data };
};


const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(mediaStream => {
          setStream(mediaStream);
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
        })
        .catch(err => {
          console.error("Camera access denied:", err);
          setError('Camera access was denied. Please enable camera permissions in your browser settings.');
        });
    } else if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isOpen, stream]);

  const handleCaptureClick = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        onClose();
      }, 'image/jpeg');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 m-4 relative shadow-2xl">
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Position Document in Frame</h3>
        {error ? <div className="text-center p-8 text-red-500">{error}</div> : <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg bg-gray-900" />}
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={handleCaptureClick} disabled={!stream} className="w-36"><Camera className="mr-2 h-4 w-4" /> Capture</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

// --- Main ScanDoc Component ---
const ScanDoc = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');

  const handleFileDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResults(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResults(null);
    const analysisResults = await simulateDocumentAnalysis(file);
    setResults(analysisResults);
    setIsAnalyzing(false);
  };

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResults(null);
  };

  const handleGeneratePatta = async () => {
    if (!results) return;
    setIsGeneratingPDF(true);
    try {
      const { qrCodeDataURL: newQrCode, filename } = await generatePattaPDF(results);
      setQrCodeDataURL(newQrCode);
      
      setTimeout(async () => {
        try {
          await generatePDF('fra-patta-template', filename);
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
        } finally {
          setIsGeneratingPDF(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error in handleGeneratePatta:', error);
      setIsGeneratingPDF(false);
    }
  };

  const handleViewInMap = () => navigate(`/atlas?district=${encodeURIComponent(results.DISTRICT)}&village=${encodeURIComponent(results.VILLAGE)}&khasra=${results.KHASRA_NO}`);

  return (
    <>
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -10 }}><div id="fra-patta-template">{results && qrCodeDataURL && <FraPattaTemplate data={results} qrCodeDataURL={qrCodeDataURL} />}</div></div>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleFileDrop} />
      
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <header className="mb-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">AI Document Digitizer</h1>
            <p className="mt-1 text-sm text-gray-600">
              Automatically extract information from FRA documents to generate digital Pattas.
            </p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left Panel: Uploader */}
          <Card>
            <CardHeader>
                <CardTitle><UploadCloud className="w-5 h-5 text-gray-400" /> Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              {!preview ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div {...getRootProps()} className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${ isDragActive ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-400' }`}>
                    <input {...getInputProps()} />
                    <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="font-semibold text-gray-700">Drag & drop files here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <div className="my-4 flex items-center w-full">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                  <Button variant="outline" onClick={() => setIsCameraOpen(true)} className="w-full"><Camera className="mr-2 h-4 w-4" /> Use Camera</Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                    <img src={preview} alt="Document Preview" className="max-h-80 w-full object-contain" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="w-1/2"><ScanLine className="mr-2 h-4 w-4" /> Analyze</Button>
                    <Button variant="outline" onClick={handleClear} disabled={isAnalyzing} className="w-1/2"><Trash2 className="mr-2 h-4 w-4" /> Clear</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Results */}
          <Card>
            <CardHeader>
                <CardTitle><FileText className="w-5 h-5 text-gray-400" /> Extracted Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
                  <p className="mt-4 font-medium text-gray-700">AI is analyzing your document...</p>
                  <p className="text-sm text-gray-500">Extracting and verifying information.</p>
                </div>
              ) : !results ? (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <FileText className="w-12 h-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">Results will appear here after analysis.</p>
                </div>
              ) : (
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                            <img 
                                src={results.applicantImage} 
                                alt="Applicant" 
                                className="w-24 h-24 rounded-lg object-cover border bg-gray-200"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/EFEFEF/AAAAAA&text=Photo'; }}
                            />
                            <div className="flex-grow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-800">{results.HOLDER_NAME}</p>
                                        <p className="text-sm text-gray-500">{results.documentType}</p>
                                    </div>
                                    <span className="flex-shrink-0 flex items-center text-sm font-medium text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                                        {results.confidenceScore}% Match
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 space-y-1">
                                    <p><strong>Patta ID:</strong> {results.id}</p>
                                    <p><strong>Status:</strong> <span className="text-green-600 font-semibold">{results.verificationStatus}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {Object.entries(results).map(([key, value]) => {
                      if (['id', 'documentType', 'confidenceScore', 'verificationStatus', 'HOLDER_NAME', 'applicantImage'].includes(key)) return null;
                      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      return (
                        <div key={key}>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{formattedKey}</p>
                          <p className="text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-6 space-y-3">
                    <Button onClick={handleGeneratePatta} isLoading={isGeneratingPDF} className="w-full"><FileSignature className="mr-2 h-4 w-4" /> Generate Patta PDF</Button>
                    <Button variant="outline" onClick={handleViewInMap} className="w-full"><Map className="mr-2 h-4 w-4" /> View in Map</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default ScanDoc;

