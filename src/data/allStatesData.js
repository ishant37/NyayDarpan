// src/data/allStatesData.js

export const allStatesData = {
  "madhya-pradesh": {
    claimsReceived: {
      individual: 585326,
      community: 42187,
      total: 627513,
    },
    titlesDistributed: {
      individual: 266901,
      community: 27976,
      total: 294877,
    },
    landDistributedAcres: {
      individual: 903533.06,
      community: 788651.25,
      total: 1692184.31,
    },
    districtPerformance: [
        { name: 'Mandla', claimsReceived: 120000, titlesDistributed: 65000 },
        { name: 'Dindori', claimsReceived: 110000, titlesDistributed: 58000 },
        { name: 'Balaghat', claimsReceived: 95000, titlesDistributed: 55000 },
        { name: 'Betul', claimsReceived: 89000, titlesDistributed: 48000 },
    ],
    tribalCommunityDistribution: [
        { name: 'Gond', percentage: 45 },
        { name: 'Bhil', percentage: 21 },
        { name: 'Kol', percentage: 12 },
        { name: 'Korku', percentage: 8 },
        { name: 'Sahariya', percentage: 5 },
        { name: 'Others', percentage: 9 },
    ],
    districts: [
      { name: "Betul", pattas: 150 },
      { name: "Khandwa", pattas: 125 },
      { name: "Chhindwara", pattas: 200 },
    ],
    monthlyData: [
      { month: "Jan", approved: 78, pending: 45, rejected: 12 },
      { month: "Feb", approved: 82, pending: 42, rejected: 15 },
      { month: "Mar", approved: 89, pending: 38, rejected: 10 },
    ],
  },
  "odisha": {
    claimsReceived: {
      individual: 732530,
      community: 35843,
      total: 768373,
    },
    titlesDistributed: {
      individual: 463129,
      community: 8990,
      total: 472119,
    },
    landDistributedAcres: {
      individual: 676078.86,
      community: 763729.00,
      total: 1439807.86,
    },
    districtPerformance: [
        { name: 'Mayurbhanj', claimsReceived: 150000, titlesDistributed: 110000 },
        { name: 'Sundargarh', claimsReceived: 130000, titlesDistributed: 95000 },
        { name: 'Koraput', claimsReceived: 115000, titlesDistributed: 85000 },
        { name: 'Kandhamal', claimsReceived: 105000, titlesDistributed: 78000 },
    ],
    tribalCommunityDistribution: [
        { name: 'Kondha', percentage: 35 },
        { name: 'Santal', percentage: 22 },
        { name: 'Saura', percentage: 15 },
        { name: 'Gond', percentage: 10 },
        { name: 'Munda', percentage: 7 },
        { name: 'Others', percentage: 11 },
    ],
    districts: [
      { name: "Koraput", pattas: 180 },
      { name: "Mayurbhanj", pattas: 210 },
      { name: "Sundargarh", pattas: 130 },
    ],
    monthlyData: [
      { month: "Jan", approved: 65, pending: 35, rejected: 8 },
      { month: "Feb", approved: 70, pending: 32, rejected: 10 },
      { month: "Mar", approved: 75, pending: 28, rejected: 7 },
    ],
  },
  "telangana": {
    claimsReceived: {
      individual: 651822,
      community: 3427,
      total: 655249,
    },
    titlesDistributed: {
      individual: 230735,
      community: 721,
      total: 231456,
    },
    landDistributedAcres: {
      individual: 669689.14,
      community: 60468.77,
      total: 730157.91,
    },
     districtPerformance: [
        { name: 'Bhadradri', claimsReceived: 180000, titlesDistributed: 90000 },
        { name: 'Adilabad', claimsReceived: 165000, titlesDistributed: 82000 },
        { name: 'Komaram Bheem', claimsReceived: 140000, titlesDistributed: 75000 },
        { name: 'Mahabubabad', claimsReceived: 120000, titlesDistributed: 65000 },
    ],
    tribalCommunityDistribution: [
        { name: 'Koya', percentage: 42 },
        { name: 'Gond', percentage: 25 },
        { name: 'Lambadi', percentage: 18 },
        { name: 'Yerukula', percentage: 7 },
        { name: 'Pradhan', percentage: 4 },
        { name: 'Others', percentage: 4 },
    ],
    districts: [
      { name: "Adilabad", pattas: 180 },
      { name: "Bhadradri Kothagudem", pattas: 210 },
      { name: "Komaram Bheem", pattas: 100 },
    ],
    monthlyData: [
      { month: "Jan", approved: 50, pending: 30, rejected: 8 },
      { month: "Feb", approved: 55, pending: 28, rejected: 10 },
      { month: "Mar", approved: 62, pending: 25, rejected: 7 },
    ],
  },
  "rajasthan": {
    claimsReceived: { individual: 113162, community: 5213, total: 118375 },
    titlesDistributed: { individual: 49215, community: 2551, total: 51766 },
    landDistributedAcres: { individual: 70387.18, community: 239763.95, total: 310151.13 },
    districtPerformance: [
        { name: 'Udaipur', claimsReceived: 45000, titlesDistributed: 20000 },
        { name: 'Banswara', claimsReceived: 35000, titlesDistributed: 15000 },
        { name: 'Dungarpur', claimsReceived: 25000, titlesDistributed: 10000 },
        { name: 'Pratapgarh', claimsReceived: 13375, titlesDistributed: 6766 },
    ],
    tribalCommunityDistribution: [
        { name: 'Meena', percentage: 52 },
        { name: 'Bhil', percentage: 39 },
        { name: 'Garasia', percentage: 5 },
        { name: 'Damor', percentage: 2 },
        { name: 'Sahariya', percentage: 1 },
        { name: 'Others', percentage: 1 },
    ],
    districts: [
      { name: "Udaipur", pattas: 120 },
      { name: "Banswara", pattas: 150 },
    ],
    monthlyData: [
      { month: "Jan", approved: 30, pending: 20, rejected: 5 },
      { month: "Feb", approved: 35, pending: 18, rejected: 7 },
      { month: "Mar", approved: 42, pending: 15, rejected: 4 },
    ],
  }
};

