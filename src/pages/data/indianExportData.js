// src/components/public/data/indianExportData.js

export const indianProducts = {
  pomegranate: {
    name: "Premium Pomegranate",
    varieties: ["Bhagwa", "Ganesh", "Arakta", "Mridula"],
    seasons: { harvest: "June-March", peak: "September-December" },
    states: ["Maharashtra", "Karnataka", "Gujarat", "Andhra Pradesh"],
    grades: ["Grade A", "Export Quality", "Organic"],
    priceRange: { min: 80, max: 180 } // per kg
  },
  cardamom: {
    name: "Cardamom (Elaichi)",
    varieties: ["Green", "Black", "White", "Nepali"],
    seasons: { harvest: "August-March", peak: "October-December" },
    states: ["Kerala", "Karnataka", "Tamil Nadu"],
    grades: ["Extra Bold", "Bold", "Superior", "Green"],
    priceRange: { min: 1200, max: 2800 } // per kg
  },
  granite: {
    name: "Granite & Marble",
    varieties: ["Absolute Black", "Kashmir White", "Imperial Red", "Tan Brown"],
    seasons: { harvest: "All Year", peak: "All Year" },
    states: ["Rajasthan", "Karnataka", "Andhra Pradesh", "Tamil Nadu"],
    grades: ["Premium", "Standard", "Commercial"],
    priceRange: { min: 1500, max: 8500 } // per sqm
  },
  medicines: {
    name: "Generic Medicines",
    varieties: ["Pharmaceuticals", "Ayurvedic", "Biotech", "Vaccines"],
    seasons: { harvest: "All Year", peak: "All Year" },
    states: ["Maharashtra", "Gujarat", "Telangana", "Himachal Pradesh"],
    grades: ["WHO-GMP", "US-FDA", "CE Certified", "ISO Certified"],
    priceRange: { min: 50, max: 5000 } // per unit
  },
  agroProducts: {
    name: "Agro Products",
    varieties: ["Basmati Rice", "Wheat", "Pulses", "Spices"],
    seasons: { harvest: "Various", peak: "Various" },
    states: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh"],
    grades: ["Organic", "Premium", "Export Quality"],
    priceRange: { min: 40, max: 400 } // per kg
  },
  electricToys: {
    name: "Electric Kids Toys",
    varieties: ["Educational", "Remote Control", "Robotic", "Interactive"],
    seasons: { harvest: "All Year", peak: "Diwali/Christmas" },
    states: ["Delhi", "Maharashtra", "Gujarat", "Tamil Nadu"],
    grades: ["CE Certified", "ISO Certified", "BIS Approved"],
    priceRange: { min: 200, max: 5000 } // per unit
  },
  onions: {
    name: "Onions",
    varieties: ["Nasik Red", "Pune White", "Bangalore Rose"],
    seasons: { harvest: "Multiple", peak: "October-March" },
    states: ["Maharashtra", "Karnataka", "Gujarat", "Madhya Pradesh"],
    grades: ["Grade A", "Export Quality"],
    priceRange: { min: 15, max: 80 } // per kg
  },
  redChilly: {
    name: "Red Chilly",
    varieties: ["Teja", "Byadgi", "Kashmiri", "Guntur"],
    seasons: { harvest: "December-April", peak: "January-March" },
    states: ["Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu"],
    grades: ["Extra Hot", "Medium Hot", "Mild"],
    priceRange: { min: 120, max: 350 } // per kg
  },
  grapes: {
    name: "Grapes",
    varieties: ["Thompson Seedless", "Sharad Seedless", "Bangalore Blue"],
    seasons: { harvest: "December-April", peak: "January-March" },
    states: ["Maharashtra", "Karnataka", "Andhra Pradesh", "Tamil Nadu"],
    grades: ["Premium", "Export Quality", "Organic"],
    priceRange: { min: 60, max: 180 } // per kg
  }
};

export const indianFarmsAndFactories = [
  {
    id: 1,
    name: "Maharashtra Pomegranate Farms",
    type: "farm",
    product: "pomegranate",
    state: "Maharashtra",
    city: "Solapur",
    capacity: "500 tons/month",
    certification: ["APEDA", "ISO 22000", "Organic"],
    established: 2015,
    workers: 120,
    coordinates: [17.6599, 75.9064]
  },
  {
    id: 2,
    name: "Kerala Cardamom Estates",
    type: "farm",
    product: "cardamom",
    state: "Kerala",
    city: "Idukki",
    capacity: "20 tons/month",
    certification: ["Spices Board", "Fair Trade", "Organic"],
    established: 1985,
    workers: 80,
    coordinates: [9.8496, 76.9574]
  },
  {
    id: 3,
    name: "Rajasthan Granite Works",
    type: "factory",
    product: "granite",
    state: "Rajasthan",
    city: "Udaipur",
    capacity: "10000 sqm/month",
    certification: ["ISO 9001", "BIS", "CE Marking"],
    established: 2002,
    workers: 200,
    coordinates: [24.5854, 73.7125]
  },
  {
    id: 4,
    name: "Gujarat Pharmaceutical Unit",
    type: "factory",
    product: "medicines",
    state: "Gujarat",
    city: "Ahmedabad",
    capacity: "5 million units/month",
    certification: ["WHO-GMP", "US-FDA", "ISO 13485"],
    established: 1998,
    workers: 350,
    coordinates: [23.0225, 72.5714]
  },
  {
    id: 5,
    name: "Karnataka Agro Processing",
    type: "processing",
    product: "agroProducts",
    state: "Karnataka",
    city: "Belagavi",
    capacity: "1000 tons/month",
    certification: ["FSSAI", "APEDA", "Organic"],
    established: 2010,
    workers: 150,
    coordinates: [15.8497, 74.4977]
  },
  {
    id: 6,
    name: "Delhi Toy Manufacturing",
    type: "factory",
    product: "electricToys",
    state: "Delhi",
    city: "Okhla",
    capacity: "50000 units/month",
    certification: ["BIS", "CE", "ISO 9001"],
    established: 2012,
    workers: 180,
    coordinates: [28.5355, 77.2650]
  },
  {
    id: 7,
    name: "Nasik Onion Farms",
    type: "farm",
    product: "onions",
    state: "Maharashtra",
    city: "Nashik",
    capacity: "1000 tons/month",
    certification: ["APEDA", "FSSAI", "GlobalGAP"],
    established: 2008,
    workers: 95,
    coordinates: [20.0112, 73.7902]
  },
  {
    id: 8,
    name: "Andhra Chilly Fields",
    type: "farm",
    product: "redChilly",
    state: "Andhra Pradesh",
    city: "Guntur",
    capacity: "200 tons/month",
    certification: ["Spices Board", "Organic", "ISO 22000"],
    established: 1995,
    workers: 110,
    coordinates: [16.3067, 80.4365]
  },
  {
    id: 9,
    name: "Maharashtra Vineyards",
    type: "farm",
    product: "grapes",
    state: "Maharashtra",
    city: "Sangli",
    capacity: "300 tons/month",
    certification: ["APEDA", "GlobalGAP", "Organic"],
    established: 2005,
    workers: 130,
    coordinates: [16.8524, 74.5815]
  }
];

export const exportDestinations = [
  { country: "UAE", city: "Dubai", products: ["pomegranate", "granite", "medicines", "onions"], volume: "High" },
  { country: "USA", city: "New York", products: ["cardamom", "medicines", "agroProducts"], volume: "Medium" },
  { country: "UK", city: "London", products: ["electricToys", "grapes", "spices"], volume: "Medium" },
  { country: "Germany", city: "Hamburg", products: ["granite", "medicines", "agroProducts"], volume: "Medium" },
  { country: "Japan", city: "Tokyo", products: ["grapes", "cardamom", "medicines"], volume: "Low" },
  { country: "Australia", city: "Sydney", products: ["pomegranate", "onions", "agroProducts"], volume: "Medium" },
  { country: "Singapore", city: "Singapore", products: ["electricToys", "medicines", "spices"], volume: "High" },
  { country: "Saudi Arabia", city: "Riyadh", products: ["pomegranate", "onions", "grapes"], volume: "High" }
];

// Generate massive order data
export const generateIndianOrders = (count = 100) => {
  const clients = [
    "Dubai Spice Traders LLC", "Al Maya Supermarket Dubai", "Lulu Group International",
    "Carrefour UAE", "Choithram Dubai", "West Zone Supermarket", "Union Coop Dubai",
    "Sharjah Cooperative Society", "Abu Dhabi Cooperative Society", "Spinneys Dubai",
    "Waitrose UAE", "Kibsons International", "Al Adil Trading Dubai"
  ];
  
  const products = Object.keys(indianProducts);
  
  return Array.from({ length: count }, (_, i) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const productData = indianProducts[product];
    const quantity = Math.floor(Math.random() * 1000) + 50;
    const pricePerUnit = (Math.random() * (productData.priceRange.max - productData.priceRange.min)) + productData.priceRange.min;
    const totalValue = quantity * pricePerUnit;
    
    return {
      id: `IN-ORD-${2024000 + i}`,
      client: clients[Math.floor(Math.random() * clients.length)],
      product: productData.name,
      productCategory: product,
      quantity: `${quantity} ${product === 'granite' ? 'sqm' : product === 'electricToys' ? 'units' : 'kg'}`,
      value: `$${totalValue.toLocaleString()}`,
      valueNumber: totalValue,
      timestamp: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      destination: "Dubai, UAE",
      status: Math.random() > 0.2 ? "completed" : "processing",
      shipmentId: `SHIP-IN-${1000 + i}`,
      origin: indianFarmsAndFactories[Math.floor(Math.random() * indianFarmsAndFactories.length)].city + ", India"
    };
  });
};

export const indianCertifications = [
  {
    id: 1,
    name: "APEDA Certified",
    issuer: "Agricultural and Processed Food Products Export Development Authority",
    image: "/certifications/apeda.png",
    description: "Government of India Certified Export Quality",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 2,
    name: "FSSAI Licensed",
    issuer: "Food Safety and Standards Authority of India",
    image: "/certifications/fssai.png",
    description: "Food Safety and Standards Compliance",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 3,
    name: "Spices Board India",
    issuer: "Ministry of Commerce and Industry, Government of India",
    image: "/certifications/spices-board.png",
    description: "Quality Certified Spices Export",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 4,
    name: "ISO 22000:2018",
    issuer: "International Organization for Standardization",
    image: "/certifications/iso22000.png",
    description: "Food Safety Management System",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 5,
    name: "WHO-GMP Certified",
    issuer: "World Health Organization",
    image: "/certifications/who-gmp.png",
    description: "Good Manufacturing Practices for Pharmaceuticals",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 6,
    name: "Organic India Certified",
    issuer: "National Program for Organic Production",
    image: "/certifications/organic-india.png",
    description: "100% Organic Farming Practices",
    verified: true,
    verificationUrl: "#"
  }
];

