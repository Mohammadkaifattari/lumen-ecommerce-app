import { connectDB } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { PRODUCTS } from "@/lib/mockData";

async function seed() {
  await connectDB();
  await ProductModel.deleteMany({});
  
  const docs = PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    category: p.category,
    images: p.images.map((img) => img.src),
    colors: p.colors,
    sizes: p.sizes,
    stock: p.stock,
    rating: p.rating,
    reviewCount: p.reviewCount,
    badges: p.badges || [],
    featured: p.featured || false,
    createdAt: p.createdAt,
  }));

  await ProductModel.insertMany(docs);
  console.log(`✅ ${docs.length} products seeded`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });