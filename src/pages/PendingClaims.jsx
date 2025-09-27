import React from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsData } from '../data/pendingClaimsData';
import { ChevronRight, User, Users } from 'lucide-react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
        {children}
    </div>
);

const getStatusBadge = (stages) => {
    const inProgressStage = stages.find(s => s.status === 'in_progress');
    if (inProgressStage) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {inProgressStage.name}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown Stage
        </span>
    );
};

const ClaimTypeIcon = ({ type }) => {
    if (type === 'IFR') {
        return <User className="w-5 h-5 text-blue-500" />;
    }
    return <Users className="w-5 h-5 text-green-500" />;
};

const PendingClaims = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pending Claims</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Review and process all claims that are currently awaiting action.
                    </p>
                </div>

                <Card>
                    <div className="divide-y divide-gray-200">
                        {claimsData.map((claim) => (
                            <div
                                key={claim.id}
                                onClick={() => navigate(`/pending-claims/${claim.id}`)}
                                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-100 rounded-full">
                                        <ClaimTypeIcon type={claim.claimType} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{claim.claimantName}</p>
                                        <p className="text-sm text-gray-500">{claim.village}, {claim.district}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {getStatusBadge(claim.stages)}
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PendingClaims;
