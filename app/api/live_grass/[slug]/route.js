import { NextResponse } from 'next/server';
import { db } from '@/app/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export async function GET(request, { params }) {
  const { slug } = await params;

  // First, try to query by slug field
  let q = query(collection(db, "LiveGrass"), where("slug", "==", slug));
  let querySnapshot = await getDocs(q);

  // If not found by slug, try to query by document ID
  if (querySnapshot.empty) {
    try {
      const docRef = doc(db, "LiveGrass", slug);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        data.doc_id = docSnap.id;
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching by document ID:', error);
    }
    
    // If still not found, try querying by name (case-insensitive)
    const nameSlug = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase() + ' Grass';
    q = query(collection(db, "LiveGrass"), where("name", "==", nameSlug));
    querySnapshot = await getDocs(q);
  }

  if (querySnapshot.empty) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Assuming slug is unique, get the first match
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  data.doc_id = doc.id;

  // Add cache headers for better performance
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}