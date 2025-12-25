// src/components/public/data/demoData.js

export const generateLiveOrders = (count = 50) => {
  const clients = [
    "Gourmet Foods Inc", "Spice Empire", "Premium Restaurants", 
    "Organic Markets Co", "Global Distributors", "Luxury Hotels Chain",
    "Health Supplements Ltd", "Artisan Bakers", "Cosmetics Manufacturers",
    "Pharmaceutical Corp"
  ];
  
  const products = [
    "Premium Kashmiri Saffron", "Organic Spanish Saffron", 
    "Super Negin Grade", "Pushal Grade", "Sargol Grade"
  ];
  
  const countries = ["USA", "UK", "Germany", "France", "Japan", "UAE", "Australia", "Canada"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `ORD${1000 + i}`,
    client: clients[Math.floor(Math.random() * clients.length)],
    product: products[Math.floor(Math.random() * products.length)],
    quantity: `${Math.floor(Math.random() * 50) + 5}kg`,
    value: `$${(Math.random() * 50000 + 5000).toFixed(0)}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    destination: countries[Math.floor(Math.random() * countries.length)],
    status: Math.random() > 0.3 ? "completed" : "processing"
  }));
};

export const certificationData = [
  {
    id: 1,
    name: "ISO 22000 Certified",
    issuer: "International Organization for Standardization",
    image: "/certifications/iso22000.png",
    description: "Food Safety Management System Certification",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 2,
    name: "USDA Organic",
    issuer: "United States Department of Agriculture",
    image: "/certifications/usda-organic.png",
    description: "100% Organic Certification",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 3,
    name: "Fair Trade Certified",
    issuer: "Fair Trade International",
    image: "/certifications/fairtrade.png",
    description: "Ethical Farming Practices",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 4,
    name: "EU Organic Certification",
    issuer: "European Union",
    image: "/certifications/eu-organic.png",
    description: "European Organic Standards",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 5,
    name: "Saffron Quality Gold",
    issuer: "International Saffron Council",
    image: "/certifications/quality-gold.png",
    description: "Highest Quality Grade Certification",
    verified: true,
    verificationUrl: "#"
  },
  {
    id: 6,
    name: "Food Safety Certified",
    issuer: "Global Food Safety Initiative",
    image: "/certifications/fsci.png",
    description: "Global Food Safety Standards",
    verified: true,
    verificationUrl: "#"
  }
];

export const clientStories = [
  {
    id: 1,
    client: "SpiceCraft Premium Foods",
    industry: "Gourmet Food Manufacturing",
    logo: "/clients/spicecraft.png",
    challenge: "Inconsistent saffron quality affecting product reputation",
    solution: "Implemented our blockchain-verified premium saffron",
    results: {
      revenueIncrease: "47%",
      qualityComplaints: "92% reduction",
      customerSatisfaction: "4.8/5.0",
      roi: "315%"
    },
    testimonial: "The transparency and consistent quality transformed our brand reputation. Our customers now trust our products completely.",
    contact: "Sarah Chen, CEO"
  },
  {
    id: 2,
    client: "Luxury Dining Group",
    industry: "Restaurant Chain",
    logo: "/clients/luxury-dining.png",
    challenge: "High saffron costs with questionable authenticity",
    solution: "Direct farm partnerships through our platform",
    results: {
      costReduction: "32%",
      supplyReliability: "99.8%",
      menuProfitability: "28% increase",
      customerFeedback: "4.9/5.0"
    },
    testimonial: "We reduced costs while improving quality. The farm-to-table transparency is a huge selling point for our premium clients.",
    contact: "Marcus Rodriguez, Procurement Director"
  },
  {
    id: 3,
    client: "Wellness Supplements Inc",
    industry: "Health Supplements",
    logo: "/clients/wellness-supplements.png",
    challenge: "Need for clinically verified saffron for medicinal products",
    solution: "Lab-tested, potency-guaranteed saffron batches",
    results: {
      productEfficacy: "53% improvement",
      marketShare: "27% growth",
      customerRetention: "68% increase",
      clinicalResults: "98% purity"
    },
    testimonial: "The scientific validation and consistent potency metrics allowed us to make clinical claims with confidence.",
    contact: "Dr. Emily Watson, Head of R&D"
  }
];

export const inventoryData = {
  currentStock: {
    "Premium Kashmiri": { quantity: "142kg", nextHarvest: "45 days", status: "available" },
    "Organic Spanish": { quantity: "87kg", nextHarvest: "23 days", status: "limited" },
    "Super Negin Grade": { quantity: "56kg", nextHarvest: "67 days", status: "available" },
    "Pushal Grade": { quantity: "34kg", nextHarvest: "12 days", status: "low" },
    "Sargol Grade": { quantity: "203kg", nextHarvest: "89 days", status: "available" }
  },
  harvestSchedule: [
    { batch: "Kashmir Spring 2024", harvestDate: "2024-03-15", quantity: "180kg", status: "upcoming" },
    { batch: "Spain Organic 2024", harvestDate: "2024-04-02", quantity: "95kg", status: "upcoming" },
    { batch: "Iran Premium 2024", harvestDate: "2024-05-20", quantity: "220kg", status: "planned" }
  ]
};

export const supplyChainData = {
  activeShipments: [
    { id: "SHIP001", from: "Kashmir Farms", to: "Dubai Distribution", status: "in_transit", progress: 65 },
    { id: "SHIP002", from: "Spain Organic", to: "London Warehouse", status: "customs", progress: 85 },
    { id: "SHIP003", from: "Iran Fields", to: "Singapore Hub", status: "in_transit", progress: 45 },
    { id: "SHIP004", from: "Morocco Farms", to: "New York Port", status: "departed", progress: 20 }
  ],
  farmLocations: [
    { id: 1, name: "Kashmir Highlands", country: "India", coordinates: [34.5, 76.5], active: true },
    { id: 2, name: "La Mancha Organic", country: "Spain", coordinates: [39.5, -3.0], active: true },
    { id: 3, name: "Khorasan Fields", country: "Iran", coordinates: [34.8, 60.5], active: true },
    { id: 4, name: "Morocco Atlas", country: "Morocco", coordinates: [31.5, -7.0], active: true },
    { id: 5, name: "Greek Macedonia", country: "Greece", coordinates: [40.5, 23.0], active: false }
  ],
  transitRoutes: [
    { from: "Kashmir Highlands", to: "Dubai Distribution", duration: "5 days", active: true },
    { from: "La Mancha Organic", to: "London Warehouse", duration: "2 days", active: true },
    { from: "Khorasan Fields", to: "Singapore Hub", duration: "7 days", active: true },
    { from: "Morocco Atlas", to: "New York Port", duration: "10 days", active: true }
  ]
};

export const pricingTiers = [
  {
    grade: "Premium Kashmiri",
    description: "Highest quality, hand-picked saffron strands",
    pricePerKg: 12500,
    features: ["Crocin >250", "Safranal >45", "Picrocrocin >85", "ISO Certified"],
    minOrder: 1,
    availability: "142kg in stock"
  },
  {
    grade: "Organic Spanish",
    description: "EU Organic certified, chemical-free",
    pricePerKg: 9800,
    features: ["100% Organic", "Crocin >220", "Safranal >40", "USDA Certified"],
    minOrder: 2,
    availability: "87kg in stock"
  },
  {
    grade: "Super Negin",
    description: "Premium Iranian grade, full strands",
    pricePerKg: 8200,
    features: ["Crocin >200", "Safranal >35", "Whole Strands", "Fair Trade"],
    minOrder: 5,
    availability: "56kg in stock"
  }
];

export const blockchainBatches = [
  {
    batchId: "BATCH-KSH-2024-001",
    farm: "Kashmir Highlands",
    harvestDate: "2024-01-15",
    quantity: "45kg",
    qualityScore: 98,
    transactions: [
      { step: "Harvested", timestamp: "2024-01-15", location: "Kashmir Farm", verified: true },
      { step: "Quality Tested", timestamp: "2024-01-16", location: "Lab Facility", verified: true },
      { step: "Packaged", timestamp: "2024-01-17", location: "Processing Unit", verified: true },
      { step: "Shipped", timestamp: "2024-01-18", location: "Dubai Port", verified: true }
    ]
  },
  {
    batchId: "BATCH-SPN-2024-002", 
    farm: "La Mancha Organic",
    harvestDate: "2024-01-10",
    quantity: "32kg",
    qualityScore: 96,
    transactions: [
      { step: "Harvested", timestamp: "2024-01-10", location: "Spain Farm", verified: true },
      { step: "Quality Tested", timestamp: "2024-01-11", location: "Madrid Lab", verified: true },
      { step: "Packaged", timestamp: "2024-01-12", location: "Processing Unit", verified: true },
      { step: "Shipped", timestamp: "2024-01-13", location: "London Port", verified: true }
    ]
  }
];

// Generate initial data
export const liveOrders = generateLiveOrders(50);