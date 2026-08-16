export interface PortalPreset {
  id: string;
  name: string;
  category: "Government" | "Banking" | "Private" | "General";
  photo: {
    targetWidthPx: number;
    targetHeightPx: number;
    minSizeKb: number;
    maxSizeKb: number;
    allowedFormats: string[];
    description: string;
  };
  signature: {
    targetWidthPx: number;
    targetHeightPx: number;
    minSizeKb: number;
    maxSizeKb: number;
    allowedFormats: string[];
    description: string;
  };
}

export const PORTAL_PRESETS: Record<string, PortalPreset> = {
  ssc: {
    id: "ssc",
    name: "SSC (Staff Selection Commission)",
    category: "Government",
    photo: {
      targetWidthPx: 350,
      targetHeightPx: 450,
      minSizeKb: 20,
      maxSizeKb: 50,
      allowedFormats: ["image/jpeg", "image/jpg"],
      description: "3.5 cm x 4.5 cm passport photo with clear background (20 KB - 50 KB)",
    },
    signature: {
      targetWidthPx: 140,
      targetHeightPx: 60,
      minSizeKb: 10,
      maxSizeKb: 20,
      allowedFormats: ["image/jpeg", "image/jpg"],
      description: "Black / Blue ink signature on white paper (10 KB - 20 KB)",
    },
  },
  upsc: {
    id: "upsc",
    name: "UPSC (Civil Services & Engineering)",
    category: "Government",
    photo: {
      targetWidthPx: 350,
      targetHeightPx: 350,
      minSizeKb: 20,
      maxSizeKb: 300,
      allowedFormats: ["image/jpeg", "image/jpg"],
      description: "350x350 px clear photo with candidate name & date printed (20 KB - 300 KB)",
    },
    signature: {
      targetWidthPx: 350,
      targetHeightPx: 350,
      minSizeKb: 20,
      maxSizeKb: 300,
      allowedFormats: ["image/jpeg", "image/jpg"],
      description: "350x350 px clear signature scan (20 KB - 300 KB)",
    },
  },
  ibps: {
    id: "ibps",
    name: "IBPS / Banking Recruitment",
    category: "Banking",
    photo: {
      targetWidthPx: 200,
      targetHeightPx: 230,
      minSizeKb: 20,
      maxSizeKb: 50,
      allowedFormats: ["image/jpeg", "image/jpg"],
      description: "200x230 px passport photo (20 KB - 50 KB)",
    },
    signature: {
      targetWidthPx: 140,
      targetHeightPx: 60,
      minSizeKb: 10,
      maxSizeKb: 20,
      allowedFormats: ["image/jpeg", "image/jpg"],
      description: "140x60 px signature (10 KB - 20 KB)",
    },
  },
  standard: {
    id: "standard",
    name: "Standard Job & SaaS Portals",
    category: "General",
    photo: {
      targetWidthPx: 400,
      targetHeightPx: 400,
      minSizeKb: 10,
      maxSizeKb: 2000,
      allowedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      description: "High-resolution square profile photo (Up to 2 MB)",
    },
    signature: {
      targetWidthPx: 300,
      targetHeightPx: 150,
      minSizeKb: 5,
      maxSizeKb: 1000,
      allowedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      description: "Clean signature scan (Up to 1 MB)",
    },
  },
};
