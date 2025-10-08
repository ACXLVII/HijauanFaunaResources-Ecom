import { NextResponse } from 'next/server';
import { db } from '@/app/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  const querySnapshot = await getDocs(collection(db, "LiveGrass"));
  const productsArr = [];
  querySnapshot.forEach((doc) => {
    let data = doc.data();
    data.doc_id = doc.id;
    productsArr.push({ id: doc.id, ...data });
  });
  return NextResponse.json(productsArr);
}