export const blockchainBatches = [
  {
    batchId: "BATCH-KSH-2024-001",
    farm: "Maharashtra Pomegranate Farms",
    harvestDate: "2024-02-15",
    quantity: "5000 kg",
    qualityScore: 94,
    transactions: [
      {
        step: "Harvest & Quality Check",
        timestamp: "2024-02-15 08:30",
        location: "Solapur, Maharashtra",
        verified: true
      },
      {
        step: "Processing & Packaging",
        timestamp: "2024-02-16 14:20",
        location: "Pune Processing Unit",
        verified: true
      },
      {
        step: "Customs Clearance",
        timestamp: "2024-02-18 11:45",
        location: "Mumbai Port",
        verified: true
      },
      {
        step: "Shipment Departure",
        timestamp: "2024-02-19 16:30",
        location: "JNPT Mumbai → Dubai",
        verified: true
      },
      {
        step: "Arrival & Distribution",
        timestamp: "2024-02-25 09:15",
        location: "Dubai Distribution Center",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-CRD-2024-002",
    farm: "Kerala Cardamom Estates",
    harvestDate: "2024-01-22",
    quantity: "800 kg",
    qualityScore: 96,
    transactions: [
      {
        step: "Harvest & Drying",
        timestamp: "2024-01-22 07:45",
        location: "Idukki, Kerala",
        verified: true
      },
      {
        step: "Quality Grading",
        timestamp: "2024-01-24 10:30",
        location: "Kochi Processing Center",
        verified: true
      },
      {
        step: "Export Packaging",
        timestamp: "2024-01-25 15:20",
        location: "Cochin Port",
        verified: true
      },
      {
        step: "International Shipping",
        timestamp: "2024-01-27 12:00",
        location: "Cochin → London",
        verified: true
      },
      {
        step: "UK Customs Clearance",
        timestamp: "2024-02-05 08:45",
        location: "London Port",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-GRN-2024-003",
    farm: "Rajasthan Granite Works",
    harvestDate: "2024-03-01",
    quantity: "2500 sqm",
    qualityScore: 92,
    transactions: [
      {
        step: "Quarry Extraction",
        timestamp: "2024-03-01 09:00",
        location: "Udaipur Quarry, Rajasthan",
        verified: true
      },
      {
        step: "Processing & Polishing",
        timestamp: "2024-03-05 16:45",
        location: "Udaipur Factory",
        verified: true
      },
      {
        step: "Quality Inspection",
        timestamp: "2024-03-08 11:30",
        location: "Quality Control Lab",
        verified: true
      },
      {
        step: "Container Loading",
        timestamp: "2024-03-10 14:15",
        location: "Mundra Port, Gujarat",
        verified: true
      },
      {
        step: "Shipping to Saudi Arabia",
        timestamp: "2024-03-12 10:00",
        location: "Mundra → Riyadh",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-MED-2024-004",
    farm: "Gujarat Pharmaceutical Unit",
    harvestDate: "2024-02-28",
    quantity: "50,000 units",
    qualityScore: 98,
    transactions: [
      {
        step: "Manufacturing Completion",
        timestamp: "2024-02-28 13:20",
        location: "Ahmedabad Factory",
        verified: true
      },
      {
        step: "Quality Control Testing",
        timestamp: "2024-03-01 10:45",
        location: "QC Laboratory",
        verified: true
      },
      {
        step: "Regulatory Clearance",
        timestamp: "2024-03-03 15:30",
        location: "CDSCO Office, Delhi",
        verified: true
      },
      {
        step: "Air Freight Dispatch",
        timestamp: "2024-03-05 08:00",
        location: "Delhi Airport → Singapore",
        verified: true
      },
      {
        step: "Received at Distribution",
        timestamp: "2024-03-06 16:20",
        location: "Singapore Medical Center",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-AGR-2024-005",
    farm: "Karnataka Agro Processing",
    harvestDate: "2024-02-20",
    quantity: "10,000 kg",
    qualityScore: 91,
    transactions: [
      {
        step: "Harvest & Collection",
        timestamp: "2024-02-20 07:30",
        location: "Belagavi Farms, Karnataka",
        verified: true
      },
      {
        step: "Processing & Milling",
        timestamp: "2024-02-22 12:15",
        location: "Processing Plant",
        verified: true
      },
      {
        step: "Quality Certification",
        timestamp: "2024-02-24 09:45",
        location: "APEDA Office, Bangalore",
        verified: true
      },
      {
        step: "Container Shipment",
        timestamp: "2024-02-26 14:00",
        location: "Chennai Port → Sydney",
        verified: true
      },
      {
        step: "Australian Import Clearance",
        timestamp: "2024-03-10 11:30",
        location: "Sydney Port, Australia",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-TOY-2024-006",
    farm: "Delhi Toy Manufacturing",
    harvestDate: "2024-03-05",
    quantity: "25,000 units",
    qualityScore: 93,
    transactions: [
      {
        step: "Manufacturing Completion",
        timestamp: "2024-03-05 16:00",
        location: "Okhla Industrial Area, Delhi",
        verified: true
      },
      {
        step: "Safety Testing",
        timestamp: "2024-03-07 11:20",
        location: "BIS Testing Lab",
        verified: true
      },
      {
        step: "Export Packaging",
        timestamp: "2024-03-09 14:45",
        location: "Delhi Export Hub",
        verified: true
      },
      {
        step: "Air Cargo Dispatch",
        timestamp: "2024-03-11 09:30",
        location: "Delhi Airport → New York",
        verified: true
      },
      {
        step: "US Customs Clearance",
        timestamp: "2024-03-12 18:15",
        location: "JFK Airport, New York",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-ONI-2024-007",
    farm: "Nasik Onion Farms",
    harvestDate: "2024-02-25",
    quantity: "15,000 kg",
    qualityScore: 89,
    transactions: [
      {
        step: "Harvest & Sorting",
        timestamp: "2024-02-25 06:45",
        location: "Nashik Farms, Maharashtra",
        verified: true
      },
      {
        step: "Cold Storage Processing",
        timestamp: "2024-02-26 15:30",
        location: "Cold Storage Facility",
        verified: true
      },
      {
        step: "Export Clearance",
        timestamp: "2024-02-28 10:15",
        location: "APMC Market, Nashik",
        verified: true
      },
      {
        step: "Refrigerated Container",
        timestamp: "2024-03-01 12:00",
        location: "Mumbai Port → Dubai",
        verified: true
      },
      {
        step: "Arrival at Dubai Market",
        timestamp: "2024-03-05 08:45",
        location: "Dubai Vegetable Market",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-CHL-2024-008",
    farm: "Andhra Chilly Fields",
    harvestDate: "2024-02-18",
    quantity: "5000 kg",
    qualityScore: 95,
    transactions: [
      {
        step: "Harvest & Drying",
        timestamp: "2024-02-18 08:00",
        location: "Guntur Fields, Andhra Pradesh",
        verified: true
      },
      {
        step: "Quality Grading",
        timestamp: "2024-02-20 13:45",
        location: "Spices Board Office",
        verified: true
      },
      {
        step: "Export Packaging",
        timestamp: "2024-02-22 16:20",
        location: "Kakinada Port",
        verified: true
      },
      {
        step: "Container Shipment",
        timestamp: "2024-02-24 11:30",
        location: "Kakinada → Singapore",
        verified: true
      },
      {
        step: "Singapore Distribution",
        timestamp: "2024-03-02 14:15",
        location: "Singapore Spice Market",
        verified: true
      }
    ]
  },
  {
    batchId: "BATCH-GRP-2024-009",
    farm: "Maharashtra Vineyards",
    harvestDate: "2024-02-28",
    quantity: "8000 kg",
    qualityScore: 97,
    transactions: [
      {
        step: "Grape Harvest",
        timestamp: "2024-02-28 07:15",
        location: "Sangli Vineyards, Maharashtra",
        verified: true
      },
      {
        step: "Quality Inspection",
        timestamp: "2024-03-01 10:30",
        location: "APEDA Quality Lab",
        verified: true
      },
      {
        step: "Cold Chain Packaging",
        timestamp: "2024-03-02 14:45",
        location: "Cold Packaging Unit",
        verified: true
      },
      {
        step: "Air Freight Dispatch",
        timestamp: "2024-03-03 18:00",
        location: "Mumbai Airport → London",
        verified: true
      },
      {
        step: "UK Market Delivery",
        timestamp: "2024-03-04 12:30",
        location: "London Fresh Produce Market",
        verified: true
      }
    ]
  }
];

// Add blockchain-specific farm information
export const blockchainFarmDetails = {
  "Maharashtra Pomegranate Farms": {
    certification: ["APEDA", "ISO 22000", "Organic", "GlobalGAP"],
    established: "2015",
    workers: "120+",
    capacity: "500 tons/month",
    blockchainSince: "2020",
    totalBatches: "245",
    avgQualityScore: "93.2"
  },
  "Kerala Cardamom Estates": {
    certification: ["Spices Board", "Fair Trade", "Organic", "Rainforest Alliance"],
    established: "1985",
    workers: "80+",
    capacity: "20 tons/month",
    blockchainSince: "2019",
    totalBatches: "189",
    avgQualityScore: "95.8"
  },
  "Rajasthan Granite Works": {
    certification: ["ISO 9001", "BIS", "CE Marking", "Green Certified"],
    established: "2002",
    workers: "200+",
    capacity: "10000 sqm/month",
    blockchainSince: "2021",
    totalBatches: "156",
    avgQualityScore: "91.5"
  },
  "Gujarat Pharmaceutical Unit": {
    certification: ["WHO-GMP", "US-FDA", "ISO 13485", "UK-MHRA"],
    established: "1998",
    workers: "350+",
    capacity: "5 million units/month",
    blockchainSince: "2018",
    totalBatches: "312",
    avgQualityScore: "98.7"
  },
  "Karnataka Agro Processing": {
    certification: ["FSSAI", "APEDA", "Organic", "HACCP"],
    established: "2010",
    workers: "150+",
    capacity: "1000 tons/month",
    blockchainSince: "2020",
    totalBatches: "201",
    avgQualityScore: "92.1"
  },
  "Delhi Toy Manufacturing": {
    certification: ["BIS", "CE", "ISO 9001", "ASTM International"],
    established: "2012",
    workers: "180+",
    capacity: "50000 units/month",
    blockchainSince: "2021",
    totalBatches: "134",
    avgQualityScore: "94.3"
  },
  "Nasik Onion Farms": {
    certification: ["APEDA", "FSSAI", "GlobalGAP", "HACCP"],
    established: "2008",
    workers: "95+",
    capacity: "1000 tons/month",
    blockchainSince: "2019",
    totalBatches: "278",
    avgQualityScore: "88.9"
  },
  "Andhra Chilly Fields": {
    certification: ["Spices Board", "Organic", "ISO 22000", "FDA Approved"],
    established: "1995",
    workers: "110+",
    capacity: "200 tons/month",
    blockchainSince: "2020",
    totalBatches: "223",
    avgQualityScore: "94.6"
  },
  "Maharashtra Vineyards": {
    certification: ["APEDA", "GlobalGAP", "Organic", "ISO 22000"],
    established: "2005",
    workers: "130+",
    capacity: "300 tons/month",
    blockchainSince: "2019",
    totalBatches: "267",
    avgQualityScore: "96.2"
  }
};

// ===== SUPPLY CHAIN DATA FOR LIVE SUPPLY CHAIN MAP =====
export const supplyChainData = {
  activeShipments: [
    { 
      id: "SHIP-MUM-DXB-001", 
      from: "Mumbai Port", 
      to: "Dubai Distribution Center", 
      status: "in_transit", 
      progress: 65,
      product: "pomegranate",
      quantity: "5000 kg",
      estimatedArrival: "2024-03-25",
      currentLocation: "Arabian Sea",
      coordinates: [[72.8777, 19.0760], [72.8777, 20.0], [72.8777, 21.0], [72.8777, 22.0], [55.2708, 25.2048]]
    },
    { 
      id: "SHIP-COK-LON-002", 
      from: "Cochin Port", 
      to: "London Warehouse", 
      status: "customs", 
      progress: 85,
      product: "cardamom",
      quantity: "800 kg",
      estimatedArrival: "2024-03-20",
      currentLocation: "London Port",
      coordinates: [[76.2673, 9.9312], [76.2673, 10.5], [76.2673, 12.0], [76.2673, 15.0], [76.2673, 20.0], [76.2673, 25.0], [76.2673, 30.0], [76.2673, 35.0], [76.2673, 40.0], [-0.1276, 51.5074]]
    },
    { 
      id: "SHIP-MUN-RUH-003", 
      from: "Mundra Port", 
      to: "Riyadh Distribution", 
      status: "in_transit", 
      progress: 45,
      product: "granite",
      quantity: "2500 sqm",
      estimatedArrival: "2024-03-28",
      currentLocation: "Arabian Sea",
      coordinates: [[69.6729, 22.7742], [69.6729, 23.0], [69.6729, 24.0], [69.6729, 25.0], [46.6753, 24.7136]]
    },
    { 
      id: "SHIP-DEL-NYC-004", 
      from: "Delhi Airport", 
      to: "New York Port", 
      status: "departed", 
      progress: 20,
      product: "electricToys",
      quantity: "25,000 units",
      estimatedArrival: "2024-03-30",
      currentLocation: "Atlantic Ocean",
      coordinates: [[77.1025, 28.7041], [77.1025, 30.0], [77.1025, 35.0], [77.1025, 40.0], [-74.0060, 40.7128]]
    },
    { 
      id: "SHIP-CHE-SYD-005", 
      from: "Chennai Port", 
      to: "Sydney Port", 
      status: "in_transit", 
      progress: 55,
      product: "agroProducts",
      quantity: "10,000 kg",
      estimatedArrival: "2024-04-05",
      currentLocation: "Indian Ocean",
      coordinates: [[80.2707, 13.0827], [80.2707, 10.0], [80.2707, 5.0], [80.2707, 0.0], [85.0, -5.0], [90.0, -10.0], [95.0, -15.0], [100.0, -20.0], [110.0, -25.0], [120.0, -30.0], [130.0, -33.8688]]
    },
    { 
      id: "SHIP-BOM-SIN-006", 
      from: "Mumbai Airport", 
      to: "Singapore Medical Center", 
      status: "arrived", 
      progress: 100,
      product: "medicines",
      quantity: "50,000 units",
      estimatedArrival: "2024-03-15",
      currentLocation: "Singapore",
      coordinates: [[72.8777, 19.0760], [72.8777, 15.0], [72.8777, 10.0], [77.0, 5.0], [82.0, 0.0], [87.0, 5.0], [92.0, 10.0], [97.0, 15.0], [103.8198, 1.3521]]
    }
  ],
  farmLocations: [
    { 
      id: 1, 
      name: "Maharashtra Pomegranate Farms", 
      country: "India", 
      coordinates: [75.9064, 17.6599], 
      active: true,
      product: "pomegranate",
      capacity: "500 tons/month",
      workers: 120
    },
    { 
      id: 2, 
      name: "Kerala Cardamom Estates", 
      country: "India", 
      coordinates: [76.9574, 9.8496], 
      active: true,
      product: "cardamom",
      capacity: "20 tons/month",
      workers: 80
    },
    { 
      id: 3, 
      name: "Rajasthan Granite Works", 
      country: "India", 
      coordinates: [73.7125, 24.5854], 
      active: true,
      product: "granite",
      capacity: "10000 sqm/month",
      workers: 200
    },
    { 
      id: 4, 
      name: "Gujarat Pharmaceutical Unit", 
      country: "India", 
      coordinates: [72.5714, 23.0225], 
      active: true,
      product: "medicines",
      capacity: "5 million units/month",
      workers: 350
    },
    { 
      id: 5, 
      name: "Karnataka Agro Processing", 
      country: "India", 
      coordinates: [74.4977, 15.8497], 
      active: true,
      product: "agroProducts",
      capacity: "1000 tons/month",
      workers: 150
    },
    { 
      id: 6, 
      name: "Delhi Toy Manufacturing", 
      country: "India", 
      coordinates: [77.2650, 28.5355], 
      active: true,
      product: "electricToys",
      capacity: "50000 units/month",
      workers: 180
    },
    { 
      id: 7, 
      name: "Nasik Onion Farms", 
      country: "India", 
      coordinates: [73.7902, 20.0112], 
      active: true,
      product: "onions",
      capacity: "1000 tons/month",
      workers: 95
    },
    { 
      id: 8, 
      name: "Andhra Chilly Fields", 
      country: "India", 
      coordinates: [80.4365, 16.3067], 
      active: true,
      product: "redChilly",
      capacity: "200 tons/month",
      workers: 110
    },
    { 
      id: 9, 
      name: "Maharashtra Vineyards", 
      country: "India", 
      coordinates: [74.5815, 16.8524], 
      active: true,
      product: "grapes",
      capacity: "300 tons/month",
      workers: 130
    }
  ],
  transitRoutes: [
    { 
      from: "Maharashtra Pomegranate Farms", 
      to: "Dubai Distribution Center", 
      duration: "5 days", 
      active: true,
      frequency: "Weekly",
      transport: "Container Ship"
    },
    { 
      from: "Kerala Cardamom Estates", 
      to: "London Warehouse", 
      duration: "12 days", 
      active: true,
      frequency: "Bi-weekly",
      transport: "Container Ship"
    },
    { 
      from: "Rajasthan Granite Works", 
      to: "Riyadh Distribution", 
      duration: "7 days", 
      active: true,
      frequency: "Monthly",
      transport: "Container Ship"
    },
    { 
      from: "Gujarat Pharmaceutical Unit", 
      to: "Singapore Medical Center", 
      duration: "1 day", 
      active: true,
      frequency: "Daily",
      transport: "Air Cargo"
    },
    { 
      from: "Karnataka Agro Processing", 
      to: "Sydney Port", 
      duration: "18 days", 
      active: true,
      frequency: "Monthly",
      transport: "Container Ship"
    },
    { 
      from: "Delhi Toy Manufacturing", 
      to: "New York Port", 
      duration: "2 days", 
      active: true,
      frequency: "Weekly",
      transport: "Air Cargo"
    },
    { 
      from: "Nasik Onion Farms", 
      to: "Dubai Vegetable Market", 
      duration: "4 days", 
      active: true,
      frequency: "Twice Weekly",
      transport: "Refrigerated Container"
    },
    { 
      from: "Andhra Chilly Fields", 
      to: "Singapore Spice Market", 
      duration: "8 days", 
      active: true,
      frequency: "Weekly",
      transport: "Container Ship"
    },
    { 
      from: "Maharashtra Vineyards", 
      to: "London Fresh Produce Market", 
      duration: "1 day", 
      active: true,
      frequency: "Daily",
      transport: "Air Freight"
    }
  ]
};

// ===== INVENTORY DATA FOR LIVE INVENTORY =====
export const inventoryData = {
  currentStock: {
    "pomegranate": { 
      quantity: "15,200 kg", 
      nextHarvest: "45 days", 
      status: "available",
      grades: {
        "Grade A": "8,500 kg",
        "Export Quality": "4,200 kg", 
        "Organic": "2,500 kg"
      },
      locations: ["Solapur", "Pune", "Mumbai"],
      value: "$1.8M"
    },
    "cardamom": { 
      quantity: "1,850 kg", 
      nextHarvest: "23 days", 
      status: "limited",
      grades: {
        "Extra Bold": "800 kg",
        "Bold": "650 kg",
        "Superior": "400 kg"
      },
      locations: ["Idukki", "Kochi"],
      value: "$3.2M"
    },
    "granite": { 
      quantity: "45,000 sqm", 
      nextHarvest: "All Year", 
      status: "available",
      grades: {
        "Premium": "15,000 sqm",
        "Standard": "20,000 sqm", 
        "Commercial": "10,000 sqm"
      },
      locations: ["Udaipur", "Jaipur"],
      value: "$12.5M"
    },
    "medicines": { 
      quantity: "2.5M units", 
      nextHarvest: "All Year", 
      status: "available",
      grades: {
        "WHO-GMP": "1.2M units",
        "US-FDA": "800k units",
        "CE Certified": "500k units"
      },
      locations: ["Ahmedabad", "Delhi"],
      value: "$8.7M"
    },
    "agroProducts": { 
      quantity: "85,000 kg", 
      nextHarvest: "30 days", 
      status: "available",
      grades: {
        "Organic": "35,000 kg",
        "Premium": "25,000 kg",
        "Export Quality": "25,000 kg"
      },
      locations: ["Belagavi", "Bangalore"],
      value: "$2.1M"
    },
    "electricToys": { 
      quantity: "125,000 units", 
      nextHarvest: "All Year", 
      status: "available",
      grades: {
        "CE Certified": "75,000 units",
        "ISO Certified": "35,000 units", 
        "BIS Approved": "15,000 units"
      },
      locations: ["Delhi", "Gurgaon"],
      value: "$4.8M"
    },
    "onions": { 
      quantity: "250,000 kg", 
      nextHarvest: "12 days", 
      status: "low",
      grades: {
        "Grade A": "150,000 kg",
        "Export Quality": "100,000 kg"
      },
      locations: ["Nashik", "Pune"],
      value: "$850k"
    },
    "redChilly": { 
      quantity: "45,000 kg", 
      nextHarvest: "67 days", 
      status: "available",
      grades: {
        "Extra Hot": "20,000 kg",
        "Medium Hot": "15,000 kg",
        "Mild": "10,000 kg"
      },
      locations: ["Guntur", "Hyderabad"],
      value: "$6.3M"
    },
    "grapes": { 
      quantity: "65,000 kg", 
      nextHarvest: "89 days", 
      status: "available",
      grades: {
        "Premium": "30,000 kg",
        "Export Quality": "25,000 kg",
        "Organic": "10,000 kg"
      },
      locations: ["Sangli", "Nasik"],
      value: "$3.9M"
    }
  },
  harvestSchedule: [
    { 
      batch: "Maharashtra Pomegranate Spring 2024", 
      harvestDate: "2024-04-15", 
      quantity: "25,000 kg", 
      status: "upcoming",
      product: "pomegranate",
      farm: "Maharashtra Pomegranate Farms"
    },
    { 
      batch: "Kerala Cardamom Summer 2024", 
      harvestDate: "2024-04-02", 
      quantity: "2,500 kg", 
      status: "upcoming",
      product: "cardamom", 
      farm: "Kerala Cardamom Estates"
    },
    { 
      batch: "Rajasthan Granite Q2 2024", 
      harvestDate: "2024-05-20", 
      quantity: "50,000 sqm", 
      status: "planned",
      product: "granite",
      farm: "Rajasthan Granite Works"
    },
    { 
      batch: "Gujarat Medicines Monthly", 
      harvestDate: "2024-04-01", 
      quantity: "3M units", 
      status: "upcoming",
      product: "medicines",
      farm: "Gujarat Pharmaceutical Unit"
    },
    { 
      batch: "Karnataka Agro Summer", 
      harvestDate: "2024-04-10", 
      quantity: "100,000 kg", 
      status: "upcoming",
      product: "agroProducts",
      farm: "Karnataka Agro Processing"
    },
    { 
      batch: "Nasik Onion Summer", 
      harvestDate: "2024-03-25", 
      quantity: "300,000 kg", 
      status: "immediate",
      product: "onions",
      farm: "Nasik Onion Farms"
    },
    { 
      batch: "Andhra Chilly Summer", 
      harvestDate: "2024-05-15", 
      quantity: "60,000 kg", 
      status: "planned",
      product: "redChilly",
      farm: "Andhra Chilly Fields"
    },
    { 
      batch: "Maharashtra Grapes Summer", 
      harvestDate: "2024-06-01", 
      quantity: "80,000 kg", 
      status: "planned",
      product: "grapes",
      farm: "Maharashtra Vineyards"
    }
  ],
  warehouseLocations: [
    {
      name: "Mumbai Central Warehouse",
      location: "Mumbai, India",
      capacity: "500,000 kg",
      currentStock: "385,000 kg",
      products: ["pomegranate", "onions", "grapes"]
    },
    {
      name: "Delhi Distribution Center", 
      location: "Delhi, India",
      capacity: "300,000 kg",
      currentStock: "245,000 kg",
      products: ["electricToys", "medicines", "agroProducts"]
    },
    {
      name: "Chennai South Hub",
      location: "Chennai, India", 
      capacity: "400,000 kg",
      currentStock: "312,000 kg",
      products: ["granite", "cardamom", "redChilly"]
    },
    {
      name: "Dubai International Hub",
      location: "Dubai, UAE",
      capacity: "600,000 kg", 
      currentStock: "428,000 kg",
      products: ["All Products"]
    },
    {
      name: "Singapore Asia Pacific",
      location: "Singapore",
      capacity: "350,000 kg",
      currentStock: "267,000 kg",
      products: ["All Products"]
    }
  ]
};

// ===== PRICING TIERS FOR INDIAN PRODUCTS =====
export const pricingTiers = [
  {
    product: "pomegranate",
    grade: "Premium Bhagwa",
    description: "Highest quality, deep red arils, sweet flavor",
    pricePerKg: 300,
    features: ["Deep Red Color", "Sweet Flavor", "Large Arils", "APEDA Certified"],
    minOrder: 100,
    availability: "200,000 kg in stock",
    shelfLife: "45 days"
  },
  {
    product: "pomegranate", 
    grade: "Export Quality Ganesh",
    description: "Medium sweet, balanced flavor profile",
    pricePerKg: 300,
    features: ["Medium Sweet", "Balanced Flavor", "Good Color", "FSSAI Certified"],
    minOrder: 500,
    availability: "85,000 kg in stock",
    shelfLife: "40 days"
  },
  {
    product: "cardamom",
    grade: "Extra Bold Green",
    description: "Large pods, intense aroma, premium quality",
    pricePerKg: 3500,
    features: ["Large Pods", "Intense Aroma", "High Oil Content", "Spices Board Certified"],
    minOrder: 10,
    availability: "8000 kg in stock", 
    shelfLife: "24 months"
  },
  {
    product: "cardamom",
    grade: "Bold Green",
    description: "Medium pods, strong flavor, commercial grade",
    pricePerKg: 3500,
    features: ["Medium Pods", "Strong Flavor", "Consistent Quality", "ISO Certified"],
    minOrder: 25,
    availability: "6500 kg in stock",
    shelfLife: "24 months"
  },
  {
    product: "granite",
    grade: "Absolute Black Premium",
    description: "Pure black, fine grain, premium finish",
    pricePerSqm: 8500,
    features: ["Pure Black", "Fine Grain", "Premium Polish", "BIS Certified"],
    minOrder: 100,
    availability: "15,000 sqm in stock",
    origin: "Rajasthan"
  },
  {
    product: "granite",
    grade: "Kashmir White Standard", 
    description: "White background with grey patterns",
    pricePerSqm: 4500,
    features: ["White Background", "Grey Patterns", "Standard Polish", "CE Marking"],
    minOrder: 200,
    availability: "20,000 sqm in stock",
    origin: "Rajasthan"
  },
  {
    product: "medicines",
    grade: "WHO-GMP Certified",
    description: "Pharmaceutical grade, WHO compliance",
    pricePerUnit: 120,
    features: ["WHO-GMP", "Quality Assured", "Clinical Grade", "International Standards"],
    minOrder: 1000,
    availability: "1.2M units in stock",
    compliance: "International"
  },
  {
    product: "medicines",
    grade: "US-FDA Approved",
    description: "US FDA standards, export quality",
    pricePerUnit: 180, 
    features: ["US-FDA", "Stringent Quality", "Export Ready", "Documented Traceability"],
    minOrder: 5000,
    availability: "800k units in stock",
    compliance: "US Market"
  }
];

// ===== LIVE ORDERS DATA (Indian Export Focus) =====
export const generateLiveIndianOrders = (count = 50) => {
  const clients = [
    "Al Maya Supermarket Dubai", "Lulu Group International", "Carrefour UAE", 
    "Choithram Dubai", "West Zone Supermarket", "Union Coop Dubai",
    "Sharjah Cooperative Society", "Abu Dhabi Cooperative Society", 
    "Spinneys Dubai", "Waitrose UAE", "Kibsons International", "Al Adil Trading Dubai",
    "Tesco UK", "Sainsbury's UK", "Marks & Spencer UK", "Aldi Germany",
    "Lidl Germany", "Carrefour France", "Walmart USA", "Costco USA"
  ];
  
  const products = Object.keys(indianProducts);
  
  return Array.from({ length: count }, (_, i) => {
    const productKey = products[Math.floor(Math.random() * products.length)];
    const productData = indianProducts[productKey];
    const quantity = Math.floor(Math.random() * 1000) + 50;
    const pricePerUnit = (Math.random() * (productData.priceRange.max - productData.priceRange.min)) + productData.priceRange.min;
    const totalValue = quantity * pricePerUnit;
    
    const destinations = [
      "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE", "London, UK", 
      "Manchester, UK", "Berlin, Germany", "Hamburg, Germany", "Paris, France",
      "New York, USA", "Los Angeles, USA", "Singapore", "Sydney, Australia"
    ];
    
    return {
      id: `IN-EXP-${2024000 + i}`,
      client: clients[Math.floor(Math.random() * clients.length)],
      product: productData.name,
      productCategory: productKey,
      quantity: `${quantity} ${productKey === 'granite' ? 'sqm' : productKey === 'electricToys' || productKey === 'medicines' ? 'units' : 'kg'}`,
      value: `$${totalValue.toLocaleString()}`,
      valueNumber: totalValue,
      timestamp: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      status: Math.random() > 0.2 ? "completed" : "processing",
      shipmentId: `SHIP-IN-${1000 + i}`,
      origin: indianFarmsAndFactories[Math.floor(Math.random() * indianFarmsAndFactories.length)].city + ", India"
    };
  });
};

export const indianClientStories = [
  {
    id: 1,
    client: "Al Maya Group Dubai",
    industry: "Retail Supermarket Chain",
    logo: "/clients/al-maya.png",
    challenge: "Inconsistent quality and supply of Indian fruits and vegetables affecting customer satisfaction",
    solution: "Implemented our blockchain-tracked supply chain from Indian farms to Dubai stores",
    results: {
      revenueIncrease: "38%",
      wasteReduction: "65%",
      customerSatisfaction: "4.7/5.0",
      supplyReliability: "99.5%"
    },
    testimonial: "The transparency from Indian farms to our Dubai shelves has transformed our produce section. Customers trust the quality and we've reduced waste significantly.",
    contact: "Mr. Abdullah Al Maya, CEO",
    products: ["pomegranate", "grapes", "onions"]
  },
  {
    id: 2,
    client: "Dubai Pharmaceutical Distributors",
    industry: "Pharmaceutical Distribution",
    logo: "/clients/dubai-pharma.png",
    challenge: "Regulatory compliance and quality assurance for generic medicines from India",
    solution: "Quality-verified, WHO-GMP certified Indian pharmaceutical supply chain",
    results: {
      complianceRate: "100%",
      costSavings: "42%",
      deliveryTime: "45% faster",
      marketShare: "28% growth"
    },
    testimonial: "The certified supply chain and regulatory compliance support made Indian generic medicines our most profitable segment. Quality is consistently excellent.",
    contact: "Dr. Sameer Hassan, Procurement Director",
    products: ["medicines"]
  },
  {
    id: 3,
    client: "Emirates Building Materials",
    industry: "Construction Materials",
    logo: "/clients/emirates-building.png",
    challenge: "Quality inconsistency in granite and marble shipments from multiple Indian suppliers",
    solution: "Single-window procurement with quality grading and blockchain verification",
    results: {
      qualityConsistency: "98%",
      procurementCost: "25% reduction",
      projectDelays: "80% reduction",
      clientSatisfaction: "4.9/5.0"
    },
    testimonial: "The quality grading system and reliable supply from Rajasthan granite quarries have made us the preferred supplier for luxury projects in Dubai.",
    contact: "Eng. Mohammed Al Rashid, Operations Head",
    products: ["granite"]
  }
];

// Generate initial data
export const indianOrders = generateIndianOrders(150);