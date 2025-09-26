"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, MapPin, TreePine, Droplets, Wheat, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"

const schemeData = [
  {
    name: "PM-KISAN",
    status: "Eligible",
    description: "Direct income support to farmers",
    statusColor: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    name: "Jal Jeevan Mission",
    status: "Recommended",
    description: "Functional household tap connections",
    statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <Droplets className="w-4 h-4" />,
    hasMapAction: true,
  },
  {
    name: "MGNREGA",
    status: "Active",
    description: "Rural employment guarantee scheme",
    statusColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    name: "DAJGUA",
    status: "Eligible",
    description: "Development of Antyodaya and Priority Households",
    statusColor: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    name: "PMAY-G",
    status: "Under Review",
    description: "Housing for rural poor",
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: <Clock className="w-4 h-4" />,
  },
]

export function DecisionSupportPanel({ polygonData, onClose }) {
  if (!polygonData) return null

  const handleShowNearbyAssets = (schemeName) => {
    // This would integrate with the map to show nearby assets
    console.log(`Showing nearby ${schemeName} assets on map`)
  }

  return (
    <div className="h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Decision Support System</h2>
            <p className="text-sm text-muted-foreground">AI-powered recommendations</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Selected Parcel Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Patta ID: {polygonData.id}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Holder: {polygonData.holderName}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Area</p>
                <p className="text-sm font-medium">{polygonData.area} Hectares</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Claim Type</p>
                <Badge variant="outline" className="text-xs">
                  {polygonData.type}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                className={`text-xs ${
                  polygonData.status === "Approved"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : polygonData.status === "Pending"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                {polygonData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Land & Asset Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Land & Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">AI-Detected Assets:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>1 Pond (Water Body)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wheat className="w-4 h-4 text-yellow-500" />
                  <span>2.5 Ha Farmland</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TreePine className="w-4 h-4 text-green-500" />
                  <span>Dense Forest Cover (60%)</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Land Classification:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary p-2 rounded">
                  <p className="text-muted-foreground">Agricultural</p>
                  <p className="font-medium">2.5 Ha (100%)</p>
                </div>
                <div className="bg-secondary p-2 rounded">
                  <p className="text-muted-foreground">Forest</p>
                  <p className="font-medium">1.5 Ha (60%)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheme Eligibility & Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Scheme Eligibility & Recommendations</CardTitle>
            <p className="text-xs text-muted-foreground">Based on land assets and beneficiary profile</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {schemeData.map((scheme, index) => (
              <div key={index} className="border border-border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {scheme.icon}
                    <h4 className="text-sm font-medium">{scheme.name}</h4>
                  </div>
                  <Badge className={`text-xs ${scheme.statusColor}`}>{scheme.status}</Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-3">{scheme.description}</p>

                {scheme.hasMapAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs bg-transparent"
                    onClick={() => handleShowNearbyAssets(scheme.name)}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Show nearby {scheme.name} assets on map
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-400 font-medium mb-1">High Priority Recommendation</p>
              <p className="text-xs text-muted-foreground">
                This parcel shows optimal conditions for Jal Jeevan Mission implementation. Proximity to water source
                and agricultural land makes it ideal for tap connection infrastructure.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-400 font-medium mb-1">Compliance Status</p>
              <p className="text-xs text-muted-foreground">
                All environmental clearances are in place. Forest cover percentage meets FRA requirements.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DecisionSupportPanel
