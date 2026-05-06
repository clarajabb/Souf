import { PrismaClient, FarmingPractice, MaterialType, ListingStatus, OrderStatus, SampleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FiberMarket database...');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── SUPPLIERS ──────────────────────────────────────────────────────────────
  const [alejandro, fatima, jean] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alejandro@andes-alpaca.com' },
      update: {},
      create: {
        email: 'alejandro@andes-alpaca.com',
        password: await hash('password123'),
        name: 'Alejandro Mamani',
        role: 'SUPPLIER',
        country: 'Peru',
        phone: '+51 999 123 456',
        language: 'es',
        isVerified: true,
        supplierProfile: {
          create: {
            farmName: 'Andes Alpaca Co.',
            description: 'Family-run alpaca farm at 4,200m altitude in the Puno region. We have raised alpacas for four generations, specialising in ultra-fine baby alpaca and Suri fleece. Our animals graze freely on the altiplano, untreated with pesticides or synthetic hormones.',
            location: 'Puno, Peru',
            region: 'Puno',
            lat: -15.8402,
            lng: -70.0219,
            farmingPractice: FarmingPractice.FREE_RANGE,
            certifications: ['GOTS', 'RWS', 'Fairtrade'],
            totalSales: 47,
            rating: 4.8,
          },
        },
      },
    }),

    prisma.user.upsert({
      where: { email: 'fatima@atlas-wool.ma' },
      update: {},
      create: {
        email: 'fatima@atlas-wool.ma',
        password: await hash('password123'),
        name: 'Fatima Benali',
        role: 'SUPPLIER',
        country: 'Morocco',
        phone: '+212 6 12 34 56 78',
        language: 'ar',
        isVerified: true,
        supplierProfile: {
          create: {
            farmName: 'Atlas Wool Cooperative',
            description: 'A women-led cooperative in the Middle Atlas Mountains, producing certified organic Merino and Berber wool. We process raw fleece using traditional stone-milling techniques blended with modern quality controls, resulting in exceptional loft and softness.',
            location: 'Azrou, Morocco',
            region: 'Fès-Meknès',
            lat: 33.4338,
            lng: -5.2218,
            farmingPractice: FarmingPractice.ORGANIC,
            certifications: ['GOTS', 'Oeko-Tex Standard 100'],
            totalSales: 31,
            rating: 4.6,
          },
        },
      },
    }),

    prisma.user.upsert({
      where: { email: 'jean@lin-normand.fr' },
      update: {},
      create: {
        email: 'jean@lin-normand.fr',
        password: await hash('password123'),
        name: 'Jean-Pierre Leroy',
        role: 'SUPPLIER',
        country: 'France',
        phone: '+33 2 31 00 12 34',
        language: 'fr',
        isVerified: false,
        supplierProfile: {
          create: {
            farmName: 'Lin Normand SARL',
            description: 'Third-generation linen grower in the Calvados department of Normandy — the heartland of European flax. Our fields benefit from the cool Atlantic climate ideal for long-staple fibre growth. We carry out full retting, scutching, and hackling on-site.',
            location: 'Calvados, France',
            region: 'Normandy',
            lat: 49.1,
            lng: -0.3,
            farmingPractice: FarmingPractice.CONVENTIONAL,
            certifications: ['European Flax', 'Masters of Linen'],
            totalSales: 12,
            rating: 4.3,
          },
        },
      },
    }),
  ]);

  // ── BUYERS ─────────────────────────────────────────────────────────────────
  const [nora, kai, amara] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'nora@ecothreads.com' },
      update: {},
      create: {
        email: 'nora@ecothreads.com',
        password: await hash('password123'),
        name: 'Nora Schmidt',
        role: 'BUYER',
        country: 'Germany',
        language: 'en',
        isVerified: false,
      },
    }),

    prisma.user.upsert({
      where: { email: 'kai@urbanweave.jp' },
      update: {},
      create: {
        email: 'kai@urbanweave.jp',
        password: await hash('password123'),
        name: 'Kai Nakamura',
        role: 'BUYER',
        country: 'Japan',
        language: 'en',
        isVerified: false,
      },
    }),

    prisma.user.upsert({
      where: { email: 'amara@labelamara.com' },
      update: {},
      create: {
        email: 'amara@labelamara.com',
        password: await hash('password123'),
        name: 'Amara Diallo',
        role: 'BUYER',
        country: 'Senegal',
        language: 'fr',
        isVerified: false,
      },
    }),
  ]);

  // ── LISTINGS ───────────────────────────────────────────────────────────────
  const listings = await Promise.all([
    // Alejandro's alpaca listings
    prisma.listing.create({
      data: {
        supplierId: alejandro.id,
        title: 'Baby Alpaca Fleece — Ultra-Fine Natural White',
        materialType: MaterialType.ALPACA,
        description: 'Harvested from young alpacas during their first shearing, this baby alpaca fleece measures 18–20 microns — softer than cashmere. Natural white enables easy dyeing. Ideal for luxury knitwear, scarves, and high-end accessories. Sorted and skirted by hand.',
        pricePerKg: 68.00,
        minimumOrderKg: 20,
        availableKg: 350,
        status: ListingStatus.ACTIVE,
        allowSamples: true,
        samplePriceUsd: 18.00,
        images: [],
      },
    }),

    prisma.listing.create({
      data: {
        supplierId: alejandro.id,
        title: 'Suri Alpaca Fibre — Lustrous Fawn',
        materialType: MaterialType.ALPACA,
        description: 'Suri alpaca produces silky, high-lustre fibre with a distinctive drape. This naturally fawn-coloured lot has been washed and dehaired. Perfect for lightweight woven fabrics and shawls. Certificate of origin included.',
        pricePerKg: 85.00,
        minimumOrderKg: 10,
        availableKg: 120,
        status: ListingStatus.ACTIVE,
        allowSamples: true,
        samplePriceUsd: 22.00,
        images: [],
      },
    }),

    // Fatima's wool listings
    prisma.listing.create({
      data: {
        supplierId: fatima.id,
        title: 'Certified Organic Merino Wool — 19 Micron',
        materialType: MaterialType.WOOL,
        description: 'GOTS-certified fine Merino wool from our cooperative\'s high-altitude sheep. Hand-sorted, cold-washed without detergent. 19-micron average — suitable for next-to-skin garments. Available in natural ecru; dyeable. Each batch traceable to individual flock.',
        pricePerKg: 42.00,
        minimumOrderKg: 50,
        availableKg: 800,
        status: ListingStatus.ACTIVE,
        allowSamples: true,
        samplePriceUsd: 12.00,
        images: [],
      },
    }),

    prisma.listing.create({
      data: {
        supplierId: fatima.id,
        title: 'Berber Carpet Wool — Undyed Natural Tones',
        materialType: MaterialType.WOOL,
        description: 'Coarser double-coated Berber sheep wool in a beautiful palette of natural browns, creams, and greys. Ideal for rugs, tapestry weaving, and outerwear. Washed and carded but not combed, preserving the characteristic crimp and resilience.',
        pricePerKg: 18.50,
        minimumOrderKg: 100,
        availableKg: 2200,
        status: ListingStatus.ACTIVE,
        allowSamples: false,
        samplePriceUsd: null,
        images: [],
      },
    }),

    prisma.listing.create({
      data: {
        supplierId: fatima.id,
        title: 'Washed Raw Fleece — Mixed Flock',
        materialType: MaterialType.WOOL,
        description: 'Entry-level bulk washed fleece from our mixed flock, excellent for cottage spinning, felt-making, or insulation projects. No chemical treatment. Sold in 10 kg bags. Minimum sample not offered due to low margin, but photos and fibre spec sheet available.',
        pricePerKg: 9.00,
        minimumOrderKg: 200,
        availableKg: 5000,
        status: ListingStatus.ACTIVE,
        allowSamples: false,
        samplePriceUsd: null,
        images: [],
      },
    }),

    // Jean's linen listings
    prisma.listing.create({
      data: {
        supplierId: jean.id,
        title: 'Long-Staple Flax Fibre — Wet-Retting Grade A',
        materialType: MaterialType.LINEN,
        description: 'Premium wet-retted flax from our Normandy fields. Long-staple (30–40cm) with excellent fineness and tensile strength. Grade A: suitable for fine shirting and dress-weight fabrics. Available in natural straw colour or after light bleaching. European Flax certified.',
        pricePerKg: 14.00,
        minimumOrderKg: 150,
        availableKg: 3500,
        status: ListingStatus.ACTIVE,
        allowSamples: true,
        samplePriceUsd: 9.00,
        images: [],
      },
    }),

    prisma.listing.create({
      data: {
        supplierId: jean.id,
        title: 'Scutched Linen Tow — Second-Grade Spinning Fibre',
        materialType: MaterialType.LINEN,
        description: 'Shorter fibres and tow from our scutching process. Excellent for blended yarns, linen-cotton mixes, and industrial textile applications. Sold in 25 kg bales. Consistent quality, certificate of European origin. Good value bulk option.',
        pricePerKg: 5.50,
        minimumOrderKg: 500,
        availableKg: 8000,
        status: ListingStatus.ACTIVE,
        allowSamples: false,
        samplePriceUsd: null,
        images: [],
      },
    }),

    // Additional variety listings
    prisma.listing.create({
      data: {
        supplierId: alejandro.id,
        title: 'Royal Alpaca Fibre — 16 Micron (Limited Batch)',
        materialType: MaterialType.ALPACA,
        description: 'Exceptionally rare batch of 16-micron alpaca fibre — finer than the finest cashmere. Sourced from a single high-altitude herd, hand-combed and sorted. Only 80 kg available this season. First-come, first-served.',
        pricePerKg: 145.00,
        minimumOrderKg: 5,
        availableKg: 80,
        status: ListingStatus.ACTIVE,
        allowSamples: true,
        samplePriceUsd: 35.00,
        images: [],
      },
    }),
  ]);

  const [listing1, , listing3] = listings;

  // ── ORDERS ─────────────────────────────────────────────────────────────────
  const order1 = await prisma.order.create({
    data: {
      listingId: listing1.id,
      buyerId: nora.id,
      supplierId: alejandro.id,
      quantityKg: 50,
      totalPriceUsd: 3400.00,
      status: OrderStatus.DELIVERED,
      stripePaymentIntentId: 'pi_seed_001_delivered',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      listingId: listing3.id,
      buyerId: kai.id,
      supplierId: fatima.id,
      quantityKg: 100,
      totalPriceUsd: 4200.00,
      status: OrderStatus.SHIPPED,
      stripePaymentIntentId: 'pi_seed_002_shipped',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      listingId: listing1.id,
      buyerId: amara.id,
      supplierId: alejandro.id,
      quantityKg: 30,
      totalPriceUsd: 2040.00,
      status: OrderStatus.DELIVERED,
      stripePaymentIntentId: 'pi_seed_003_delivered',
    },
  });

  // ── SAMPLE REQUESTS ────────────────────────────────────────────────────────
  await Promise.all([
    prisma.sampleRequest.create({
      data: {
        listingId: listing1.id,
        buyerId: kai.id,
        supplierId: alejandro.id,
        status: SampleStatus.RECEIVED,
        paidAt: new Date('2024-02-10'),
      },
    }),
    prisma.sampleRequest.create({
      data: {
        listingId: listing3.id,
        buyerId: nora.id,
        supplierId: fatima.id,
        status: SampleStatus.SHIPPED,
      },
    }),
  ]);

  // ── REVIEWS ────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.review.create({
      data: {
        orderId: order1.id,
        reviewerId: nora.id,
        targetUserId: alejandro.id,
        rating: 5,
        comment: 'Absolutely exceptional quality. The baby alpaca was softer than anything I have worked with before. Alejandro was responsive and shipping was well-packaged. Will definitely order again.',
      },
    }),
    prisma.review.create({
      data: {
        orderId: order1.id,
        reviewerId: alejandro.id,
        targetUserId: nora.id,
        rating: 5,
        comment: 'Nora is a pleasure to work with — clear communication and payment was immediate. Highly recommended buyer.',
      },
    }),
    prisma.review.create({
      data: {
        orderId: order3.id,
        reviewerId: amara.id,
        targetUserId: alejandro.id,
        rating: 5,
        comment: 'Troisième commande avec Alejandro. Qualité constante, fibre propre et bien triée. Livraison rapide malgré la distance.',
      },
    }),
  ]);

  // ── MESSAGES ───────────────────────────────────────────────────────────────
  const msgs = [
    { senderId: nora.id, receiverId: alejandro.id, content: 'Hello! I saw your baby alpaca listing — do you offer a sample before I commit to a large order?', createdAt: new Date('2024-01-15T09:00:00Z') },
    { senderId: alejandro.id, receiverId: nora.id, content: 'Hi Nora! Absolutely. We offer 200g sample packs for $18 including shipping. I can send swatches as well if that helps.', createdAt: new Date('2024-01-15T10:30:00Z') },
    { senderId: nora.id, receiverId: alejandro.id, content: 'Perfect. I will go ahead and request a sample through the platform. Looking forward to seeing it!', createdAt: new Date('2024-01-15T10:45:00Z') },
    { senderId: alejandro.id, receiverId: nora.id, content: 'Sample shipped today! Tracking: PE123456789. Should arrive in 7-10 days.', createdAt: new Date('2024-01-17T08:00:00Z') },
    { senderId: kai.id, receiverId: fatima.id, content: 'Bonjour Fatima — I am interested in the organic Merino. Can you tell me more about the washing process?', createdAt: new Date('2024-02-01T07:00:00Z') },
    { senderId: fatima.id, receiverId: kai.id, content: 'Bonjour Kai! We use cold water only with no detergent. The lanolin is largely preserved which gives the wool its natural softness. Happy to send our full process document.', createdAt: new Date('2024-02-01T09:15:00Z') },
    { senderId: kai.id, receiverId: fatima.id, content: 'That sounds wonderful. Please do send the document. We are developing a new natural care line.', createdAt: new Date('2024-02-01T10:00:00Z') },
    { senderId: amara.id, receiverId: jean.id, content: 'Bonjour Jean-Pierre. Je cherche du lin pour une collection printemps/été. Est-ce que votre fibre peut être teinte en couleurs pastel?', createdAt: new Date('2024-03-05T14:00:00Z') },
    { senderId: jean.id, receiverId: amara.id, content: 'Bonjour Amara! Oui, notre lin blanc peut être teint facilement. Je recommande un blanchiment léger avant teinture pour des résultats optimaux. Souhaitez-vous un échantillon?', createdAt: new Date('2024-03-05T16:30:00Z') },
  ];

  for (const msg of msgs) {
    await prisma.message.create({ data: msg });
  }

  // Update supplier ratings
  await prisma.supplierProfile.updateMany({
    where: { userId: alejandro.id },
    data: { rating: 4.8, totalSales: 49 },
  });

  console.log('✓ Seed complete!');
  console.log('');
  console.log('Test accounts:');
  console.log('  SUPPLIER  alejandro@andes-alpaca.com / password123');
  console.log('  SUPPLIER  fatima@atlas-wool.ma      / password123');
  console.log('  SUPPLIER  jean@lin-normand.fr        / password123');
  console.log('  BUYER     nora@ecothreads.com        / password123');
  console.log('  BUYER     kai@urbanweave.jp          / password123');
  console.log('  BUYER     amara@labelamara.com       / password123');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
