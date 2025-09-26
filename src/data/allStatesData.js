// src/data/allStatesData.js

export const allStatesData = {
  "madhya-pradesh": {
    totalPattas: 874,
    recentPattas: 120,
    pendingVerification: 88,
    cfrAreaHa: 2847,
    districts: [
      { name: "Betul", pattas: 150 },
      { name: "Khandwa", pattas: 125 },
      { name: "Chhindwara", pattas: 200 },
      { name: "Balaghat", pattas: 180 },
      { name: "Mandla", pattas: 119 },
      { name: "Dindori", pattas: 100 },
    ],
    monthlyData: [
      { month: "Jan", approved: 78, pending: 45, rejected: 12 },
      { month: "Feb", approved: 82, pending: 42, rejected: 15 },
      { month: "Mar", approved: 89, pending: 38, rejected: 10 },
      { month: "Apr", approved: 95, pending: 35, rejected: 8 },
      { month: "May", approved: 92, pending: 40, rejected: 11 },
      { month: "Jun", approved: 98, pending: 32, rejected: 9 },
      { month: "Jul", approved: 105, pending: 28, rejected: 7 },
    ],
  },
  "telangana": {
    totalPattas: 620,
    recentPattas: 95,
    pendingVerification: 65,
    cfrAreaHa: 1950,
    districts: [
      { name: "Adilabad", pattas: 180 },
      { name: "Bhadradri Kothagudem", pattas: 210 },
      { name: "Jayashankar Bhupalpally", pattas: 130 },
      { name: "Komaram Bheem", pattas: 100 },
    ],
    monthlyData: [
      { month: "Jan", approved: 50, pending: 30, rejected: 8 },
      { month: "Feb", approved: 55, pending: 28, rejected: 10 },
      { month: "Mar", approved: 62, pending: 25, rejected: 7 },
      { month: "Apr", approved: 68, pending: 22, rejected: 5 },
      { month: "May", approved: 65, pending: 27, rejected: 9 },
      { month: "Jun", approved: 70, pending: 20, rejected: 6 },
      { month: "Jul", approved: 75, pending: 18, rejected: 4 },
    ],
  },
  "rajasthan": {
    totalPattas: 450,
    recentPattas: 70,
    pendingVerification: 50,
    cfrAreaHa: 1500,
    districts: [
      { name: "Udaipur", pattas: 120 },
      { name: "Banswara", pattas: 150 },
      { name: "Dungarpur", pattas: 100 },
      { name: "Pratapgarh", pattas: 80 },
    ],
    monthlyData: [
      { month: "Jan", approved: 30, pending: 20, rejected: 5 },
      { month: "Feb", approved: 35, pending: 18, rejected: 7 },
      { month: "Mar", approved: 42, pending: 15, rejected: 4 },
      { month: "Apr", approved: 48, pending: 12, rejected: 2 },
      { month: "May", approved: 45, pending: 17, rejected: 6 },
      { month: "Jun", approved: 50, pending: 10, rejected: 3 },
      { month: "Jul", approved: 55, pending: 8, rejected: 1 },
    ],
  },
  // Add other states similarly
  "odisha": { /* ...data... */ },
  "tripura": { /* ...data... */ },
};

// Add default data for states not fully defined
['odisha', 'tripura'].forEach(state => {
  if (!allStatesData[state]) {
    allStatesData[state] = {
      totalPattas: Math.floor(Math.random() * 500) + 200,
      recentPattas: Math.floor(Math.random() * 100) + 20,
      pendingVerification: Math.floor(Math.random() * 80) + 10,
      cfrAreaHa: Math.floor(Math.random() * 1500) + 1000,
      districts: [{ name: "Default District 1", pattas: 100 }, { name: "Default District 2", pattas: 150 }],
      monthlyData: allStatesData['rajasthan'].monthlyData.map(d => ({ ...d, approved: d.approved * 0.8 }))
    };
  }
});