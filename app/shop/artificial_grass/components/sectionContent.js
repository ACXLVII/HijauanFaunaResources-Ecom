import { headers } from 'next/headers';
import ProductCard from './sectionProductCard'; // adjust path if needed

export default async function SectionContent() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}/api/artificial_grass`, { cache: 'no-store' });
  const products = await res.json();

  // Fallback to static products if Firestore is empty or loading fails
  const displayProducts = products.length > 0 ? products : (/* fallback */ []
  //   {
  //     slug: 'japanese-grass',
  //     name: 'Japanese Grass',
  //     coverImage: '/images/shop/live_grass/japanese/CoverImage.jpg',
  //     description: 'Also known as Zoysia japonica, is a fine-textured, dense, and low-maintenance turfgrass popular for its lush green appearance and ability to thrive in warm climates.',
  //     features: [
  //       { label: 'Low Maintenance', icon: FaWrench },
  //       { label: 'Durable', icon: FaShieldAlt },
  //       { label: 'Weather Resistant', icon: FaCloudSunRain },
  //     ],
  //     pricing: [
  //       { price: 'RM 5.00', sizeType: 'tile', measurement: '2ft x 1ft', icon: TbRuler },
  //     ],
  //   },
  //   {
  //     slug: 'philipine-grass',
  //     name: 'Philipine Grass',
  //     coverImage: '/images/shop/live_grass/philipine/CoverImage.jpg',
  //     description: 'Known for its fine texture and vibrant green color, is a popular choice for lawns and landscapes due to its soft feel and easy maintenance.',
  //     features: [
  //       { label: 'Low Maintenance', icon: FaWrench },
  //       { label: 'Durable', icon: FaShieldAlt },
  //       { label: 'Weather Resistant', icon: FaCloudSunRain },
  //     ],
  //     pricing: [
  //       { price: 'RM 5.00', sizeType: 'tile', measurement: '2ft x 1ft', icon: TbRuler },
  //     ],
  //   },
  //   {
  //     slug: 'pearl-grass',
  //     name: 'Pearl Grass',
  //     coverImage: '/images/shop/live_grass/pearl/CoverImage.jpg',
  //     description: 'Pearl Grass is a soft, low-growing ground cover known for its bright green color and ability to thrive in shaded areas.',
  //     features: [
  //       { label: 'Low Maintenance', icon: FaWrench },
  //       { label: 'Durable', icon: FaShieldAlt },
  //       { label: 'Weather Resistant', icon: FaCloudSunRain },
  //     ],
  //     pricing: [
  //       { price: 'RM 5.00', sizeType: 'tile', measurement: '2ft x 1ft', icon: TbRuler },
  //     ],
  //   },
  //   {
  //     slug: 'cow-grass',
  //     name: 'Cow Grass',
  //     coverImage: '/images/shop/live_grass/cow/CoverImage.jpg',
  //     description: 'Cow Grass is a hardy, low-maintenance turfgrass commonly used for lawns and open spaces due to its durability and ability to withstand heavy foot traffic.',
  //     features: [
  //       { label: 'Low Maintenance', icon: FaWrench },
  //       { label: 'Durable', icon: FaShieldAlt },
  //       { label: 'Weather Resistant', icon: FaCloudSunRain },
  //     ],
  //     pricing: [
  //       { price: 'RM 5.00', sizeType: 'tile', measurement: '2ft x 1ft', icon: TbRuler },
  //     ],
  //   },
  // ]
  );

  return (
    <div className="bg-[#000000]/50">
      <div className="max-w-[90vw] lg:max-w-[80vw] mx-auto py-8 lg:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {displayProducts.map((product) => (
            <ProductCard key={product.slug || product.id} product={product} />
          ))}
        </div>
        
      </div>
    </div>
  );
}