import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import * as schema from '../packages/database/src/schema/index.js';
import {
  business,
  contact,
  inventoryLocation,
  inventoryMove,
  product,
  productCategory,
  productVariant,
  productUnitMeasure,
} from '../packages/database/src/schema/index.js';
import { eq } from 'drizzle-orm';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

const BUSINESS_ID = '00000000-0000-0000-0000-000000000001';
const BUSINESS_ID_SUPPLIER = '00000000-0000-0000-0000-000000000002';

const now = new Date();
const daysAgo = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d;
};

async function seed() {
  console.log('🚀 Iniciando seeds de ecommerce...\n');

  console.log('📦 Verificando conexión a base de datos...');
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✓ Conexión exitosa\n');
  } catch (error) {
    console.error('✗ Error de conexión:', error);
    process.exit(1);
  }

  console.log('🏢 Creando Business...');
  await db.insert(business).values({
    id: BUSINESS_ID,
    name: 'TechStore Ecommerce',
    legalName: 'TechStore LLC',
    slug: 'techstore',
    countryCode: 'US',
    timezone: 'America/New_York',
    currencyCode: 'USD',
    publicName: 'TechStore',
    isActive: true,
    createdAt: new Date(),
  }).onConflictDoNothing();
  console.log('✓ Business creado: TechStore Ecommerce\n');

  console.log('📍 Creando Locations (Inventory)...');
  const warehouseId = '00000000-0000-0000-0000-000000000011';
  const supplierId = '00000000-0000-0000-0000-000000000012';
  const customerId = '00000000-0000-0000-0000-000000000013';
  const transitId = '00000000-0000-0000-0000-000000000014';
  const adjustmentId = '00000000-0000-0000-0000-000000000015';

  await db.insert(inventoryLocation).values([
    {
      id: warehouseId,
      businessId: BUSINESS_ID,
      code: 'WH-001',
      name: 'Almacén Principal',
      type: 'INTERNAL',
      isActive: true,
      isTransit: false,
      createdAt: new Date(),
    },
    {
      id: supplierId,
      businessId: BUSINESS_ID,
      code: 'SUPPLIER',
      name: 'Proveedor Genérico',
      type: 'SUPPLIER',
      isActive: true,
      isTransit: false,
      createdAt: new Date(),
    },
    {
      id: customerId,
      businessId: BUSINESS_ID,
      code: 'CUSTOMER',
      name: 'Cliente Externo',
      type: 'CUSTOMER',
      isActive: true,
      isTransit: false,
      createdAt: new Date(),
    },
    {
      id: transitId,
      businessId: BUSINESS_ID,
      code: 'TRANSIT',
      name: 'En Tránsito',
      type: 'TRANSIT',
      isActive: true,
      isTransit: true,
      createdAt: new Date(),
    },
    {
      id: adjustmentId,
      businessId: BUSINESS_ID,
      code: 'ADJUSTMENT',
      name: 'Ajuste de Inventario',
      type: 'ADJUSTMENT',
      isActive: true,
      isTransit: false,
      createdAt: new Date(),
    },
  ]).onConflictDoNothing();
  console.log('✓ Locations creados: WH-001, SUPPLIER, CUSTOMER, TRANSIT, ADJUSTMENT\n');

  console.log('📏 Creando Unit Measures (Sistema Americano)...');
  const unitMeasures = [
    { id: '00000000-0000-0000-0000-000000000020', name: 'Unit', abbreviation: 'u', type: 'unit', conversionFactor: '1', isDefault: true },
    { id: '00000000-0000-0000-0000-000000000021', name: 'Piece', abbreviation: 'pc', type: 'unit', conversionFactor: '1', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000022', name: 'Pound', abbreviation: 'lb', type: 'weight', conversionFactor: '453.592', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000023', name: 'Ounce', abbreviation: 'oz', type: 'weight', conversionFactor: '28.3495', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000024', name: 'Gallon', abbreviation: 'gal', type: 'volume', conversionFactor: '3785.41', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000025', name: 'Liter', abbreviation: 'L', type: 'volume', conversionFactor: '1000', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000026', name: 'Milliliter', abbreviation: 'mL', type: 'volume', conversionFactor: '1', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000027', name: 'Foot', abbreviation: 'ft', type: 'length', conversionFactor: '304.8', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000028', name: 'Inch', abbreviation: 'in', type: 'length', conversionFactor: '25.4', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000029', name: 'Box', abbreviation: 'box', type: 'unit', conversionFactor: '1', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000030', name: 'Pack', abbreviation: 'pack', type: 'unit', conversionFactor: '6', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000031', name: 'Dozen', abbreviation: 'dz', type: 'unit', conversionFactor: '12', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000032', name: 'Kilogram', abbreviation: 'kg', type: 'weight', conversionFactor: '1000', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000033', name: 'Square Foot', abbreviation: 'sq ft', type: 'area', conversionFactor: '929.03', isDefault: false },
  ];

  await db.insert(productUnitMeasure).values(
    unitMeasures.map(um => ({
      ...um,
      businessId: BUSINESS_ID,
      createdAt: new Date(),
    }))
  ).onConflictDoNothing();
  console.log('✓ Unit Measures creados: Unit, Piece, Pound, Ounce, Gallon, Liter, mL, Foot, Inch, Box, Pack, Dozen, Kilogram, sq ft\n');

  console.log('🏷️  Creando Categories...');
  const categories = [
    { id: '00000000-0000-0000-0000-000000000040', name: 'Electronics', description: 'Electronic devices and accessories' },
    { id: '00000000-0000-0000-0000-000000000041', name: 'Clothing & Apparel', description: 'Fashion and clothing items' },
    { id: '00000000-0000-0000-0000-000000000042', name: 'Home & Garden', description: 'Home decor and garden supplies' },
    { id: '00000000-0000-0000-0000-000000000043', name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
    { id: '00000000-0000-0000-0000-000000000044', name: 'Beauty & Personal Care', description: 'Beauty products and personal care items' },
    { id: '00000000-0000-0000-0000-000000000045', name: 'Toys & Games', description: 'Toys and board games' },
    { id: '00000000-0000-0000-0000-000000000046', name: 'Books & Media', description: 'Books, music and movies' },
    { id: '00000000-0000-0000-0000-000000000047', name: 'Food & Beverages', description: 'Food items and drinks' },
    { id: '00000000-0000-0000-0000-000000000048', name: 'Office Supplies', description: 'Office and school supplies' },
    { id: '00000000-0000-0000-0000-000000000049', name: 'Automotive', description: 'Car parts and accessories' },
    { id: '00000000-0000-0000-0000-000000000050', name: 'Pet Supplies', description: 'Pet food and accessories' },
    { id: '00000000-0000-0000-0000-000000000051', name: 'Health & Wellness', description: 'Health products and wellness items' },
    { id: '00000000-0000-0000-0000-000000000052', name: 'Baby & Kids', description: 'Baby products and kids items' },
    { id: '00000000-0000-0000-0000-000000000053', name: 'Tools & Hardware', description: 'Tools and hardware supplies' },
    { id: '00000000-0000-0000-0000-000000000054', name: 'Luggage & Travel', description: 'Luggage and travel accessories' },
    { id: '00000000-0000-0000-0000-000000000055', name: 'Jewelry & Watches', description: 'Jewelry and timepieces' },
    { id: '00000000-0000-0000-0000-000000000056', name: 'Party & Events', description: 'Party supplies and event decorations' },
    { id: '00000000-0000-0000-0000-000000000057', name: 'Digital Products', description: 'Digital downloads and software' },
  ];

  await db.insert(productCategory).values(
    categories.map(c => ({
      ...c,
      businessId: BUSINESS_ID,
      isActive: true,
      createdAt: new Date(),
    }))
  ).onConflictDoNothing();
  console.log(`✓ ${categories.length} Categories creadas\n`);

  console.log('📦 Creando Products...');

  const unitId = '00000000-0000-0000-0000-000000000020';
  const productsData = [
    // Electronics (5)
    { sku: 'ELEC-001', name: 'Wireless Bluetooth Headphones', description: 'High-quality wireless headphones with noise cancellation', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-002', name: 'USB-C Charging Cable 6ft', description: 'Durable braided USB-C cable', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-003', name: 'Portable Power Bank 10000mAh', description: 'Compact power bank for mobile devices', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-004', name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-005', name: 'Smart Watch Band', description: 'Replacement watch band for smart watches', basePrice: '15.99', categoryId: '00000000-0000-0000-0000-000000000040' },

    // Clothing & Apparel (5)
    { sku: 'CLTH-001', name: 'Cotton T-Shirt Basic', description: '100% cotton crew neck t-shirt', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'CLTH-002', name: 'Denim Jeans Classic', description: 'Classic fit denim jeans', basePrice: '49.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'CLTH-003', name: 'Running Shoes', description: 'Lightweight running shoes', basePrice: '89.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'CLTH-004', name: 'Winter Jacket', description: 'Insulated winter jacket', basePrice: '129.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'CLTH-005', name: 'Baseball Cap', description: 'Adjustable baseball cap', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000041' },

    // Home & Garden (5)
    { sku: 'HOME-001', name: 'LED Desk Lamp', description: 'Adjustable LED desk lamp with USB port', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOME-002', name: 'Indoor Plant Pot Set', description: 'Set of 3 ceramic plant pots', basePrice: '28.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOME-003', name: 'Throw Blanket', description: 'Soft fleece throw blanket', basePrice: '39.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOME-004', name: 'Garden Hose 50ft', description: 'Expandable garden hose', basePrice: '32.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOME-005', name: 'Wall Clock', description: 'Modern minimalist wall clock', basePrice: '22.99', categoryId: '00000000-0000-0000-0000-000000000042' },

    // Sports & Outdoors (5)
    { sku: 'SPRT-001', name: 'Yoga Mat', description: 'Non-slip yoga mat 6mm', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'SPRT-002', name: 'Dumbbell Set 20lb', description: 'Adjustable dumbbell set', basePrice: '59.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'SPRT-003', name: 'Camping Tent 4-Person', description: 'Waterproof camping tent', basePrice: '149.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'SPRT-004', name: 'Hiking Backpack 40L', description: 'Large capacity hiking backpack', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'SPRT-005', name: 'Bicycle Water Bottle', description: 'Insulated bike water bottle', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000043' },

    // Beauty & Personal Care (5)
    { sku: 'BEAU-001', name: 'Moisturizing Face Cream', description: 'Daily moisturizer for all skin types', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BEAU-002', name: 'Hair Shampoo 500mL', description: 'Nourishing shampoo for dry hair', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BEAU-003', name: 'Electric Toothbrush', description: 'Sonic electric toothbrush', basePrice: '49.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BEAU-004', name: 'Sunscreen SPF 50', description: 'Broad spectrum sunscreen', basePrice: '15.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BEAU-005', name: 'Perfume Gift Set', description: 'Eau de parfum gift box', basePrice: '69.99', categoryId: '00000000-0000-0000-0000-000000000044' },

    // Toys & Games (5)
    { sku: 'TOYS-001', name: 'Building Blocks Set 500pc', description: 'Creative building blocks for kids', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'TOYS-002', name: 'Board Game Monopoly', description: 'Classic Monopoly game', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'TOYS-003', name: 'Remote Control Car', description: 'Fast RC car with rechargeable battery', basePrice: '44.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'TOYS-004', name: 'Puzzle 1000 Pieces', description: 'Challenging jigsaw puzzle', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'TOYS-005', name: 'Stuffed Animal Bear', description: 'Soft plush teddy bear', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000045' },

    // Books & Media (5)
    { sku: 'BOOK-001', name: 'Bestseller Novel Hardcover', description: 'Award-winning fiction novel', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'BOOK-002', name: 'Cookbook Mediterranean', description: 'Mediterranean recipes cookbook', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'BOOK-003', name: 'Bluetooth Speaker', description: 'Portable wireless speaker', basePrice: '39.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'BOOK-004', name: 'Vinyl Record Classic Rock', description: 'Classic rock vinyl album', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'BOOK-005', name: 'E-Reader Screen Protector', description: 'Tempered glass screen protector', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000046' },

    // Food & Beverages (5)
    { sku: 'FOOD-001', name: 'Organic Coffee Beans 1lb', description: 'Fair trade organic coffee', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'FOOD-002', name: 'Green Tea 100 bags', description: 'Premium Japanese green tea', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'FOOD-003', name: 'Protein Bars 12 pack', description: 'High protein energy bars', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'FOOD-004', name: 'Olive Oil Extra Virgin 500mL', description: 'Cold pressed olive oil', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'FOOD-005', name: 'Dark Chocolate Bar 70%', description: 'Premium dark chocolate', basePrice: '5.99', categoryId: '00000000-0000-0000-0000-000000000047' },

    // Office Supplies (5)
    { sku: 'OFFC-001', name: 'Ballpoint Pens 24 pack', description: 'Blue ink ballpoint pens', basePrice: '8.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'OFFC-002', name: 'Legal Pad Yellow', description: 'Ruled legal size notepad', basePrice: '6.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'OFFC-003', name: 'Stapler Heavy Duty', description: 'Desktop stapler with staples', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'OFFC-004', name: 'File Folders 50 pack', description: 'Letter size manila folders', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'OFFC-005', name: 'Desk Organizer', description: 'Mesh metal desk organizer', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000048' },

    // Automotive (5)
    { sku: 'AUTO-001', name: 'Car Phone Mount', description: 'Magnetic phone holder for car', basePrice: '16.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-002', name: 'Tire Pressure Gauge', description: 'Digital tire pressure meter', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-003', name: 'Car Air Freshener', description: 'Long lasting car scent', basePrice: '7.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-004', name: 'Windshield Sunshade', description: 'Foldable sun reflector', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-005', name: 'Car Vacuum Cleaner', description: 'Portable car vacuum', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000049' },

    // Pet Supplies (5)
    { sku: 'PET-001', name: 'Dog Food 20lb', description: 'Premium dry dog food', basePrice: '44.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'PET-002', name: 'Cat Litter 25lb', description: 'Clumping cat litter', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'PET-003', name: 'Pet Collar', description: 'Adjustable nylon collar', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'PET-004', name: 'Dog Leash 6ft', description: 'Retractable dog leash', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'PET-005', name: 'Pet Toys Variety Pack', description: 'Assorted pet chew toys', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000050' },

    // Health & Wellness (5)
    { sku: 'HLTH-001', name: 'Vitamins Multivitamin', description: 'Daily multivitamin bottles', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'HLTH-002', name: 'First Aid Kit', description: 'Comprehensive first aid kit', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'HLTH-003', name: 'Digital Thermometer', description: 'Fast-read digital thermometer', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'HLTH-004', name: 'Massage Gun', description: 'Percussion muscle massage device', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'HLTH-005', name: 'Sleep Mask', description: 'Contoured sleep eye mask', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000051' },

    // Baby & Kids (5)
    { sku: 'BABY-001', name: 'Baby Diapers Huggies 80ct', description: 'Size 3 disposable diapers', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BABY-002', name: 'Baby Formula 32oz', description: 'Iron fortified infant formula', basePrice: '28.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BABY-003', name: 'Stuffed Animal Rabbit', description: 'Soft plush bunny toy', basePrice: '15.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BABY-004', name: 'Baby Wipes 100ct', description: 'Gentle baby wipes', basePrice: '8.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BABY-005', name: 'Nursing Pillow', description: 'Support nursing pillow', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000052' },

    // Tools & Hardware (5)
    { sku: 'TOOL-001', name: 'Screwdriver Set 10pc', description: 'Precision screwdriver set', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'TOOL-002', name: 'Tape Measure 25ft', description: 'Retractable tape measure', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'TOOL-003', name: 'Hammer Claw 16oz', description: 'Steel claw hammer', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'TOOL-004', name: 'Wrench Set Adjustable', description: 'Set of 3 adjustable wrenches', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'TOOL-005', name: 'Utility Knife', description: 'Retractable utility blade', basePrice: '8.99', categoryId: '00000000-0000-0000-0000-000000000053' },

    // Luggage & Travel (5)
    { sku: 'LUGG-001', name: 'Carry-On Suitcase 20in', description: 'Hard shell spinner suitcase', basePrice: '99.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'LUGG-002', name: 'Travel Pillow', description: 'Memory foam neck pillow', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'LUGG-003', name: 'TSA Lock', description: 'TSA approved combination lock', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'LUGG-004', name: 'Packing Cubes 6pc', description: 'Compression packing cubes', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'LUGG-005', name: 'Weekend Duffle Bag', description: 'Large canvas duffle bag', basePrice: '44.99', categoryId: '00000000-0000-0000-0000-000000000054' },

    // Jewelry & Watches (5)
    { sku: 'JEWE-001', name: 'Silver Necklace Chain', description: 'Sterling silver 18in chain', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JEWE-002', name: 'Leather Watch Band', description: 'Genuine leather watch strap', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JEWE-003', name: 'Stud Earrings Gold', description: '14K gold stud earrings', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JEWE-004', name: 'Bracelet Bangle', description: 'Stainless steel bangle bracelet', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JEWE-005', name: 'Ring Sizer Kit', description: 'Ring size measuring kit', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000055' },

    // Party & Events (5)
    { sku: 'PART-001', name: 'Balloon Kit 100ct', description: 'Assorted color balloons', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'PART-002', name: 'Paper Plates 50ct', description: 'Heavy duty party plates', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'PART-003', name: 'Streamers Roll', description: 'Colorful party streamers', basePrice: '6.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'PART-004', name: 'Birthday Candles 24pc', description: 'Number birthday candles', basePrice: '5.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'PART-005', name: 'Party Banner', description: 'Happy Birthday banner', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000056' },

    // Digital Products (5)
    { sku: 'DIGI-001', name: 'Gift Card $25', description: 'Digital gift card', basePrice: '25.00', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGI-002', name: 'E-Book Bestseller', description: 'Digital ebook download', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGI-003', name: 'Music Streaming 1 Month', description: 'Premium music subscription', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGI-004', name: 'Cloud Storage 100GB', description: 'Annual cloud storage plan', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGI-005', name: 'Online Course Access', description: 'Lifetime course access', basePrice: '49.99', categoryId: '00000000-0000-0000-0000-000000000057' },
  ];

  const productsInsert = productsData.map((p, index) => ({
    id: `00000000-0000-0000-0000-${String(1000 + index).padStart(12, '0')}`,
    businessId: BUSINESS_ID,
    sku: p.sku,
    name: p.name,
    description: p.description,
    type: 'storable' as const,
    categoryId: p.categoryId,
    basePrice: p.basePrice,
    currencyCode: 'USD',
    isActive: true,
    trackInventory: true,
    createdAt: daysAgo(Math.floor(Math.random() * 60) + 30),
  }));

  await db.insert(product).values(productsInsert).onConflictDoNothing();
  console.log(`✓ ${productsInsert.length} Products creados\n`);

  console.log('📥 Creando Inventory Moves (Stock Inicial)...');
  const movesData = productsInsert.map((p, index) => {
    const qty = String(Math.floor(Math.random() * 90) + 20);
    const daysBack = Math.floor(Math.random() * 60) + 15;
    return {
      id: `00000000-0000-0000-0000-${String(2000 + index).padStart(12, '0')}`,
      businessId: BUSINESS_ID,
      productId: p.id,
      variantId: null,
      moveType: 'INBOUND' as const,
      state: 'DONE' as const,
      fromLocationId: supplierId,
      toLocationId: warehouseId,
      quantity: qty,
      unitOfMeasureId: unitId,
      reference: `INI-${String(index + 1).padStart(4, '0')}`,
      notes: 'Stock inicial',
      externalId: null,
      originTable: null,
      originId: null,
      confirmedAt: daysAgo(daysBack),
      doneAt: daysAgo(daysBack),
      cancelledAt: null,
      createdAt: daysAgo(daysBack + 1),
      updatedAt: null,
      createdBy: null,
      updatedBy: null,
    };
  });

  await db.insert(inventoryMove).values(movesData).onConflictDoNothing();
  console.log(`✓ ${movesData.length} Inventory Moves creados (INBOUND → DONE)\n`);

  console.log('✨ Seeds completados exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`   - Business: TechStore Ecommerce (${BUSINESS_ID})`);
  console.log(`   - Locations: 5 (Warehouse, Supplier, Customer, Transit, Adjustment)`);
  console.log(`   - Unit Measures: 14`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${productsInsert.length}`);
  console.log(`   - Inventory Moves: ${movesData.length}`);
  console.log('\n🔗 Business ID para uso en API:');
  console.log(`   ${BUSINESS_ID}\n`);

  await pool.end();
}

seed().catch(console.error);
