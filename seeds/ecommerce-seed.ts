import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../packages/database/src/schema/index.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema: schema });

const {
  business,
  inventoryLocation,
  productCategory,
  productUnitMeasure,
  product,
  inventoryMove,
} = schema;

const BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

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

  console.log('📍 Creando Locations (Inventario)...');
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
      code: 'PROV-001',
      name: 'Proveedor Genérico',
      type: 'SUPPLIER',
      isActive: true,
      isTransit: false,
      createdAt: new Date(),
    },
    {
      id: customerId,
      businessId: BUSINESS_ID,
      code: 'CLIENTE-001',
      name: 'Cliente Externo',
      type: 'CUSTOMER',
      isActive: true,
      isTransit: false,
      createdAt: new Date(),
    },
    {
      id: transitId,
      businessId: BUSINESS_ID,
      code: 'TRANSITO-001',
      name: 'En Tránsito',
      type: 'TRANSIT',
      isActive: true,
      isTransit: true,
      createdAt: new Date(),
    },
    {
      id: adjustmentId,
      businessId: BUSINESS_ID,
      code: 'AJUSTE-001',
      name: 'Ajuste de Inventario',
      type: 'ADJUSTMENT',
      isActive: true,
      isTransit: false,
      createdAt: new Date(),
    },
  ]).onConflictDoNothing();
  console.log('✓ Locations creados: WH-001, PROV-001, CLIENTE-001, TRANSITO-001, AJUSTE-001\n');

  console.log('📏 Creando Unidades de Medida (Sistema Americano)...');
  const unitMeasures = [
    { id: '00000000-0000-0000-0000-000000000020', name: 'Unidad', abbreviation: 'u', type: 'unit', conversionFactor: '1', isDefault: true },
    { id: '00000000-0000-0000-0000-000000000021', name: 'Pieza', abbreviation: 'pza', type: 'unit', conversionFactor: '1', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000022', name: 'Libra', abbreviation: 'lb', type: 'weight', conversionFactor: '453.592', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000023', name: 'Onza', abbreviation: 'oz', type: 'weight', conversionFactor: '28.3495', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000024', name: 'Galón', abbreviation: 'gal', type: 'volume', conversionFactor: '3785.41', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000025', name: 'Litro', abbreviation: 'L', type: 'volume', conversionFactor: '1000', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000026', name: 'Mililitro', abbreviation: 'mL', type: 'volume', conversionFactor: '1', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000027', name: 'Pie', abbreviation: 'ft', type: 'length', conversionFactor: '304.8', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000028', name: 'Pulgada', abbreviation: 'in', type: 'length', conversionFactor: '25.4', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000029', name: 'Caja', abbreviation: 'caja', type: 'unit', conversionFactor: '1', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000030', name: 'Paquete', abbreviation: 'paq', type: 'unit', conversionFactor: '6', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000031', name: 'Docena', abbreviation: 'dz', type: 'unit', conversionFactor: '12', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000032', name: 'Kilogramo', abbreviation: 'kg', type: 'weight', conversionFactor: '1000', isDefault: false },
    { id: '00000000-0000-0000-0000-000000000033', name: 'Pie Cuadrado', abbreviation: 'sq ft', type: 'area', conversionFactor: '929.03', isDefault: false },
  ];

  await db.insert(productUnitMeasure).values(
    unitMeasures.map(um => ({
      ...um,
      businessId: BUSINESS_ID,
      createdAt: new Date(),
    }))
  ).onConflictDoNothing();
  console.log('✓ Unidades de Medida creadas: Unidad, Pieza, Libra, Onza, Galón, Litro, mL, Pie, Pulgada, Caja, Paquete, Docena, Kilogramo, Pie Cuadrado\n');

  console.log('🏷️  Creando Categorías...');
  const categories = [
    { id: '00000000-0000-0000-0000-000000000040', name: 'Electrónica', description: 'Dispositivos electrónicos y accesorios' },
    { id: '00000000-0000-0000-0000-000000000041', name: 'Ropa y Accesorios', description: 'Moda y prendas de vestir' },
    { id: '00000000-0000-0000-0000-000000000042', name: 'Hogar y Jardín', description: 'Decoración del hogar y suministros de jardín' },
    { id: '00000000-0000-0000-0000-000000000043', name: 'Deportes y Exterior', description: 'Equipamiento deportivo y actividades al aire libre' },
    { id: '00000000-0000-0000-0000-000000000044', name: 'Belleza y Cuidado Personal', description: 'Productos de belleza y cuidado personal' },
    { id: '00000000-0000-0000-0000-000000000045', name: 'Juguetes y Juegos', description: 'Juguetes y juegos de mesa' },
    { id: '00000000-0000-0000-0000-000000000046', name: 'Libros y Medios', description: 'Libros, música y películas' },
    { id: '00000000-0000-0000-0000-000000000047', name: 'Alimentos y Bebidas', description: 'Alimentos y bebidas' },
    { id: '00000000-0000-0000-0000-000000000048', name: 'Papelería y Oficina', description: 'Suministros de oficina y escuela' },
    { id: '00000000-0000-0000-0000-000000000049', name: 'Automotriz', description: 'Refacciones y accesorios para automóviles' },
    { id: '00000000-0000-0000-0000-000000000050', name: 'Mascotas', description: 'Alimento y accesorios para mascotas' },
    { id: '00000000-0000-0000-0000-000000000051', name: 'Salud y Bienestar', description: 'Productos de salud y bienestar' },
    { id: '00000000-0000-0000-0000-000000000052', name: 'Bebés y Niños', description: 'Productos para bebés y niños' },
    { id: '00000000-0000-0000-0000-000000000053', name: 'Herramientas y Ferretería', description: 'Herramientas y suministros de ferretería' },
    { id: '00000000-0000-0000-0000-000000000054', name: 'Maletas y Viajes', description: 'Equipaje y accesorios de viaje' },
    { id: '00000000-0000-0000-0000-000000000055', name: 'Joyería y Relojes', description: 'Joyería y artículos de relojeria' },
    { id: '00000000-0000-0000-0000-000000000056', name: 'Fiestas y Eventos', description: 'Suministros para fiestas y decoración de eventos' },
    { id: '00000000-0000-0000-0000-000000000057', name: 'Productos Digitales', description: 'Descargas digitales y software' },
  ];

  await db.insert(productCategory).values(
    categories.map(c => ({
      ...c,
      businessId: BUSINESS_ID,
      isActive: true,
      createdAt: new Date(),
    }))
  ).onConflictDoNothing();
  console.log(`✓ ${categories.length} Categorías creadas\n`);

  console.log('📦 Creando Productos...');

  const unitId = '00000000-0000-0000-0000-000000000020';
  const productsData = [
    // Electrónica (5)
    { sku: 'ELEC-001', name: 'Audífonos Bluetooth Inalámbricos', description: 'Audífonos inalámbricos de alta calidad con cancelación de ruido', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-002', name: 'Cable USB-C 6ft', description: 'Cable USB-C trenzado de alta durabilidad', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-003', name: 'Batería Portátil 10000mAh', description: 'Batería externa compacta para dispositivos móviles', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-004', name: 'Ratón Inalámbrico', description: 'Ratón inalámbrico ergonómico', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000040' },
    { sku: 'ELEC-005', name: 'Correa para Smartwatch', description: 'Correa de repuesto para relojes inteligentes', basePrice: '15.99', categoryId: '00000000-0000-0000-0000-000000000040' },

    // Ropa y Accesorios (5)
    { sku: 'ROPA-001', name: 'Camiseta de Algodón Básica', description: 'Camiseta de manga corta 100% algodón', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'ROPA-002', name: 'Pantalones de Mezclilla Clásicos', description: 'Pantalones de mezclilla de corte clásico', basePrice: '49.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'ROPA-003', name: 'Zapatillas para Correr', description: 'Zapatillas ligeras para correr', basePrice: '89.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'ROPA-004', name: 'Chaqueta de Invierno', description: 'Chaqueta insulated para invierno', basePrice: '129.99', categoryId: '00000000-0000-0000-0000-000000000041' },
    { sku: 'ROPA-005', name: 'Gorra de Béisbol', description: 'Gorra de béisbol ajustable', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000041' },

    // Hogar y Jardín (5)
    { sku: 'HOGAR-001', name: 'Lámpara de Escritorio LED', description: 'Lámpara LED ajustable con puerto USB', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOGAR-002', name: 'Set de Macetas Decorativas', description: 'Set de 3 macetas cerámicas decorativas', basePrice: '28.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOGAR-003', name: 'Manta Decorativa', description: 'Manta suave de felpa para sofá', basePrice: '39.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOGAR-004', name: 'Manguera de Jardín 50ft', description: 'Manguera expandible para jardín', basePrice: '32.99', categoryId: '00000000-0000-0000-0000-000000000042' },
    { sku: 'HOGAR-005', name: 'Reloj de Pared Moderno', description: 'Reloj de pared minimalista moderno', basePrice: '22.99', categoryId: '00000000-0000-0000-0000-000000000042' },

    // Deportes y Exterior (5)
    { sku: 'DEP-001', name: 'Mat de Yoga', description: 'Mat de yoga anti-deslizante 6mm', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'DEP-002', name: 'Set de Mancuernas 20lb', description: 'Set de mancuernas ajustables', basePrice: '59.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'DEP-003', name: 'Tienda de Campaña 4 Personas', description: 'Tienda de campaña impermeable', basePrice: '149.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'DEP-004', name: 'Mochila de Senderismo 40L', description: 'Mochila de gran capacidad para senderismo', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000043' },
    { sku: 'DEP-005', name: 'Botella de Agua para Bicicleta', description: 'Botella térmica para bicicleta', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000043' },

    // Belleza y Cuidado Personal (5)
    { sku: 'BELLE-001', name: 'Crema Hidratante Facial', description: 'Hidratante diario para todo tipo de piel', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BELLE-002', name: 'Shampoo Nutritivo 500mL', description: 'Shampoo nutritivo para cabello seco', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BELLE-003', name: 'Cepillo de Dientes Eléctrico', description: 'Cepillo dental eléctrico sónico', basePrice: '49.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BELLE-004', name: 'Protector Solar SPF 50', description: 'Protector solar de amplio espectro', basePrice: '15.99', categoryId: '00000000-0000-0000-0000-000000000044' },
    { sku: 'BELLE-005', name: 'Set de Perfume Regalo', description: 'Caja de regalo Eau de parfum', basePrice: '69.99', categoryId: '00000000-0000-0000-0000-000000000044' },

    // Juguetes y Juegos (5)
    { sku: 'JUGU-001', name: 'Set de Bloques de Construcción 500pc', description: 'Bloques creativos para niños', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'JUGU-002', name: 'Juego de Mesa Dominó', description: 'Juego clásico de dominó', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'JUGU-003', name: 'Carro de Control Remoto', description: 'Carro RC rápido con batería recargable', basePrice: '44.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'JUGU-004', name: 'Rompecabezas 1000 Piezas', description: 'Rompecabezas desafiante', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000045' },
    { sku: 'JUGU-005', name: 'Peluche de Oso', description: 'Oso de peluche suave de felpa', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000045' },

    // Libros y Medios (5)
    { sku: 'LIB-001', name: 'Novela Best-seller Tapa Dura', description: 'Novela de ficción premiada', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'LIB-002', name: 'Libro de Cocina Mediterránea', description: 'Recetario de cocina mediterránea', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'LIB-003', name: 'Bocina Bluetooth Portátil', description: 'Bocina inalámbrica portable', basePrice: '39.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'LIB-004', name: 'Disco de Vinilo Rock Clásico', description: 'Álbum de rock clásico en vinilo', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000046' },
    { sku: 'LIB-005', name: 'Protector de Pantalla para E-Reader', description: 'Protector de vidrio templado', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000046' },

    // Alimentos y Bebidas (5)
    { sku: 'ALIM-001', name: 'Granos de Café Orgánico 1lb', description: 'Café orgánico de comercio justo', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'ALIM-002', name: 'Té Verde 100 bolsas', description: 'Té verde japonés premium', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'ALIM-003', name: 'Barras de Proteína 12 pzas', description: 'Barras energéticas altas en proteína', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'ALIM-004', name: 'Aceite de Oliva Extra Virgen 500mL', description: 'Aceite de oliva prensado en frío', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000047' },
    { sku: 'ALIM-005', name: 'Chocolate Obscuro 70%', description: 'Chocolate premium obscuro', basePrice: '5.99', categoryId: '00000000-0000-0000-0000-000000000047' },

    // Papelería y Oficina (5)
    { sku: 'PAPEL-001', name: 'Bolígrafos de Punto Fino 24 pzas', description: 'Bolígrafos de tinta azul', basePrice: '8.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'PAPEL-002', name: 'Block de Notas Amarillo', description: 'Block de notas tamaño legal', basePrice: '6.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'PAPEL-003', name: 'Grapadora Profesional', description: 'Grapadora de escritorio con grapas', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'PAPEL-004', name: 'Folders Manila 50 pzas', description: 'Folders tamaño carta manila', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000048' },
    { sku: 'PAPEL-005', name: 'Organizador de Escritorio', description: 'Organizador de escritorio de malla', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000048' },

    // Automotriz (5)
    { sku: 'AUTO-001', name: 'Soporte para Teléfono en Auto', description: 'Soporte magnético para auto', basePrice: '16.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-002', name: 'Medidor de Presión de Llantas', description: 'Medidor digital de presión de llantas', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-003', name: 'Ambientador para Auto', description: 'Fragancia duradera para auto', basePrice: '7.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-004', name: 'Cortina Parasol', description: 'Reflector de sol plegable', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000049' },
    { sku: 'AUTO-005', name: 'Aspiradora Portátil para Auto', description: 'Aspiradora de auto portátil', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000049' },

    // Mascotas (5)
    { sku: 'MASC-001', name: 'Alimento para Perro 20lb', description: 'Alimento seco premium para perro', basePrice: '44.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'MASC-002', name: 'Arena para Gato 25lb', description: 'Arena para gato aglomerante', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'MASC-003', name: 'Collar para Mascota', description: 'Collar ajustable de nylon', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'MASC-004', name: 'Correa para Perro 6ft', description: 'Correa extensible para perro', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000050' },
    { sku: 'MASC-005', name: 'Set de Juguetes para Mascota', description: 'Variedad de juguetes para masticar', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000050' },

    // Salud y Bienestar (5)
    { sku: 'SALUD-001', name: 'Vitaminas Multivitamínicas', description: 'Frasco de multivitaminas diario', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'SALUD-002', name: 'Kit de Primeros Auxilios', description: 'Kit completo de primeros auxilios', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'SALUD-003', name: 'Termómetro Digital', description: 'Termómetro digital de lectura rápida', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'SALUD-004', name: 'Pistola de Masajes', description: 'Dispositivo de masaje muscular percusivo', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000051' },
    { sku: 'SALUD-005', name: 'Máscara de Sueño', description: 'Máscara ocular contorneada para dormir', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000051' },

    // Bebés y Niños (5)
    { sku: 'BEBE-001', name: 'Pañales Talla 3 Huggies 80ct', description: 'Pañales desechables tamaño 3', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BEBE-002', name: 'Fórmula Infantil 32oz', description: 'Fórmula infantil fortificada con hierro', basePrice: '28.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BEBE-003', name: 'Peluche de Conejo', description: 'Juguete de felpa suave de conejo', basePrice: '15.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BEBE-004', name: 'Toallitas Húmedas para Bebé 100ct', description: 'Toallitas húmedas gentiles', basePrice: '8.99', categoryId: '00000000-0000-0000-0000-000000000052' },
    { sku: 'BEBE-005', name: 'Almohada de Lactancia', description: 'Almohada de soporte para amamantar', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000052' },

    // Herramientas y Ferretería (5)
    { sku: 'HERR-001', name: 'Set de Destornilladores 10pzas', description: 'Set de destornilladores de precisión', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'HERR-002', name: 'Cinta Métrica 25ft', description: 'Cinta métrica enrollable', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'HERR-003', name: 'Martillo de uña 16oz', description: 'Martillo de acero con uña', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'HERR-004', name: 'Set de Llaves Ajustables', description: 'Set de 3 llaves ajustables', basePrice: '29.99', categoryId: '00000000-0000-0000-0000-000000000053' },
    { sku: 'HERR-005', name: 'Cúter Retráctil', description: 'Hoja de cúter retráctil', basePrice: '8.99', categoryId: '00000000-0000-0000-0000-000000000053' },

    // Maletas y Viajes (5)
    { sku: 'VIAJE-001', name: 'Maleta de Mano 20pulg', description: 'Maleta rígida con ruedas', basePrice: '99.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'VIAJE-002', name: 'Almohada de Viaje', description: 'Almohada de espuma para cuello', basePrice: '18.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'VIAJE-003', name: 'Candado TSA', description: 'Candado aprobado por TSA', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'VIAJE-004', name: 'Cubos de Empaque 6pzas', description: 'Cubos compressores para viaje', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000054' },
    { sku: 'VIAJE-005', name: 'Bolsa de Fin de Semana', description: 'Bolsa de lona grande para viaje', basePrice: '44.99', categoryId: '00000000-0000-0000-0000-000000000054' },

    // Joyería y Relojes (5)
    { sku: 'JOYA-001', name: 'Cadena de Plata 18pulg', description: 'Cadena de plata esterlina', basePrice: '34.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JOYA-002', name: 'Correa de Cuero para Reloj', description: 'Correa de cuero genuino para reloj', basePrice: '24.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JOYA-003', name: 'Aretes de Oro para Perforación', description: 'Aretes de oro 14K', basePrice: '79.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JOYA-004', name: 'Pulsera de Acero Inoxidable', description: 'Pulsera tipo brazalete de acero', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000055' },
    { sku: 'JOYA-005', name: 'Kit de Tallas para Anillos', description: 'Kit medidor de tallas de anillo', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000055' },

    // Fiestas y Eventos (5)
    { sku: 'FIEST-001', name: 'Kit de Globos 100ct', description: 'Globos de colores variados', basePrice: '14.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'FIEST-002', name: 'Platos de Papel 50ct', description: 'Platos resistentes para fiesta', basePrice: '12.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'FIEST-003', name: 'Serpentinas Navideñas', description: 'Serpentinas coloridas para fiesta', basePrice: '6.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'FIEST-004', name: 'Velas de Cumpleaños 24pzas', description: 'Velas numéricas para pastel', basePrice: '5.99', categoryId: '00000000-0000-0000-0000-000000000056' },
    { sku: 'FIEST-005', name: 'Mantón Decorativo de Fiesta', description: 'Mantón decorativo para cumpleaños', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000056' },

    // Productos Digitales (5)
    { sku: 'DIGIT-001', name: 'Tarjeta de Regalo $25', description: 'Tarjeta de regalo digital', basePrice: '25.00', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGIT-002', name: 'E-Book Best-seller', description: 'Descarga de ebook digital', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGIT-003', name: 'Suscripción Streaming Música 1 Mes', description: 'Suscripción premium de música', basePrice: '9.99', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGIT-004', name: 'Almacenamiento en la Nube 100GB', description: 'Plan anual de almacenamiento', basePrice: '19.99', categoryId: '00000000-0000-0000-0000-000000000057' },
    { sku: 'DIGIT-005', name: 'Acceso a Curso en Línea', description: 'Acceso de por vida a curso', basePrice: '49.99', categoryId: '00000000-0000-0000-0000-000000000057' },
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
  console.log(`✓ ${productsInsert.length} Productos creados\n`);

  console.log('📥 Creando Movimientos de Inventario (Stock Inicial)...');
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
  console.log(`✓ ${movesData.length} Movimientos de Inventario creados (INBOUND → DONE)\n`);

  console.log('✨ Seeds completados exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`   - Business: TechStore Ecommerce (${BUSINESS_ID})`);
  console.log(`   - Locations: 5 (Almacén, Proveedor, Cliente, Tránsito, Ajuste)`);
  console.log(`   - Unidades de Medida: 14`);
  console.log(`   - Categorías: ${categories.length}`);
  console.log(`   - Productos: ${productsInsert.length}`);
  console.log(`   - Movimientos de Inventario: ${movesData.length}`);
  console.log('\n🔗 Business ID para uso en API:');
  console.log(`   ${BUSINESS_ID}\n`);

  await pool.end();
}

seed().catch(console.error);
