'use client'

import React, { useState } from 'react';
import Image from 'next/image';

import toast, { Toaster } from 'react-hot-toast';

// STRIPE
import getStripe from "../../stripe";

// Cart Hook
import { useCart } from '@/app/hooks/useCart';

// Icon Imports
import { FaStore, FaTruck } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";

export default function SectionCheckout() {
  const { cart } = useCart();
  const productsInCart = cart;
  const [orderData, setOrderData] = useState({
    name: "",
    email: "",
    phone: "",
    requestShipping: false,
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false
  });
  const [focusedField, setFocusedField] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = productsInCart.reduce((sum, product) => {
    const price = parseFloat(String(product.price).replace(/[^0-9.-]+/g, ""));
    return sum + price;
  }, 0);
  
  const total = subtotal;
  
  const selectedProductFields = productsInCart.map(product => ({
    category: product.category,
    id: product.id,
    quantity: product.quantity,
    sizeType: product.sizeType,
    price: product.price,
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Mark field as touched when it has any value (including autofill)
    if ((name === 'name' || name === 'email' || name === 'phone') && value.trim().length > 0) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleStripeCheckout = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      // if (!orderData.email || !orderData.name || !orderData.phone) {
      //   toast.error("Please fill in all required fields");
      //   setLoading(false);
      //   return;
      // }

      // Prepare line items for Stripe
      const lineItems = productsInCart.map(product => ({
        price: product.priceID,
        quantity: product.quantity,
      }));

      // const lineItems = [
      //   // LIVE GRASS
      //   // Japanese
      //   {
      //     price: 'price_1RwGPHFg23GXTtGmzR5eOtLN',
      //     quantity: 400,
      //   },
      //   // Philippine
      //   {
      //     price: 'price_1RwGOWFg23GXTtGmxArMvtYC',
      //     quantity: 400,
      //   },
      //   // Pearl
      //   {
      //     price: 'price_1RwGQ2Fg23GXTtGmP7bPQAbU',
      //     quantity: 400,
      //   },
      //   // Cow
      //   {
      //     price: 'price_1RwGQeFg23GXTtGmlRrgkvKx',
      //     quantity: 400,
      //   },
      //   // ARTIFICIAL GRASS
      //   // 15mm Golf
      //   {
      //     price: 'price_1RyV5cFg23GXTtGmThoFJTuD',
      //     quantity: 400,
      //   },
      //   //25mm Sqft
      //   {
      //     price: 'price_1RwGTRFg23GXTtGmE5gL2uPF',
      //     quantity: 400,
      //   },
      //   // 25mm Roll
      //   {
      //     price: 'price_1RwGTmFg23GXTtGmjCDNpHzc',
      //     quantity: 400,
      //   },
      //   // 30mm Sqft
      //   {
      //     price: 'price_1RwGUKFg23GXTtGmbk9O3xwz',
      //     quantity: 400,
      //   },
      //   // 30mm Roll
      //   {
      //     price: 'price_1RwGUrFg23GXTtGmIWhe6qam',
      //     quantity: 400,
      //   },
      //   // 35mm Sqft
      //   {
      //     price: 'price_1RwGYtFg23GXTtGm5SUHrPV4',
      //     quantity: 400,
      //   },
      //   // 35mm Roll
      //   {
      //     price: 'price_1RwGZCFg23GXTtGmB1R1PgIx',
      //     quantity: 400,
      //   },
      //   // 40mm Sqft
      //   {
      //     price: 'price_1RwGZkFg23GXTtGmfLoFF4EP',
      //     quantity: 400,
      //   },
      //   // 40mm Roll
      //   {
      //     price: 'price_1RwGa5Fg23GXTtGmDuzk9d6e',
      //     quantity: 400,
      //   }
      // ]

      // Create checkout session
      console.log("Line Items:", lineItems);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: lineItems,
          customerEmail: orderData.email,
          metadata: {
            customerName: orderData.name,
            customerEmail: orderData.email,
            customerPhone: orderData.phone,
            requestShipping: orderData.requestShipping,
            products: JSON.stringify(selectedProductFields),
            total: total.toString(),
          },
        }),
      });
      console.log("Metadata: ", orderData.metadata);

      const { sessionId, error } = await response.json();

      if (error) {
        toast.error("Error creating checkout session");
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        toast.error("Error redirecting to checkout");
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      toast.error("An error occurred during checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation Logic
  const isNameValid = orderData.name.trim().length > 0;
  const isEmailValid = /\S+@\S+\.\S+/.test(orderData.email);
  const isPhoneValid = orderData.phone.trim().length > 9 && !/[a-zA-Z]/.test(orderData.phone);
  const isFormValid = isNameValid && isEmailValid && isPhoneValid;
  
  // Helper functions for consistent error display (hide errors for focused field)
  const shouldShowNameError = focusedField !== 'name' && (showErrors || (touched.name && orderData.name.trim().length > 0)) && !isNameValid;
  const shouldShowEmailError = focusedField !== 'email' && (showErrors || (touched.email && orderData.email.trim().length > 0)) && !isEmailValid;
  const shouldShowPhoneError = focusedField !== 'phone' && (showErrors || (touched.phone && orderData.phone.trim().length > 0)) && !isPhoneValid;
  
  // Error Messages
  const nameError = shouldShowNameError ? 'Please enter your name.' : '';
  const emailError = shouldShowEmailError ? 'Please enter a valid email address.' : '';
  const phoneError = shouldShowPhoneError ? 'Please enter a valid phone number.' : '';
  
  // Handle Disabled Button Click
  const handleDisabledButtonClick = () => {
    // Mark all fields as touched AND enable error display
    setTouched({
      name: true,
      email: true,
      phone: true
    });
    setShowErrors(true);
  };

  return (
    <div className="bg-[#000000]/50">
      <Toaster position="top-center" />
      <div className="max-w-[90vw] lg:max-w-[80vw] mx-auto py-8 lg:py-16">

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">

          {/* Order Summary */}
          <div className="mb-4 lg:mb-0 p-4 lg:p-8 bg-[#FFFFFF] rounded-lg lg:rounded-xl shadow-lg">

            <h2 className="mb-2 lg:mb-4 font-bold tracking-tight text-lg lg:text-xl text-[#101828]">
              Order Summary
            </h2>

            <hr className="border-t-2 border-[#C39533]" />

            <ul className="divide-y divide-[#CCCCCC]">
              {productsInCart.length === 0 ? (
                <li className="py-8 text-center text-[#4A5565]">Your cart is empty.</li>
              ) : (
                productsInCart.map((product, idx) => (
                  <li key={idx} className="flex items-center py-2 lg:py-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="size-16 mr-2 lg:mr-4 rounded-md object-cover border-2 border-[#C39533]"
                      width={64}
                      height={64}
                    />
                    <div className="flex-1">
                      <h2 className="font-bold tracking-tight text-md lg:text-lg text-[#101828]">
                        {product.name}
                      </h2>
                      <p className="text-md lg:text-lg text-[#4A5565]">
                        Quantity: <span className="font-bold text-[#C39533]">{product.quantity}</span> {product.sizeType}(s)
                      </p>
                    </div>
                    <p className="font-bold tracking-tight text-md lg:text-lg text-[#498118]">
                      RM {parseFloat(product.price).toFixed(2)}
                    </p>
                  </li>
                ))
              )}
            </ul>

            <hr className="mb-2 lg:mb-4 border-t border-[#CCCCCC]" />

            <div className="space-y-2 lg:space-y-4 text-md lg:text-lg">
              <div className="flex justify-between">
                <span className="text-[#4A5565]">Subtotal:</span>
                <span className="font-bold text-[#498118]">RM {subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <hr className="my-2 lg:my-4 border-t-2 border-[#C39533]" />
            
            <div className="flex justify-between font-bold text-2xl lg:text-3xl">
              <span className="text-[#101828]">Total:</span>
              <span className="text-[#498118]">RM {total.toFixed(2)}</span>
            </div>

          </div>

          {/* Checkout Form */}
          <div className="p-4 lg:p-8 bg-[#FFFFFF] rounded-lg lg:rounded-xl shadow-lg">
            <h2 className="mb-4 font-bold tracking-tight text-lg lg:text-xl text-[#101828]">
              Customer Information
            </h2>
            <hr className="mb-4 border-t-2 border-[#C39533]" />

            <form className="space-y-2 lg:space-y-4">

              {/* Name */}
              <div className="">
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-md lg:text-lg text-[#4A5565]">
                    Name: <span className="text-red-500">*</span>
                  </h3>
                  { nameError && (
                    <div role="alert" className="text-sm lg:text-md text-red-500">{nameError}</div>
                  )}
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={orderData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => {
                    setTouched(t => ({ ...t, name: true }));
                    setFocusedField(null);
                  }}
                  className={`h-10 lg:h-12 w-full px-1.5 lg:px-2 text-md lg:text-lg text-[#101828] rounded-md lg:rounded-lg border-2 focus:outline-none ${
                    touched.name && isNameValid 
                      ? 'border-[#C39533]' 
                      : shouldShowNameError 
                        ? 'border-red-500' 
                        : 'border-[#AAAAAA] focus:border-[#C39533]'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="">
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-md lg:text-lg text-[#4A5565]">
                    Email address: <span className="text-red-500">*</span>
                  </h3>
                  { emailError && (
                    <div role="alert" className="text-sm lg:text-md text-red-500">{emailError}</div>
                  )}
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={orderData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => {
                    setTouched(t => ({ ...t, email: true }));
                    setFocusedField(null);
                  }}
                  className={`h-10 lg:h-12 w-full px-1.5 lg:px-2 text-md lg:text-lg text-[#101828] rounded-md lg:rounded-lg border-2 focus:outline-none ${
                    touched.email && isEmailValid 
                      ? 'border-[#C39533]' 
                      : shouldShowEmailError 
                        ? 'border-red-500' 
                        : 'border-[#AAAAAA] focus:border-[#C39533]'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone Number */}
              <div className="">
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-md lg:text-lg text-[#4A5565]">
                    Phone Number: <span className="text-red-500">*</span>
                  </h3>
                  { phoneError && (
                    <div role="alert" className="text-sm lg:text-md text-red-500">{phoneError}</div>
                  )}
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={orderData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => {
                    setTouched(t => ({ ...t, phone: true }));
                    setFocusedField(null);
                  }}
                  className={`h-10 lg:h-12 w-full px-1.5 lg:px-2 text-md lg:text-lg text-[#101828] rounded-md lg:rounded-lg border-2 focus:outline-none ${
                    touched.phone && isPhoneValid 
                      ? 'border-[#C39533]' 
                      : shouldShowPhoneError 
                        ? 'border-red-500' 
                        : 'border-[#AAAAAA] focus:border-[#C39533]'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <p className="text-center text-sm lg:text-md text-[#4A5565]">
                <span className="text-red-500">*</span> Required fields
              </p>

              {/* Preference Checkboxes */}
              <div className="">
                <h3 className="mb-1 lg:mb-2 text-md lg:text-lg text-[#4A5565]">
                  Options:
                </h3>
                <div className="grid grid-cols-2 gap-2 lg:gap-4">
                  {/* Pickup Button */}
                  <button
                    className={`
                      flex flex-col p-2 lg:p-4
                      ${!orderData.requestShipping ? 'text-[#C39533] shadow-lg border-2 border-[#C39533]' : 'text-[#AAAAAA] border-2 border-[#AAAAAA] cursor-pointer'}
                      rounded-md lg:rounded-lg
                    `}
                    onClick={() => setOrderData(prev => ({ ...prev, requestShipping: false }))}
                    type="button"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <FaStore className="size-10 lg:size-12" />
                      <p className="font-bold tracking-tight text-center text-xl lg:text-2xl">
                        Store<br/>Pickup
                      </p>
                    </div>
                  </button>
                  {/* Request Shipping Button */}
                  <button
                    className={`
                      flex flex-col p-2 lg:p-4
                      ${orderData.requestShipping ? 'text-[#C39533] shadow-lg border-2 border-[#C39533]' : 'text-[#AAAAAA] border-2 border-[#AAAAAA] cursor-pointer'}
                      rounded-md lg:rounded-lg
                    `}
                    onClick={() => setOrderData(prev => ({ ...prev, requestShipping: true }))}
                    type="button"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <FaTruck className="size-10 lg:size-12" />
                      <p className="font-bold tracking-tight text-center text-xl lg:text-2xl">
                        Request<br/>Shipping
                      </p>
                    </div>
                  </button>
                </div>
                {/* Shipping Disclaimer - appears when shipping is selected */}
                {orderData.requestShipping && (
                  <div className="mt-2 lg:mt-4 p-2 lg:p-4 bg-yellow-50 rounded-md lg:rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1 lg:mb-2">
                      <IoInformationCircleOutline className="size-6 text-yellow-800" />
                      <p className="font-bold text-md lg:text-lg text-yellow-800">
                        Shipping Information
                      </p>
                    </div>
                    <p className="text-justify text-sm lg:text-md text-yellow-800">
                      Shipping fees will be calculated based on your location and order size. 
                      We will contact you with shipping costs before processing your payment. 
                      Delivery time is typically 3-7 business days.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={!isFormValid ? handleDisabledButtonClick : handleStripeCheckout}
                className={`w-full p-2 lg:p-4 font-bold text-md lg:text-lg text-[#FFFFFF] rounded-md lg:rounded-lg shadow-lg transition ${
                  !isFormValid || isSubmitting
                    ? 'bg-[#498118]/50 cursor-not-allowed' 
                    : 'bg-[#498118] cursor-pointer hover:scale-105 active:scale-95'
                }`}
                aria-disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </button>

              <p className="text-center text-sm lg:text-md text-[#4A5565]">
                You won't be charged until the next step.
              </p>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}