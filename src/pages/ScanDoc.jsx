import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  FileText,
  ScanLine,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Camera,
  Map,
  FileSignature,
  Download,
  Eye,
  Sparkles,
  Shield,
  Clock,
} from 'lucide-react'
import FraPattaTemplate from '../components/FraPattaTemplate'
import { generatePDF, generatePDFFilename } from '../utils/pdfGenerator'
import { generateQRCode, generateFraId } from '../utils/fraUtils'

// Mock function to simulate API call for document analysis
const simulateDocumentAnalysis = (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: generateFraId(), // Add unique ID for the scanned document
        documentType: 'स्वामित्व प्रमाण पत्र',
        KHASRA_NO: "88/4",
        HOLDER_NAME: 'बुधनी बाई गोंड',
        FATHER_NAME: 'स्व. फूल सिंह गोंड',
        CASTE: "गोंड",
        CATEGORY: "अनुसूचित जनजाति",
        AGE: "52 वर्ष",
        DISTRICT: "मंडला",
        GRAM_PANCHAYAT: "भोजपुर",
        JANPAD_PANCHAYAT: "मानपुर",
        TEHSIL: "बिछिया",
        SERIAL_NO: "125/2025",
        DATE: "25/05/2019",
        WARD_NUMBER: "03",
        HOUSE_NUMBER: "42",
        VILLAGE: "भोजपुर",
        TOTAL_AREA_SQFT: "2500",
        BOUNDARY_EAST: "सुरेश वर्मा का मकान",
        BOUNDARY_WEST: "स्कूल की बाउंड्री",
        BOUNDARY_NORTH: "ग्राम पंचायत मार्ग",
        BOUNDARY_SOUTH: "नरेश तिवारी का खेत",
        confidenceScore: 94.7,
        verificationStatus: 'Verified'
      })
    }, 3000) // Simulate a 3-second scan for better UX
  })
}

// Function to generate PDF from the extracted data using FraPattaTemplate
const generatePattaPDF = async (data) => {
  try {
    // Generate QR Code for the data
    const qrCodeDataURL = await generateQRCode(data)
    
    // Return the generated filename for reference
    const filename = generatePDFFilename(data)
    
    return {
      success: true,
      filename,
      qrCodeDataURL,
      data
    }
  } catch (error) {
    console.error('Error in generatePattaPDF:', error)
    throw error
  }
}

