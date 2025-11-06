import React from 'react';

import { headers } from 'next/headers';
import ProductCard from './sectionProductCard'; // adjust path if needed

export default async function SectionContent() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}/api/artificial_grass`, { cache: 'no-store' });
  const products = await res.json();

  return (
    <div className="bg-[#000000]/50">
      <div className="max-w-[90vw] lg:max-w-[80vw] mx-auto py-8 lg:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {products.map((product) => (
            <ProductCard key={product.slug || product.id} product={product} />
          ))}
        </div>
        
      </div>
    </div>
  );
}