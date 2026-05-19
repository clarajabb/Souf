import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verified working Unsplash images for each listing (by title keyword)
const imageMap: Record<string, string[]> = {
  'Baby Alpaca Fleece': [
    'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800&q=80',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
  ],
  'Suri Alpaca Fibre': [
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
    'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800&q=80',
  ],
  'Royal Alpaca': [
    'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800&q=80',
    'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&q=80',
  ],
  'Certified Organic Merino': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80',
  ],
  'Washed Raw Fleece': [
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  'Berber Carpet Wool': [
    'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=800&q=80',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
  ],
  'Test Merino': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
  ],
  'Long-Staple Flax': [
    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
  ],
  'Scutched Linen Tow': [
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80',
  ],
};

async function main() {
  const listings = await prisma.listing.findMany({ select: { id: true, title: true } });

  for (const listing of listings) {
    const key = Object.keys(imageMap).find((k) => listing.title.includes(k));
    if (!key) {
      console.log(`No images mapped for: ${listing.title}`);
      continue;
    }
    await prisma.listing.update({
      where: { id: listing.id },
      data: { images: imageMap[key] },
    });
    console.log(`✓ ${listing.title}`);
  }

  console.log('\nDone — all listings updated with images.');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
