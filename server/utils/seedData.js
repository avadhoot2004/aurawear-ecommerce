import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

dotenv.config();

const sampleProducts = [
  // MEN
  {
    name: 'Oversized Heavyweight Cotton T-Shirt',
    description: 'Crafted from 240 GSM combed cotton with a relaxed boxy silhouette and dropped shoulders. Features reinforced crew neck and ribbed trim.',
    brand: 'Aura Studio',
    category: 'Topwear',
    subcategory: 'T-Shirts',
    gender: 'Men',
    price: 1999,
    discount: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Off-White', 'Washed Black', 'Sage Green'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 25,
    rating: 4.7,
    numberOfReviews: 84,
    tags: ['cotton', 'oversized', 'minimal', 'casual'],
    isFeatured: true
  },
  {
    name: 'Pure French Linen Relaxed Shirt',
    description: 'Breezy luxury crafted from 100% Normandy flax linen. Finished with natural mother-of-pearl buttons and a soft camp collar.',
    brand: 'LinenCraft',
    category: 'Topwear',
    subcategory: 'Shirts',
    gender: 'Men',
    price: 3499,
    discount: 20,
    sizes: ['M', 'L', 'XL'],
    colors: ['Sky Blue', 'Sand Beige', 'Pure White'],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 18,
    rating: 4.8,
    numberOfReviews: 42,
    tags: ['linen', 'summer', 'breathable', 'premium'],
    isFeatured: true
  },
  {
    name: 'Pleated Straight-Leg Tailored Trousers',
    description: 'Mid-rise tailored trousers with sharp front pleats and side adjusters. Designed with a clean drape and soft wool-blend texture.',
    brand: 'Aura Sartorial',
    category: 'Bottomwear',
    subcategory: 'Trousers',
    gender: 'Men',
    price: 4299,
    discount: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal Grey', 'Warm Taupe', 'Navy Blue'],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 14,
    rating: 4.6,
    numberOfReviews: 31,
    tags: ['tailored', 'formal', 'pleated', 'smart-casual'],
    isFeatured: true
  },
  {
    name: 'Vintage Wash Selvedge Denim Jacket',
    description: 'Classic 14oz Japanese selvedge denim jacket finished with antiqued brass buttons, welt pockets, and authentic distressing.',
    brand: 'Indigo Foundry',
    category: 'Outerwear',
    subcategory: 'Jackets',
    gender: 'Men',
    price: 5499,
    discount: 30,
    sizes: ['M', 'L', 'XL'],
    colors: ['Vintage Blue', 'Washed Indigo'],
    images: [
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 10,
    rating: 4.9,
    numberOfReviews: 112,
    tags: ['denim', 'selvedge', 'vintage', 'outerwear'],
    isFeatured: true
  },
  {
    name: 'Minimalist Leather Low-Top Sneakers',
    description: 'Handcrafted with Italian nappa leather and durable margom rubber soles. Cushioned memory-foam insoles for all-day comfort.',
    brand: 'Veloce Footwear',
    category: 'Footwear',
    subcategory: 'Sneakers',
    gender: 'Men',
    price: 5999,
    discount: 10,
    sizes: ['M', 'L', 'XL'],
    colors: ['All White', 'Monochrome Black'],
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 15,
    rating: 4.9,
    numberOfReviews: 67,
    tags: ['leather', 'sneakers', 'minimalist', 'footwear'],
    isFeatured: false
  },
  {
    name: 'Textured Waffle Knit Zip Cardigan',
    description: 'Midweight combed cotton cardigan with a textured waffle weave, double-ended YKK metal zipper, and ribbed standing collar.',
    brand: 'Aura Studio',
    category: 'Outerwear',
    subcategory: 'Knitwear',
    gender: 'Men',
    price: 3899,
    discount: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Forest Green', 'Oatmeal', 'Midnight Navy'],
    images: [
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 20,
    rating: 4.5,
    numberOfReviews: 29,
    tags: ['knitwear', 'waffle', 'cardigan', 'layering'],
    isFeatured: false
  },

  // WOMEN
  {
    name: 'Silk Slip Midi Dress with Cowl Neckline',
    description: 'Cut on the bias from luxurious mulberry silk blend that skims the silhouette gracefully. Features delicate adjustable straps and a fluid hem.',
    brand: 'Aura Atelier',
    category: 'Dresses',
    subcategory: 'Midi Dresses',
    gender: 'Women',
    price: 4999,
    discount: 20,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Champagne Gold', 'Emerald Green', 'Midnight Black'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 22,
    rating: 4.9,
    numberOfReviews: 145,
    tags: ['silk', 'slip-dress', 'evening', 'elegant'],
    isFeatured: true
  },
  {
    name: 'Double-Breasted Wool Oversized Blazer',
    description: 'Structured tailoring meets effortless relaxed drape. Designed with peak lapels, tortoise shell buttons, and interior piped seams.',
    brand: 'Aura Sartorial',
    category: 'Outerwear',
    subcategory: 'Blazers',
    gender: 'Women',
    price: 6499,
    discount: 15,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Houndstooth', 'Camel', 'Black'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 12,
    rating: 4.8,
    numberOfReviews: 76,
    tags: ['blazer', 'wool', 'tailored', 'workwear'],
    isFeatured: true
  },
  {
    name: 'High-Rise Wide-Leg Linen Trousers',
    description: 'Designed for fluid movement with high-rise waistband, deep slash pockets, and wide flared leg. Unlined for maximum breathability.',
    brand: 'LinenCraft',
    category: 'Bottomwear',
    subcategory: 'Trousers',
    gender: 'Women',
    price: 3299,
    discount: 25,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Terracotta', 'Ecru', 'Olive'],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 30,
    rating: 4.6,
    numberOfReviews: 53,
    tags: ['linen', 'wide-leg', 'summer', 'high-waist'],
    isFeatured: true
  },
  {
    name: 'Ribbed Knit Cashmere Mock-Neck Sweater',
    description: 'Spun from Grade-A Mongolian cashmere. Features fine gauge ribbing, subtle raglan sleeves, and ultra-soft cloud finish against the skin.',
    brand: 'Aura Atelier',
    category: 'Topwear',
    subcategory: 'Sweaters',
    gender: 'Women',
    price: 5999,
    discount: 30,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Alabaster', 'Soft Mauve', 'Espresso'],
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 16,
    rating: 4.9,
    numberOfReviews: 89,
    tags: ['cashmere', 'knitwear', 'cozy', 'luxury'],
    isFeatured: true
  },
  {
    name: 'Floral Print Tiered Maxi Sundress',
    description: 'Romantic vintage botanical print printed on airy organic cotton voile. Designed with ruffled sweetheart neck and tiered flounce hem.',
    brand: 'Bloom & Petal',
    category: 'Dresses',
    subcategory: 'Maxi Dresses',
    gender: 'Women',
    price: 3799,
    discount: 20,
    sizes: ['S', 'M', 'L'],
    colors: ['Floral Blush', 'Botanical Navy'],
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 20,
    rating: 4.7,
    numberOfReviews: 61,
    tags: ['floral', 'sundress', 'maxi', 'resortwear'],
    isFeatured: false
  },
  {
    name: 'Square-Toe Strappy Heeled Leather Sandals',
    description: 'Modern architectural square-toe sandal with slim buttery leather straps and an angled 65mm block heel for effortless balance.',
    brand: 'Veloce Footwear',
    category: 'Footwear',
    subcategory: 'Heels',
    gender: 'Women',
    price: 4499,
    discount: 15,
    sizes: ['S', 'M', 'L'],
    colors: ['Caramel', 'White Leather', 'Black'],
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 14,
    rating: 4.6,
    numberOfReviews: 38,
    tags: ['sandals', 'heels', 'leather', 'evening'],
    isFeatured: false
  },
  {
    name: 'Structured Leather Crescent Shoulder Bag',
    description: 'Sculpted smooth calfskin leather bag with curved crescent silhouette, polished gold buckle hardware, and secure magnetic flap.',
    brand: 'Aura Atelier',
    category: 'Accessories',
    subcategory: 'Bags',
    gender: 'Women',
    price: 3999,
    discount: 10,
    sizes: ['M'],
    colors: ['Dark Cognac', 'Noir', 'Ivory'],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 25,
    rating: 4.8,
    numberOfReviews: 95,
    tags: ['leather', 'handbag', 'shoulder-bag', 'accessories'],
    isFeatured: true
  },

  // KIDS
  {
    name: 'Organic Cotton Graphic Sweatshirt Set',
    description: 'Cozy two-piece set made with 100% GOTS certified organic french terry cotton. Ultra soft brushed interior with non-toxic botanical dye.',
    brand: 'Little Aura',
    category: 'Topwear',
    subcategory: 'Sweatshirts',
    gender: 'Kids',
    price: 1899,
    discount: 20,
    sizes: ['XS', 'S', 'M'],
    colors: ['Mustard Yellow', 'Sky Blue', 'Dusty Rose'],
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 35,
    rating: 4.8,
    numberOfReviews: 44,
    tags: ['kids', 'organic', 'cotton', 'cozy'],
    isFeatured: true
  },
  {
    name: 'Durable Denim Overalls with Adjustable Straps',
    description: 'Classic durable denim dungarees with brass snap clasps, reinforced knees for active play, and convenient multiple patch pockets.',
    brand: 'Little Aura',
    category: 'Bottomwear',
    subcategory: 'Overalls',
    gender: 'Kids',
    price: 2199,
    discount: 15,
    sizes: ['XS', 'S', 'M'],
    colors: ['Medium Wash Denim', 'Olive Green'],
    images: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 28,
    rating: 4.7,
    numberOfReviews: 32,
    tags: ['kids', 'denim', 'overalls', 'durable'],
    isFeatured: false
  },
  {
    name: 'Hooded Waterproof Raincoat with Fleece Lining',
    description: 'Windproof and rain-tight shell with reflective safety accents and playful dinosaur print. Warm micro-fleece inner lining.',
    brand: 'Little Aura',
    category: 'Outerwear',
    subcategory: 'Rainwear',
    gender: 'Kids',
    price: 2499,
    discount: 25,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Bright Yellow', 'Ocean Blue'],
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 20,
    rating: 4.9,
    numberOfReviews: 50,
    tags: ['kids', 'raincoat', 'waterproof', 'outerwear'],
    isFeatured: false
  },
  {
    name: 'Flexible Slip-On Canvas Kids Sneakers',
    description: 'Flexible non-skid rubber waffle sole, elastic gusset for easy slip-on without tying laces, and breathable organic cotton canvas.',
    brand: 'Little Aura',
    category: 'Footwear',
    subcategory: 'Sneakers',
    gender: 'Kids',
    price: 1499,
    discount: 10,
    sizes: ['XS', 'S', 'M'],
    colors: ['Navy Striped', 'Red Checker', 'Pure White'],
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 40,
    rating: 4.6,
    numberOfReviews: 27,
    tags: ['kids', 'canvas', 'sneakers', 'slip-on'],
    isFeatured: false
  },

  // UNISEX & ACCESSORIES
  {
    name: 'Heavyweight Fleece Relaxed Hoodie',
    description: '450 GSM brushed back fleece hoodie with a double-layered structured hood, no drawstrings for a clean profile, and kangaroo pouch.',
    brand: 'Aura Studio',
    category: 'Topwear',
    subcategory: 'Hoodies',
    gender: 'Unisex',
    price: 3299,
    discount: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Heather Grey', 'Charcoal', 'Bone'],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 30,
    rating: 4.8,
    numberOfReviews: 92,
    tags: ['hoodie', 'fleece', 'streetwear', 'unisex'],
    isFeatured: true
  },
  {
    name: 'Polarized Acetate Vintage Sunglasses',
    description: 'Hand-polished Italian acetate frame with UV400 polarized scratch-resistant lenses and 5-barrel German hinges for timeless styling.',
    brand: 'Aura Atelier',
    category: 'Accessories',
    subcategory: 'Eyewear',
    gender: 'Unisex',
    price: 2499,
    discount: 15,
    sizes: ['M'],
    colors: ['Tortoise Shell', 'Gloss Black', 'Honey Amber'],
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 50,
    rating: 4.7,
    numberOfReviews: 64,
    tags: ['sunglasses', 'accessories', 'unisex', 'eyewear'],
    isFeatured: false
  },
  {
    name: 'Top-Grain Leather Minimalist Cardholder',
    description: 'Slim bifold cardholder made with vegetable-tanned Italian leather with 6 card slots and central folded note pocket. RFID blocking.',
    brand: 'Aura Atelier',
    category: 'Accessories',
    subcategory: 'Wallets',
    gender: 'Unisex',
    price: 1299,
    discount: 10,
    sizes: ['M'],
    colors: ['Chestnut Tan', 'Matte Black'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 45,
    rating: 4.8,
    numberOfReviews: 53,
    tags: ['leather', 'wallet', 'minimal', 'accessories'],
    isFeatured: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder] Connected to MongoDB database...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany()
    ]);
    console.log('[Seeder] Cleared existing Users, Products, Carts, Orders.');

    // Create Admin User
    const adminUser = await User.create({
      name: 'AuraWear Admin',
      email: 'admin@aurawear.com',
      password: 'Admin@12345',
      role: 'admin',
      addresses: [
        {
          fullName: 'AuraWear Headquarters',
          phone: '+91 9876543210',
          street: '42 Fashion Avenue, Cyber City',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true
        }
      ]
    });

    // Create Sample Customer User
    const customerUser = await User.create({
      name: 'Rohit Sharma',
      email: 'customer@aurawear.com',
      password: 'Customer@12345',
      role: 'user',
      addresses: [
        {
          fullName: 'Rohit Sharma',
          phone: '+91 9811223344',
          street: 'Flat 402, Skyline Residency, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          isDefault: true
        }
      ]
    });

    console.log(`[Seeder] Created Admin (${adminUser.email}) and Customer (${customerUser.email}).`);

    // Insert Products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seeder] Inserted ${createdProducts.length} high-quality fashion products.`);

    console.log('[Seeder] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
