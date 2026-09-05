export const ILLUSTRATIVE_HOSPITALS = [
  {
    id: "harbourview",
    name: "Harbourview Medical Centre",
    location: "Vashi, Navi Mumbai",
    type: "Multi-specialty",
    specialties: ["Cardiology", "General medicine"],
    facilities: ["Cardiac care", "Critical care"],
    sourceState: "Demonstration data",
    lastChecked: "02 Sep 2026",
  },
  {
    id: "navicare",
    name: "NaviCare Multispeciality",
    location: "Nerul, Navi Mumbai",
    type: "Specialty hospital",
    specialties: ["Cardiology", "Paediatrics"],
    facilities: ["Critical care", "Diagnostics"],
    sourceState: "Demonstration data",
    lastChecked: "28 Aug 2026",
  },
];

export const DISCOVERY_CATEGORIES = [
  "Cardiology", "Neurology", "Paediatrics", "Orthopaedics", "Diagnostics", "Emergency care"
];

export const COMPARISON_ROWS = [
  { label: "Hospital type", first: "Multi-specialty", second: "Specialty hospital" },
  { label: "Cardiology", first: "Listed", second: "Listed" },
  { label: "Critical care", first: "Listed", second: "Listed" },
  { label: "Emergency information", first: "Not provided", second: "Listed in demo" },
  { label: "Source", first: "Demonstration record", second: "Demonstration record" },
  { label: "Last checked", first: "02 Sep 2026", second: "28 Aug 2026" },
];
