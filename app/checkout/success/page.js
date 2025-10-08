'use client'

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

//Icon Imports
import { TbShoppingBagCheck } from "react-icons/tb";

// Cart Hook
import { useCart } from '@/app/hooks/useCart';

// Firebase imports
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast, { Toaster } from 'react-hot-toast';

// Component that uses useSearchParams
function CheckoutSuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [orderSaved, setOrderSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const saveOrderToFirebase = async (sessionData) => {
    try {
      const { metadata } = sessionData;
      
      // Parse the products from the metadata
      const products = JSON.parse(metadata.products || '[]');
      
      const orderData = {
        name: metadata.customerName,
        email: metadata.customerEmail,
        phone: metadata.customerPhone,
        requestShipping: metadata.requestShipping === 'true',
        products: products,
        total: parseFloat(metadata.total),
        paymentStatus: sessionData.payment_status,
        stripeSessionId: sessionData.id,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "Orders"), orderData);
      setOrderSaved(true);
      setIsProcessing(false);
      toast.success("Order saved successfully!");
      
    } catch (error) {
      console.error("Error saving order to Firebase: ", error);
      toast.error("Error saving order. Please contact support.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (sessionId && !orderSaved && !isProcessing) {
      setIsProcessing(true);
      
      // Fetch session details and save to Firebase
      fetch(`/api/checkout-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSession(data);
          setMetadata(data.metadata);
          
          // Save order to Firebase if payment was successful
          if (data.payment_status === 'paid') {
            saveOrderToFirebase(data);
          }
        })
        .catch(err => {
          console.error('Error fetching session:', err);
          toast.error("Error retrieving payment information.");
          setIsProcessing(false);
        });
      
      // Clear cart after successful payment
      clearCart();
    }
  }, [sessionId, orderSaved, isProcessing]);

  return (
    <div className='bg-[url("/images/backgrounds/SoilBackground.jpg")] bg-cover bg-center bg-fixed'>
      <Header />
      
      <main className="pt-21">

        <div className="bg-[#000000]/50">
          <Toaster position="top-center" />
          <div className="max-w-[90vw] lg:max-w-[80vw] mx-auto py-8 lg:py-16">
          
            <div className="overflow-hidden max-w-fit mx-auto p-8 lg:p-16 bg-white rounded-lg lg:rounded-xl shadow-lg">
              <div className="flex flex-col items-center justify-center">
                
                {/* Purchase Completed */}
                <TbShoppingBagCheck className="mb-4 lg:mb-8 size-16 lg:size-24 text-[#498118]" />
                <h1 className="mb-2 lg:mb-4 font-bold tracking-tight text-2xl lg:text-3xl text-[#101828]">
                  Payment Completed!
                </h1>
                <p className="text-center text-md lg:text-lg text-[#4A5565]">
                  Thank you for your purchase.<br/>Your order has been confirmed and saved to our records.
                </p>

                {/* Pending and Completed */}
                {/* {isProcessing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 font-medium">
                      🔄 Processing order...
                    </p>
                  </div>
                )}
                {orderSaved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">
                      ✅ Order successfully saved to database
                    </p>
                  </div>
                )} */}
            
                {/* {metadata && (
                  <div className="text-left text-black bg-gray-50 p-4 rounded-lg border border-cyan-500">
                    <h3 className="font-bold mb-2">Order Details:</h3>
                    <p><strong>Name:</strong> {metadata.customerName}</p>
                    <p><strong>Email:</strong> {metadata.customerEmail}</p>
                    <p><strong>Phone:</strong> {metadata.customerPhone}</p>
                    <p><strong>Shipping:</strong> {metadata.requestShipping === 'true' ? 'Requested' : 'Store Pickup'}</p>
                    <p><strong>Total:</strong> RM {parseFloat(metadata.total || 0).toFixed(2)}</p>
                  </div>
                )} */}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className='bg-[url("/images/backgrounds/SoilBackground.jpg")] bg-cover bg-center bg-fixed'>
      <Header />
      <main className="pt-21">
        <div className="bg-[#000000]/50">
          <div className="max-w-[90vw] lg:max-w-[80vw] mx-auto py-8 lg:py-16">
            <div className="overflow-hidden max-w-fit mx-auto p-8 lg:p-16 bg-white rounded-lg lg:rounded-xl shadow-lg">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#498118] mb-4"></div>
                <p className="text-[#4A5565]">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}