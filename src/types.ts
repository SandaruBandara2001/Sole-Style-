export interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
  sizes: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants?: ColorVariant[];
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Air-Lite Runner X1",
    category: "Performance",
    price: 185,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974&auto=format&fit=crop"
    ],
    description: "Engineered for maximum speed and minimal weight. The Air-Lite Runner X1 features our proprietary carbon-fiber plate and ultra-responsive foam cushioning.",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: [
      { name: "Volt Red", hex: "#FF0000" },
      { name: "Stealth Black", hex: "#000000" }
    ],
    isNew: true
  },
  {
    id: "2",
    name: "Urban Nomad 2.0",
    category: "Lifestyle",
    price: 145,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop"
    ],
    description: "The perfect companion for the city explorer. Breathable mesh upper and a durable rubber outsole for all-day comfort.",
    sizes: ["8", "9", "10", "11"],
    colors: [
      { name: "Desert Sand", hex: "#C2B280" },
      { name: "Slate", hex: "#708090" }
    ]
  },
  {
    id: "3",
    name: "Trail Blazer Elite",
    category: "Outdoor",
    price: 210,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop"
    ],
    description: "Conquer any terrain with the Trail Blazer Elite. Waterproof GORE-TEX lining and aggressive tread pattern for superior grip.",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: [
      { name: "Forest Green", hex: "#228B22" },
      { name: "Earth Brown", hex: "#5D4037" }
    ],
    variants: [
      {
        name: "Forest Green",
        hex: "#228B22",
        images: [
          "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1520639889457-77513f669584?q=80&w=1974&auto=format&fit=crop"
        ],
        sizes: ["8", "9", "10", "11"]
      },
      {
        name: "Earth Brown",
        hex: "#5D4037",
        images: [
          "https://images.unsplash.com/photo-1541597471942-4929efa060db?q=80&w=1974&auto=format&fit=crop"
        ],
        sizes: ["7", "8", "9", "10", "11", "12"]
      }
    ],
    isSale: true,
    salePrice: 168
  },
  {
    id: "4",
    name: "Cloud Walker",
    category: "Lifestyle",
    price: 120,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop"
    ],
    description: "Experience the feeling of walking on clouds. Our softest foam ever in a sleek, minimalist design.",
    sizes: ["6", "7", "8", "9", "10"],
    colors: [
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Cloud Gray", hex: "#D3D3D3" }
    ]
  },
  {
    id: "5",
    name: "Velocity Pro",
    category: "Performance",
    price: 195,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop"
    ],
    description: "Designed for elite athletes. The Velocity Pro offers unparalleled energy return and a locked-in fit.",
    sizes: ["8", "9", "10", "11", "12"],
    colors: [
      { name: "Electric Blue", hex: "#0000FF" },
      { name: "Neon Yellow", hex: "#CCFF00" }
    ],
    isNew: true
  },
  {
    id: "6",
    name: "Retro Glide",
    category: "Lifestyle",
    price: 110,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1996&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1996&auto=format&fit=crop"
    ],
    description: "Classic 80s aesthetic meets modern comfort. A timeless silhouette for your everyday rotation.",
    sizes: ["7", "8", "9", "10", "11"],
    colors: [
      { name: "Vintage White", hex: "#F5F5DC" },
      { name: "Classic Navy", hex: "#000080" }
    ]
  }
];
