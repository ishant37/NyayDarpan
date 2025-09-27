import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimsData } from '../data/pendingClaimsData';
import { Check, Upload, File, Trash2, ArrowLeft, Loader } from 'lucide-react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
        {children}
    </div>
);

const Button = ({ children, variant = "default", className = "", isLoading = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
  };
  return (
    <button className={`${baseClasses} ${variants[variant]} px-4 py-2 ${className}`} disabled={isLoading} {...props}>
      {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

const ClaimDetail = () => {
    const { claimId } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const foundClaim = claimsData.find(c => c.id === claimId);
        if (foundClaim) {
            setClaim(foundClaim);
        }
    }, [claimId]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (fileName) => {
        setUploadedFiles(uploadedFiles.filter(file => file.name !== fileName));
    };

    const handleCompleteStage = () => {
        setIsUploading(true);
        // Simulate an upload and state update
        setTimeout(() => {
            const currentStageIndex = claim.stages.findIndex(s => s.status === 'in_progress');
            if (currentStageIndex !== -1) {
                const newStages = [...claim.stages];
                newStages[currentStageIndex] = {
                    ...newStages[currentStageIndex],
                    status: 'completed',
                    date: new Date().toISOString().slice(0, 10),
                    documents: uploadedFiles.map(f => ({ name: f.name, url: '#' })),
                };

                if (currentStageIndex + 1 < newStages.length) {
                    newStages[currentStageIndex + 1] = {
                        ...newStages[currentStageIndex + 1],
                        status: 'in_progress',
                        date: new Date().toISOString().slice(0, 10),
                    };
                }
                
                setClaim({ ...claim, stages: newStages });
                setUploadedFiles([]);
            }
            setIsUploading(false);
        }, 1500);
    };

    if (!claim) {
        return <div className="flex justify-center items-center h-screen bg-gray-50"><p>Claim not found.</p></div>;
    }

    const activeStageIndex = claim.stages.findIndex(s => s.status === 'in_progress');

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Button variant="outline" onClick={() => navigate('/pending-claims')} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Claims List
                </Button>

                {/* Claim Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{claim.claimantName}</h1>
                    <p className="mt-1 text-sm text-gray-600">Claim ID: {claim.id} | Type: {claim.claimType} | Submitted: {claim.submittedDate}</p>
                </div>

                {/* Progress Tracker */}
                <div className="space-y-8">
                    {claim.stages.map((stage, index) => (
                        <div key={stage.id} className="flex gap-4">
                            {/* Icon and Connector */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                    stage.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 
                                    stage.status === 'in_progress' ? 'bg-yellow-500 border-yellow-500 text-white animate-pulse' :
                                    'bg-gray-100 border-gray-300 text-gray-400'
                                }`}>
                                    {stage.status === 'completed' ? <Check className="w-5 h-5" /> : <span>{stage.id}</span>}
                                </div>
                                {index < claim.stages.length - 1 && (
                                    <div className={`w-0.5 flex-1 ${stage.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                )}
                            </div>

                            {/* Stage Details Card */}
                            <div className="flex-1">
                                <Card className={stage.status === 'in_progress' ? 'border-yellow-500' : ''}>
                                    <div className="p-6">
                                        <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Status: <span className={`font-medium ${
                                                stage.status === 'completed' ? 'text-green-600' :
                                                stage.status === 'in_progress' ? 'text-yellow-600' :
                                                'text-gray-500'
                                            }`}>{stage.status.replace('_', ' ')}</span>
                                            {stage.date && ` on ${stage.date}`}
                                        </p>

                                        {stage.documents.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-xs font-medium text-gray-500 mb-2">VERIFIED DOCUMENTS</p>
                                                <div className="space-y-2">
                                                    {stage.documents.map(doc => (
                                                        <a href={doc.url} key={doc.name} className="flex items-center text-sm text-blue-600 hover:underline">
                                                            <File className="w-4 h-4 mr-2" /> {doc.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {stage.status === 'in_progress' && (
                                            <div className="mt-6 border-t pt-6">
                                                <h4 className="font-semibold text-gray-700 mb-2">Action Required: Upload Evidence</h4>
                                                <p className="text-sm text-gray-500 mb-4">Upload documents to verify the completion of this stage.</p>
                                                
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                                    <label htmlFor="file-upload" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                                        <span>Upload files</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                                                </div>

                                                {uploadedFiles.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                                                        <div className="space-y-2">
                                                            {uploadedFiles.map(file => (
                                                                <div key={file.name} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
                                                                    <span className="text-gray-800 truncate">{file.name}</span>
                                                                    <button onClick={() => removeFile(file.name)}>
                                                                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <Button className="mt-6 w-full" onClick={handleCompleteStage} isLoading={isUploading} disabled={uploadedFiles.length === 0}>
                                                    Complete Stage & Move to Next
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClaimDetail;
