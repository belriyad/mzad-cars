/**
 * Qatar-market car catalogue: make → models → trims
 * Used for cascading dropdowns across the app.
 */

export interface CarModel {
  name: string;
  trims: string[];
}

export interface CarMake {
  name: string;
  models: CarModel[];
}

export const CAR_CATALOGUE: CarMake[] = [
  {
    name: "Toyota",
    models: [
      { name: "Camry",      trims: ["LE", "SE", "XLE", "XSE", "TRD", "Hybrid LE", "Hybrid XLE"] },
      { name: "Corolla",    trims: ["Standard", "Sport", "XLE", "SE", "Hybrid"] },
      { name: "Land Cruiser", trims: ["GX", "EX", "VX", "GX-R", "300 GXR", "300 VXR"] },
      { name: "Land Cruiser Prado", trims: ["GX", "EX", "VX", "TX", "TX-L"] },
      { name: "Hilux",      trims: ["Single Cab", "Double Cab GL", "Double Cab SR5", "Double Cab SR"] },
      { name: "FJ Cruiser", trims: ["Standard", "Trail Teams"] },
      { name: "RAV4",       trims: ["LE", "XLE", "XSE", "TRD Off-Road", "Adventure", "Limited", "Hybrid"] },
      { name: "Fortuner",   trims: ["EXR", "GXR", "VXR", "GX"] },
      { name: "Rush",       trims: ["Standard", "Mid", "High"] },
      { name: "Yaris",      trims: ["Standard", "SE", "S"] },
      { name: "Avalon",     trims: ["XLE", "Touring", "Limited", "Hybrid"] },
      { name: "4Runner",    trims: ["SR5", "TRD Off-Road", "TRD Pro", "Limited", "Venture"] },
      { name: "Sequoia",    trims: ["SR5", "TRD Pro", "Limited", "Platinum", "Captains"] },
      { name: "Tundra",     trims: ["SR", "SR5", "Limited", "Platinum", "TRD Pro", "1794"] },
    ],
  },
  {
    name: "Lexus",
    models: [
      { name: "LX 570",  trims: ["Base", "Sport", "Inspiration Series", "Black Vision"] },
      { name: "LX 600",  trims: ["Base", "Premium", "Ultra Luxury", "F Sport"] },
      { name: "GX 460",  trims: ["Base", "Premium", "Luxury", "Black Line"] },
      { name: "ES 250",  trims: ["Base", "F Sport", "Ultra Luxury"] },
      { name: "ES 350",  trims: ["Base", "F Sport", "Ultra Luxury"] },
      { name: "NX 250",  trims: ["Base", "Premium", "Luxury", "F Sport"] },
      { name: "NX 350",  trims: ["Base", "Premium", "Luxury", "F Sport"] },
      { name: "RX 350",  trims: ["Base", "Premium", "Luxury", "F Sport", "Premium+"] },
      { name: "RX 500h", trims: ["Premium", "Luxury", "F Sport Performance"] },
      { name: "IS 300",  trims: ["Base", "F Sport"] },
      { name: "IS 350",  trims: ["Base", "F Sport"] },
      { name: "LS 500",  trims: ["Base", "F Sport", "Inspiration"] },
      { name: "LC 500",  trims: ["Base", "Inspiration Series"] },
    ],
  },
  {
    name: "Nissan",
    models: [
      { name: "Patrol",     trims: ["SE", "SE Safari", "Platinum", "Platinum City", "LE", "XE", "Desert Edition"] },
      { name: "Altima",     trims: ["S", "SV", "SL", "SR", "Platinum"] },
      { name: "Maxima",     trims: ["S", "SV", "SL", "Platinum"] },
      { name: "Sunny",      trims: ["Standard", "S", "SV"] },
      { name: "X-Trail",    trims: ["S", "SV", "SL", "Platinum", "e-POWER"] },
      { name: "Pathfinder", trims: ["S", "SV", "SL", "Platinum"] },
      { name: "Frontier",   trims: ["S", "SV", "Pro-4X", "PRO-X"] },
      { name: "Armada",     trims: ["S", "SV", "SL", "Platinum", "Midnight Edition"] },
      { name: "Murano",     trims: ["S", "SV", "SL", "Platinum"] },
      { name: "Kicks",      trims: ["S", "SV", "SR", "SR Midnight"] },
      { name: "Juke",       trims: ["S", "SV", "SR"] },
      { name: "370Z",       trims: ["Sport", "Touring", "Nismo"] },
      { name: "GT-R",       trims: ["Premium", "Track Edition", "Nismo"] },
    ],
  },
  {
    name: "Infiniti",
    models: [
      { name: "QX80",    trims: ["Luxe", "Sensory", "Autograph"] },
      { name: "QX60",    trims: ["Pure", "Luxe", "Sensory", "Autograph"] },
      { name: "QX50",    trims: ["Pure", "Luxe", "Sensory", "Autograph"] },
      { name: "Q50",     trims: ["Luxe", "Sport", "Red Sport 400"] },
      { name: "Q60",     trims: ["Luxe", "Sport", "Red Sport 400"] },
      { name: "QX55",    trims: ["Pure", "Luxe", "Sensory"] },
    ],
  },
  {
    name: "BMW",
    models: [
      { name: "3 Series",  trims: ["318i", "320i", "330i", "M340i", "M Sport"] },
      { name: "5 Series",  trims: ["520i", "530i", "540i", "M550i", "M Sport"] },
      { name: "7 Series",  trims: ["730i", "740i", "750i", "M760i"] },
      { name: "X3",        trims: ["sDrive20i", "xDrive20i", "xDrive30i", "M40i", "M"] },
      { name: "X5",        trims: ["sDrive40i", "xDrive40i", "M50i", "M", "xDrive50e"] },
      { name: "X6",        trims: ["xDrive40i", "M50i", "M"] },
      { name: "X7",        trims: ["xDrive40i", "M50i", "Alpina XB7"] },
      { name: "M3",        trims: ["Base", "Competition", "CS"] },
      { name: "M5",        trims: ["Base", "Competition", "CS"] },
      { name: "M8",        trims: ["Coupe", "Convertible", "Gran Coupe", "Competition"] },
      { name: "i4",        trims: ["eDrive35", "eDrive40", "M50"] },
      { name: "iX",        trims: ["xDrive40", "xDrive50", "M60"] },
      { name: "2 Series",  trims: ["218i", "220i", "M240i", "M2"] },
      { name: "4 Series",  trims: ["420i", "430i", "440i", "M440i", "M4"] },
    ],
  },
  {
    name: "Mercedes-Benz",
    models: [
      { name: "C-Class",   trims: ["C200", "C300", "C43 AMG", "C63 AMG", "C63 S AMG"] },
      { name: "E-Class",   trims: ["E200", "E300", "E350", "E450", "E53 AMG", "E63 AMG"] },
      { name: "S-Class",   trims: ["S450", "S500", "S580", "S63 AMG", "Maybach S580", "Maybach S680"] },
      { name: "GLC",       trims: ["GLC200", "GLC300", "GLC43 AMG", "GLC63 AMG"] },
      { name: "GLE",       trims: ["GLE300d", "GLE350", "GLE450", "GLE53 AMG", "GLE63 AMG"] },
      { name: "GLS",       trims: ["GLS450", "GLS580", "AMG GLS63", "Maybach GLS600"] },
      { name: "G-Class",   trims: ["G500", "G63 AMG", "G63 AMG Edition 55"] },
      { name: "A-Class",   trims: ["A200", "A250", "A35 AMG", "A45 AMG"] },
      { name: "CLA",       trims: ["CLA200", "CLA250", "CLA35 AMG", "CLA45 AMG"] },
      { name: "GLB",       trims: ["GLB200", "GLB250", "AMG GLB35"] },
      { name: "EQS",       trims: ["EQS450", "EQS580", "AMG EQS53"] },
      { name: "V-Class",   trims: ["V220d", "V250d", "V300d", "Marco Polo"] },
      { name: "Sprinter",  trims: ["2500", "3500", "Crew Van"] },
    ],
  },
  {
    name: "Audi",
    models: [
      { name: "A4",    trims: ["35 TFSI", "40 TFSI", "45 TFSI", "S4", "RS 4"] },
      { name: "A6",    trims: ["40 TFSI", "45 TFSI", "55 TFSI", "S6", "RS 6"] },
      { name: "A8",    trims: ["55 TFSI", "60 TFSI", "L 60 TFSI", "S8"] },
      { name: "Q3",    trims: ["35 TFSI", "40 TFSI", "45 TFSI", "S line"] },
      { name: "Q5",    trims: ["40 TFSI", "45 TFSI", "SQ5", "RS Q5"] },
      { name: "Q7",    trims: ["45 TFSI", "55 TFSI", "SQ7", "RS Q7"] },
      { name: "Q8",    trims: ["55 TFSI", "SQ8", "RS Q8"] },
      { name: "Q8 e-tron", trims: ["55 quattro", "S quattro"] },
      { name: "R8",    trims: ["V10 Performance", "V10 GT"] },
      { name: "TT",    trims: ["45 TFSI", "TTS", "TTRS"] },
      { name: "e-tron GT", trims: ["Base", "RS e-tron GT"] },
    ],
  },
  {
    name: "Porsche",
    models: [
      { name: "Cayenne",  trims: ["Base", "S", "GTS", "Turbo", "Turbo GT", "E-Hybrid", "Turbo S E-Hybrid"] },
      { name: "Macan",    trims: ["Base", "S", "GTS", "Turbo", "Electric"] },
      { name: "Panamera", trims: ["Base", "4S", "GTS", "Turbo", "Turbo S E-Hybrid"] },
      { name: "911",      trims: ["Carrera", "Carrera S", "Carrera 4S", "Targa 4S", "GT3", "Turbo S"] },
      { name: "Taycan",   trims: ["Base", "4S", "GTS", "Turbo", "Turbo S"] },
      { name: "718",      trims: ["Boxster", "Cayman", "GTS 4.0", "GT4"] },
    ],
  },
  {
    name: "Hyundai",
    models: [
      { name: "Sonata",   trims: ["Base", "Smart", "Sport", "N Line"] },
      { name: "Elantra",  trims: ["Smart", "Base", "Sport", "N Line", "N"] },
      { name: "Tucson",   trims: ["Smart", "Base", "Sport", "N Line", "Ultimate"] },
      { name: "Santa Fe", trims: ["Smart", "Base", "Sport", "Ultimate", "XRT"] },
      { name: "Palisade", trims: ["SE", "SEL", "Limited", "Calligraphy"] },
      { name: "Staria",   trims: ["Smart", "Premium", "9-Seat", "7-Seat"] },
      { name: "Accent",   trims: ["Smart", "Base", "Comfort"] },
      { name: "Creta",    trims: ["Smart", "Base", "Sport", "Platinum"] },
      { name: "IONIQ 6",  trims: ["Standard", "Long Range AWD"] },
      { name: "IONIQ 5",  trims: ["Standard", "Long Range RWD", "Long Range AWD", "N"] },
    ],
  },
  {
    name: "Kia",
    models: [
      { name: "Sportage",  trims: ["LX", "EX", "SX", "X-Line", "Hybrid"] },
      { name: "Sorento",   trims: ["LX", "S", "EX", "SX", "X-Line", "Hybrid"] },
      { name: "Telluride", trims: ["LX", "S", "EX", "SX", "X-Line", "SX Prestige"] },
      { name: "Stinger",   trims: ["GT-Line", "GT1", "GT2"] },
      { name: "K8",        trims: ["Premium", "Signature", "Prestige"] },
      { name: "Carnival",  trims: ["LX", "EX", "SX", "Prestige"] },
      { name: "Cerato",    trims: ["LX", "EX", "GT"] },
      { name: "EV6",       trims: ["Standard", "Wind", "GT-Line", "GT"] },
    ],
  },
  {
    name: "Ford",
    models: [
      { name: "F-150",    trims: ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Raptor", "Tremor"] },
      { name: "Explorer", trims: ["Base", "XLT", "Limited", "ST", "Platinum", "Timberline"] },
      { name: "Edge",     trims: ["SE", "SEL", "Titanium", "ST"] },
      { name: "Mustang",  trims: ["EcoBoost", "GT", "Mach 1", "Shelby GT500"] },
      { name: "Bronco",   trims: ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Wildtrak", "Raptor"] },
      { name: "Ranger",   trims: ["XL", "XLT", "Lariat", "Tremor", "Raptor"] },
      { name: "Expedition", trims: ["XLT", "Limited", "King Ranch", "Platinum", "Timberline", "MAX"] },
    ],
  },
  {
    name: "Chevrolet",
    models: [
      { name: "Tahoe",     trims: ["LS", "LT", "RST", "Z71", "LTZ", "High Country"] },
      { name: "Suburban",  trims: ["LS", "LT", "RST", "Z71", "LTZ", "High Country"] },
      { name: "Silverado", trims: ["WT", "Custom", "LT", "RST", "LTZ", "High Country", "ZR2"] },
      { name: "Traverse",  trims: ["LS", "LT", "RS", "LTZ", "High Country"] },
      { name: "Colorado",  trims: ["WT", "LT", "Z71", "ZR2", "Trail Boss"] },
      { name: "Blazer",    trims: ["LT", "RS", "Premier", "SS"] },
      { name: "Camaro",    trims: ["LS", "LT", "RS", "SS", "ZL1"] },
      { name: "Corvette",  trims: ["Stingray", "Z06", "E-Ray"] },
      { name: "Malibu",    trims: ["LS", "RS", "LT", "Premier"] },
    ],
  },
  {
    name: "Land Rover",
    models: [
      { name: "Range Rover",         trims: ["SE", "HSE", "Autobiography", "SV", "First Edition", "Sport SE", "Sport HSE"] },
      { name: "Range Rover Sport",   trims: ["S", "SE", "HSE", "Dynamic HSE", "Autobiography", "SVR"] },
      { name: "Range Rover Velar",   trims: ["S", "SE", "HSE", "R-Dynamic HSE"] },
      { name: "Range Rover Evoque",  trims: ["S", "SE", "HSE", "R-Dynamic HSE", "Autobiography"] },
      { name: "Defender 90",         trims: ["S", "SE", "HSE", "X", "First Edition"] },
      { name: "Defender 110",        trims: ["S", "SE", "HSE", "X", "First Edition", "Carpathian Edition"] },
      { name: "Discovery",           trims: ["S", "SE", "HSE", "R-Dynamic HSE", "Metropolitan"] },
      { name: "Discovery Sport",     trims: ["S", "SE", "HSE", "R-Dynamic HSE"] },
    ],
  },
  {
    name: "Jeep",
    models: [
      { name: "Grand Cherokee",  trims: ["Laredo", "Altitude", "Limited", "Overland", "Summit", "SRT", "Trackhawk"] },
      { name: "Wrangler",        trims: ["Sport", "Sport S", "Sahara", "Rubicon", "4xe", "392"] },
      { name: "Gladiator",       trims: ["Sport", "Willys", "Overland", "Mojave", "Rubicon"] },
      { name: "Compass",         trims: ["Sport", "Latitude", "Trailhawk", "Limited", "High Altitude"] },
      { name: "Renegade",        trims: ["Sport", "Latitude", "Trailhawk", "Limited"] },
    ],
  },
  {
    name: "Dodge",
    models: [
      { name: "Charger", trims: ["SXT", "GT", "R/T", "Scat Pack", "Hellcat", "Hellcat Redeye", "Super Bee"] },
      { name: "Challenger", trims: ["SXT", "GT", "R/T", "Scat Pack", "Hellcat", "Hellcat Redeye", "Demon"] },
      { name: "Durango",    trims: ["SXT", "GT", "R/T", "Citadel", "SRT 392", "SRT Hellcat"] },
      { name: "Ram 1500",   trims: ["Tradesman", "Big Horn", "Rebel", "Laramie", "Longhorn", "Limited", "TRX"] },
    ],
  },
  {
    name: "GMC",
    models: [
      { name: "Yukon",    trims: ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate"] },
      { name: "Sierra",   trims: ["SLE", "SLT", "AT4", "Denali", "AT4X", "Denali Ultimate"] },
      { name: "Terrain",  trims: ["SLE", "SLT", "AT4", "Denali"] },
      { name: "Acadia",   trims: ["SLE", "SLT", "AT4", "Denali"] },
      { name: "Canyon",   trims: ["SLE", "SLT", "AT4", "Denali"] },
    ],
  },
  {
    name: "Cadillac",
    models: [
      { name: "Escalade",     trims: ["Luxury", "Premium Luxury", "Sport", "V-Series Blackwing"] },
      { name: "Escalade ESV", trims: ["Luxury", "Premium Luxury", "Sport", "V-Series Blackwing"] },
      { name: "CT5",          trims: ["Luxury", "Premium Luxury", "Sport", "V", "Blackwing"] },
      { name: "CT4",          trims: ["Luxury", "Premium Luxury", "Sport", "V", "Blackwing"] },
      { name: "XT5",          trims: ["Luxury", "Premium Luxury", "Sport"] },
      { name: "XT6",          trims: ["Luxury", "Premium Luxury", "Sport"] },
    ],
  },
  {
    name: "Mitsubishi",
    models: [
      { name: "Pajero",      trims: ["GLS", "GLS Sport", "GLX", "Exceed"] },
      { name: "Pajero Sport", trims: ["GLX", "GLS", "GT"] },
      { name: "L200 Triton", trims: ["GLX", "GLS", "Athlete"] },
      { name: "Eclipse Cross", trims: ["GLX", "GLS", "Exceed"] },
      { name: "Outlander",   trims: ["GLX", "GLS", "Exceed", "PHEV"] },
      { name: "ASX",         trims: ["GLX", "GLS"] },
    ],
  },
  {
    name: "Honda",
    models: [
      { name: "Accord",  trims: ["LX", "Sport", "Sport-L", "EX-L", "Touring", "Hybrid", "Sport Hybrid"] },
      { name: "Civic",   trims: ["LX", "Sport", "EX", "Touring", "Si", "Type R"] },
      { name: "CR-V",    trims: ["LX", "Sport", "EX-L", "Touring", "Hybrid", "Sport Hybrid"] },
      { name: "Pilot",   trims: ["Sport", "EX-L", "TrailSport", "Touring", "Elite", "Black Edition"] },
      { name: "Odyssey", trims: ["LX", "EX", "EX-L", "Touring", "Elite"] },
      { name: "HR-V",    trims: ["LX", "Sport", "EX", "EX-L"] },
      { name: "Passport", trims: ["Sport", "EX-L", "TrailSport", "Touring", "Elite"] },
    ],
  },
  {
    name: "Mazda",
    models: [
      { name: "CX-9",  trims: ["Sport", "Touring", "Grand Touring", "Signature"] },
      { name: "CX-5",  trims: ["Sport", "Touring", "Grand Touring", "Carbon Edition", "Signature"] },
      { name: "CX-50", trims: ["2.5 S", "2.5 S Select", "2.5 S Premium", "2.5 Turbo", "Meridian Edition"] },
      { name: "Mazda6", trims: ["Sport", "Touring", "Grand Touring", "Signature"] },
      { name: "Mazda3", trims: ["Select", "Preferred", "Premium", "Turbo"] },
    ],
  },
  {
    name: "Volkswagen",
    models: [
      { name: "Touareg",  trims: ["Standard", "Sport", "Elegance", "R-Line", "R"] },
      { name: "Tiguan",   trims: ["Standard", "R-Line", "SEL", "Allspace"] },
      { name: "Passat",   trims: ["Trendline", "Comfortline", "Highline"] },
      { name: "Golf",     trims: ["Trendline", "Comfortline", "Highline", "GTI", "R"] },
      { name: "Arteon",   trims: ["Elegance", "R-Line", "R"] },
      { name: "ID.4",     trims: ["Pure", "Pro", "GTX"] },
    ],
  },
  {
    name: "Subaru",
    models: [
      { name: "Forester",  trims: ["Base", "Premium", "Sport", "Limited", "Touring"] },
      { name: "Outback",   trims: ["Base", "Premium", "Onyx", "Limited", "Touring XT", "Wilderness"] },
      { name: "Crosstrek", trims: ["Base", "Premium", "Sport", "Limited", "Wilderness"] },
      { name: "Impreza",   trims: ["Base", "Premium", "Sport", "Limited"] },
      { name: "WRX",       trims: ["Base", "Premium", "Limited", "GT", "STI"] },
    ],
  },
  {
    name: "Ferrari",
    models: [
      { name: "Roma",        trims: ["Base", "Spider"] },
      { name: "Portofino M", trims: ["Base"] },
      { name: "F8 Tributo",  trims: ["Base", "Spider"] },
      { name: "SF90",        trims: ["Stradale", "Spider"] },
      { name: "296 GTB",     trims: ["Base", "Assetto Fiorano"] },
      { name: "812 GTS",     trims: ["Base", "Superfast"] },
      { name: "Purosangue",  trims: ["Base"] },
    ],
  },
  {
    name: "Lamborghini",
    models: [
      { name: "Urus",     trims: ["Base", "S", "Performante"] },
      { name: "Huracán",  trims: ["EVO", "EVO RWD", "Sterrato", "STO", "Tecnica"] },
      { name: "Revuelto", trims: ["Base"] },
    ],
  },
  {
    name: "Rolls-Royce",
    models: [
      { name: "Cullinan",  trims: ["Base", "Black Badge"] },
      { name: "Ghost",     trims: ["Base", "Extended", "Black Badge"] },
      { name: "Phantom",   trims: ["Base", "Extended", "Black Badge"] },
      { name: "Wraith",    trims: ["Base", "Black Badge"] },
      { name: "Spectre",   trims: ["Base"] },
    ],
  },
  {
    name: "Bentley",
    models: [
      { name: "Bentayga",   trims: ["V8", "V8 S", "Speed", "Azure", "EWB"] },
      { name: "Continental GT", trims: ["V8", "V8 S", "Speed", "GTC V8", "GTC Speed"] },
      { name: "Flying Spur", trims: ["V8", "V8 S", "Speed", "Azure", "Hybrid"] },
      { name: "Mulsanne",   trims: ["Base", "Speed"] },
    ],
  },
  {
    name: "Maserati",
    models: [
      { name: "Levante",  trims: ["GT", "Modena", "Trofeo"] },
      { name: "Ghibli",   trims: ["GT", "Modena", "Trofeo"] },
      { name: "Quattroporte", trims: ["GT", "Modena", "Trofeo"] },
      { name: "Grecale",  trims: ["GT", "Modena", "Trofeo"] },
      { name: "MC20",     trims: ["Base", "Cielo"] },
    ],
  },
  {
    name: "Genesis",
    models: [
      { name: "GV80",  trims: ["Standard", "Advanced", "Prestige", "Magma"] },
      { name: "GV70",  trims: ["Standard", "Advanced", "Prestige", "Sport"] },
      { name: "G80",   trims: ["Standard", "Advanced", "Prestige"] },
      { name: "G90",   trims: ["Premium", "Prestige"] },
      { name: "GV60",  trims: ["Standard", "Advanced", "Performance"] },
    ],
  },
  {
    name: "Chery",
    models: [
      { name: "Tiggo 8 Pro",  trims: ["Luxury", "Elite"] },
      { name: "Tiggo 7 Pro",  trims: ["Comfort", "Luxury"] },
      { name: "Tiggo 4 Pro",  trims: ["Comfort", "Luxury"] },
      { name: "Arrizo 8",     trims: ["Comfort", "Luxury"] },
    ],
  },
  {
    name: "MG",
    models: [
      { name: "RX5",    trims: ["Comfort", "Luxury", "Trophy"] },
      { name: "HS",     trims: ["Comfort", "Luxury", "Trophy"] },
      { name: "ZS",     trims: ["Comfort", "Luxury"] },
      { name: "5",      trims: ["Comfort", "Luxury"] },
      { name: "MG4 EV", trims: ["Standard", "Long Range"] },
    ],
  },
  {
    name: "BYD",
    models: [
      { name: "Atto 3",  trims: ["Standard", "Extended Range"] },
      { name: "Han",     trims: ["EV", "DM-i"] },
      { name: "Tang",    trims: ["EV", "DM-i"] },
      { name: "Seal",    trims: ["RWD", "AWD Performance"] },
      { name: "Dolphin", trims: ["Standard", "Extended Range"] },
    ],
  },
  {
    name: "Haval",
    models: [
      { name: "H6",     trims: ["Standard", "Ultra", "Ultra Plus"] },
      { name: "Jolion", trims: ["Standard", "Ultra", "Ultra Plus"] },
      { name: "H9",     trims: ["Standard", "Luxury", "Ultra"] },
    ],
  },
  {
    name: "GAC",
    models: [
      { name: "GS8",     trims: ["Comfort", "Luxury"] },
      { name: "GS3",     trims: ["Comfort", "Luxury"] },
      { name: "Empow",   trims: ["Standard", "Sport"] },
    ],
  },
];

/** Returns all make names sorted */
export const MAKES = CAR_CATALOGUE.map((m) => m.name).sort();

/** Returns model names for a given make */
export function getModels(make: string): string[] {
  return CAR_CATALOGUE.find((m) => m.name === make)?.models.map((m) => m.name) ?? [];
}

/** Returns trim names for a given make + model */
export function getTrims(make: string, model: string): string[] {
  return (
    CAR_CATALOGUE.find((m) => m.name === make)?.models.find((m) => m.name === model)?.trims ?? []
  );
}

export const BODY_TYPES = [
  "Sedan", "SUV", "Pickup", "Hatchback", "Coupe", "Convertible",
  "Wagon", "Van", "Minivan", "Bus", "Truck", "Sports Car", "Luxury",
];

export const CITIES_QA = [
  "Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor",
  "Umm Salal", "Al Daayen", "Al Shamal", "Al Shahaniya",
];

export const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);

export const KM_RANGES = [
  { label: "Under 10,000 km",    value: "0-10000" },
  { label: "10,000 – 30,000 km", value: "10000-30000" },
  { label: "30,000 – 60,000 km", value: "30000-60000" },
  { label: "60,000 – 100,000 km",value: "60000-100000" },
  { label: "100,000 – 150,000 km",value: "100000-150000" },
  { label: "Over 150,000 km",    value: "150000-999999" },
];