// A simple, reusable Button component for demonstration
const Button = ({ children, variant = "default", size = "default", className = "", disabled = false, ...props }) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed'
  
  const variants = {
    default: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
    outline: 'border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-primary/50',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// New Camera Modal Component
const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          })
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
        } catch (err) {
          console.error("Camera access denied:", err)
          setError('Camera access was denied. Please enable camera permissions in your browser settings.')
        }
      }
      startCamera()
    } else {
      // Cleanup: stop the camera stream when the modal is closed
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
    }

    // Cleanup function to run when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isOpen]) // Effect runs when `isOpen` changes

  const handleCaptureClick = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      // Set canvas dimensions to match the video feed
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to a file blob
      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(capturedFile)
        onClose() // Close modal after capture
      }, 'image/jpeg')
    }
  }
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-card rounded-lg w-full max-w-2xl p-4 m-4 relative">
        <h3 className="text-lg font-medium mb-4 text-center">Position Document in Frame</h3>
        {error ? (
          <div className="text-center p-8 text-red-400">{error}</div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md bg-black" />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={handleCaptureClick} disabled={!stream} className="w-36">
            <Camera className="mr-2 h-4 w-4" /> Capture
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}


const ScanDoc = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')


  const handleFileDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResults(null) // Clear previous results
    }
  }, [])
  
  const handleCapture = useCallback((capturedFile) => {
    if (capturedFile) {
      setFile(capturedFile);
      setPreview(URL.createObjectURL(capturedFile));
      setResults(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return
    setIsAnalyzing(true)
    setResults(null)
    const analysisResults = await simulateDocumentAnalysis(file)
    setResults(analysisResults)
    setIsAnalyzing(false)
  }

  const handleClear = () => {
    if (preview) {
        URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setResults(null)
    setIsAnalyzing(false)
    setIsGeneratingPDF(false)
    setPdfGenerated(false)
  }

  const handleGeneratePatta = async () => {
    if (!results) return
    setIsGeneratingPDF(true)
    try {
      // First generate the data and QR code
      const pdfData = await generatePattaPDF(results)
      setQrCodeDataURL(pdfData.qrCodeDataURL)
      
      // Small delay to ensure the template is rendered with QR code
      setTimeout(async () => {
        try {
          // Use the actual PDF generation function from your utils
          const pdfResult = await generatePDF('fra-patta-template', pdfData.filename)
          
          if (pdfResult.success) {
            setPdfGenerated(true)
            // The generatePDF function handles the download automatically
            alert('PDF generated and downloaded successfully!')
          } else {
            alert(`Error generating PDF: ${pdfResult.message}`)
          }
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError)
          alert('Error generating PDF. Please try again.')
        } finally {
          setIsGeneratingPDF(false)
        }
      }, 500) // Small delay to ensure template rendering
      
    } catch (error) {
      console.error('Error in handleGeneratePatta:', error)
      alert('Error generating PDF. Please try again.')
      setIsGeneratingPDF(false)
    }
  }

  const handleViewInMap = () => {
    if (results && results.DISTRICT && results.VILLAGE) {
      navigate(`/atlas?district=${encodeURIComponent(results.DISTRICT)}&village=${encodeURIComponent(results.VILLAGE)}&khasra=${results.KHASRA_NO}`)
    } else {
      navigate('/atlas')
    }
  }

  return (
    <>
      {/* Hidden template for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {results && qrCodeDataURL && (
          <div id="fra-patta-wrapper">
            <FraPattaTemplate data={results} qrCodeDataURL={qrCodeDataURL} />
          </div>
        )}
      </div>

      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Document Scanner
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload or take a photo of your FRA document to automatically extract information and generate your digital Patta
            </p>
            <div className="flex items-center justify-center mt-6 gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Fast Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span>AI Verified</span>
              </div>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel: Uploader and Preview */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
              {!preview ? (
                <div className="h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div
                    {...getRootProps()}
                    className={`w-full flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                      isDragActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="p-8">
                      <UploadCloud className="w-20 h-20 text-gray-400 mb-6 mx-auto" />
                      <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        {isDragActive ? 'Drop your document here!' : 'Upload FRA Document'}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Drag & drop or click to select your document
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">PNG</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">JPG</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">PDF</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="my-6 flex items-center gap-4 w-full">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-gray-500 text-sm font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsCameraOpen(true)} 
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <Camera className="mr-2 h-5 w-5" /> Take Photo
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Document Preview</h3>
                  <div className="mb-6 overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg">
                    <img 
                      src={preview} 
                      alt="Document Preview" 
                      className="max-h-80 w-full object-contain" 
                    />
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing}
                      size="lg"
                      className="min-w-[160px]"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <ScanLine className="mr-2 h-5 w-5" /> Analyze Document
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleClear} 
                      disabled={isAnalyzing}
                      size="lg"
                    >
                      <Trash2 className="mr-2 h-5 w-5" /> Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Analysis Results */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-gray-800 dark:text-gray-100">
                <FileText className="mr-3 h-6 w-6 text-blue-600" />
                Extracted Information
              </h3>
              
              <div className="space-y-6">
                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                    <div className="relative mb-6">
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-200 animate-pulse"></div>
                    </div>
                    <p className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">
                      AI is analyzing your document...
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Please wait while we extract and verify the information
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                      <Sparkles className="w-4 h-4" />
                      <span>Using advanced OCR technology</span>
                    </div>
                  </div>
                )}

                {!isAnalyzing && !results && (
                  <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                    <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Upload a document to see extracted information here
                    </p>
                  </div>
                )}

                {results && (
                  <div className="space-y-6">
                    {/* Document Type Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                            {results.documentType}
                          </h4>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            Serial: {results.SERIAL_NO} • Date: {results.DATE}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {results.confidenceScore}% Match
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Data */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Document Details</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(results).map(([key, value]) => {
                          if (['documentType', 'confidenceScore', 'verificationStatus'].includes(key)) return null;
                          
                          return (
                            <div key={key} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
                                {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {value || 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-200">Document Verified</p>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            All information has been successfully extracted and verified
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <Button 
                        onClick={handleGeneratePatta}
                        disabled={isGeneratingPDF}
                        variant="success"
                        size="lg"
                        className="flex-1"
                      >
                        {isGeneratingPDF ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating PDF...
                          </>
                        ) : pdfGenerated ? (
                          <>
                            <Download className="mr-2 h-5 w-5" /> Generate Again
                          </>
                        ) : (
                          <>
                            <FileSignature className="mr-2 h-5 w-5" /> Generate Patta PDF
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleViewInMap}
                        size="lg"
                        className="flex-1 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                      >
                        <Map className="mr-2 h-5 w-5" /> View in Map
                      </Button>
                    </div>

                    {pdfGenerated && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="font-semibold text-blue-800 dark:text-blue-200">Patta Generated Successfully!</p>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                              Your official FRA Patta PDF has been generated and downloaded using the government template
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default ScanDoc