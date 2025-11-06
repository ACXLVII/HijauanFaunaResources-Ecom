'use client'

import React, { useState } from 'react';

import toast, { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import { useCart } from '@/app/hooks/useCart';

// Icon Imports
import {
  FaCloudSunRain
} from 'react-icons/fa';
import {
  GiBandageRoll,
  GiFallingLeaf,
  GiGardeningShears
} from "react-icons/gi";
import {
  MdOutlineTexture
} from 'react-icons/md';
import {
  TbRuler,
  TbRulerMeasure,
  TbTexture
} from "react-icons/tb";

// Icon Map
const IconMap = {
  // Measurement Icons
  TbRuler,
  GiBandageRoll,
  // Live Grass Icons
  TbTexture,
  GiFallingLeaf,
  TbRulerMeasure,
  // Artificial Grass Icons
  MdOutlineTexture,
  FaCloudSunRain,
  GiGardeningShears,
};

// Icon Renderer
function renderIcon(icon, className = "size-10 lg:size-12 text-[#C39533]") {
  if (!icon) return null;
  if (typeof icon === 'string' && IconMap[icon]) {
    const IconComponent = IconMap[icon];
    return <IconComponent className={className} />;
  }
  if (typeof icon === 'function') {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  return null;
}

function parseAreaFromMeasurement(measurement) {
  // Example: '83ft x 6.5ft' or '2ft x 1ft' or '1ft x 1ft'
  const match = measurement.match(/([\d.]+)\s*ft\s*x\s*([\d.]+)\s*ft/i);
  if (match) {
    return parseFloat(match[1]) * parseFloat(match[2]);
  }
  // fallback: try just a number
  const num = parseFloat(measurement);
  return isNaN(num) ? 1 : num;
}

export default function PricingCalculator({
  category, id, name, images, priceGroup
}) {
  // Prepare priceGroups with area and price as number
  const groupsWithArea = priceGroup.map(group => ({
    ...group,
    area: group.area || parseAreaFromMeasurement(group.measurement),
    price: typeof group.price === 'number' ? group.price : parseFloat(group.price.replace(/[^\d.]/g, '')),
  }));

  // If multiple price groups, allow selection
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedGroup = groupsWithArea[selectedIdx];

  const [userArea, setUserArea] = useState('');
  const [touched, setTouched] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const { addToCart } = useCart();

  const handleAreaChange = (e) => {
    let val = e.target.value.replace(/[^\d.]/g, ''); // Allow digits and decimal points
    // Prevent multiple decimal points
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    // Remove leading zeros but keep single zero before decimal
    val = val.replace(/^0+/, '') || '0';
    setUserArea(val);
  };

  const area = parseFloat(userArea); // Use parseFloat instead of parseInt
  const validArea = !isNaN(area) && area > 0;
  
  // Error handling similar to checkout component
  const shouldShowError = focusedField !== 'area' && (showErrors || (touched && userArea.trim().length > 0)) && (!userArea || !validArea);
  const error = shouldShowError ? 'Please enter a valid number bigger than 0.' : '';

  // Calculation for selected unit
  let quantity = 0;
  let totalAreaCovered = 0;
  let extraArea = 0;
  let totalPrice = 0;
  if (validArea) {
    if (selectedGroup.sizeType === 'sqft' || selectedGroup.sizeType === 'square foot') {
      quantity = area;
      totalAreaCovered = area;
      extraArea = 0;
      totalPrice = quantity * selectedGroup.price;
    } else {
      quantity = Math.ceil(area / selectedGroup.area);
      totalAreaCovered = quantity * selectedGroup.area;
      extraArea = totalAreaCovered - area;
      totalPrice = quantity * selectedGroup.price;
    }
  }

  const handleAddToCart = () => {
    if (!userArea || !validArea) {
      setTouched(true);
      setShowErrors(true);
      return;
    }
    addToCart({
      category,
      id,
      name,
      image: images[0],
      quantity,
      price: (selectedGroup.price * quantity).toFixed(2),
      priceID: selectedGroup.priceID,
      measurement: selectedGroup.measurement,
      sizeType: selectedGroup.sizeType,
      requestedArea: area,
    });
    toast.success(`Added to cart! Total: RM ${totalPrice.toFixed(2)}`);
  };

  return (
    <div className="space-y-4 lg:space-y-8 p-4 lg:p-8 bg-[#FFFFFF] rounded-lg lg:rounded-xl shadow-lg">
      <Toaster position="top-center" />

      {/* Unit selector if multiple price groups */}
      <div className="">

        <div className="mb-2 lg:mb-4 font-semibold text-md lg:text-lg text-[#101828]">
          Available measurements:
        </div>

        <div className="grid grid-cols-2 gap-2 lg:gap-4">
          {groupsWithArea.map((group, idx) => (
            <button
              key={group.sizeType + group.measurement}
              className={`
                flex flex-col p-2 lg:p-4
                ${selectedIdx === idx ? 'text-[#4A5565] shadow-lg border-2 border-[#C39533]' : 'text-[#AAAAAA] border-2 border-[#AAAAAA] cursor-pointer'}
                rounded-md lg:rounded-lg
              `}
              onClick={() => setSelectedIdx(idx)}
              type="button"
            >
              <div className="flex flex-col items-center justify-center">
                {renderIcon(group.icon, `size-10 lg:size-12 ${selectedIdx === idx ? 'text-[#C39533]' : 'text-[#AAAAAA]'}`)}
                <p
                  className={`
                    font-bold tracking-tight text-center text-xl lg:text-2xl
                    ${selectedIdx === idx ? 'text-[#498118]' : 'text-[#AAAAAA]'}
                  `}
                >
                  RM {group.price.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-center text-sm lg:text-md">
                  per {group.sizeType}
                </p>
                <p className="text-center text-sm lg:text-md">
                  ({group.measurement})
                </p>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* Area Input */}
      <div className="">

        <div className="mb-2 lg:mb-4 font-semibold text-md lg:text-lg text-[#101828]">
          How much area do you need?
        </div>

        <div className="flex flex-col">
          <label className="flex-1">
          <input
            id="userInputSqft"
            name="userInputSqft"
            type="number"
            min={0.1}
            step={0.1} // Allow decimal steps
            className={`h-12 w-full bg-[#FFFFFF] text-center text-md lg:text-lg text-[#101828] rounded-md lg:rounded-lg border-2 focus:outline-none ${
              touched && validArea 
                ? 'border-[#C39533]' 
                : shouldShowError 
                  ? 'border-red-500' 
                  : 'border-[#AAAAAA] focus:border-[#C39533]'
            }`}
            value={userArea}
            onChange={handleAreaChange}
            onFocus={() => setFocusedField('area')}
            onBlur={() => {
              setTouched(true);
              setFocusedField(null);
            }}
            placeholder="area (square feet)"
            inputMode="decimal" // Change to decimal for better mobile experience
            aria-label="Total area needed, in square feet (sq ft)."
            onWheel={e => e.target.blur()}
          />
          </label>
        </div>

        {error && (
          <div role="alert" className="mt-1 lg:mt-2 text-justify text-sm lg:text-md text-red-500">
            {error}
          </div>
        )}

      </div>

      {/* Breakdown for selected unit */}
      {validArea && (
        <>
          <hr className="border-t-2 border-[#C39533]" />

          <div className="">
            <div className="font-semibold text-md lg:text-lg text-[#101828]">
              Your requirements are:
            </div>
            <ul className="ml-6 lg:ml-8 text-justify text-md lg:text-lg text-[#4A5565] list-disc">
              <li>
                <span className="font-bold text-[#C39533]">{quantity}</span> {selectedGroup.sizeType}(s).
              </li>
              {selectedGroup.sizeType !== 'sqft' && selectedGroup.sizeType !== 'square foot' && extraArea > 0 && (
                <li>
                  <span className="font-bold text-[#C39533]">{extraArea.toFixed(2)}</span> sqft extra will be included, since the minimum measurement of a {selectedGroup.sizeType} is ({selectedGroup.measurement}).
                </li>
              )}
            </ul>
          </div>

          <div className="">
            <div className="font-semibold text-md lg:text-lg text-[#101828]">
              Purchase includes:
            </div>
            <ul className="ml-6 lg:ml-8 text-justify text-md lg:text-lg text-[#4A5565] list-disc">
              <li>
                10 Year Warranty
              </li>
              <li>
                Complimentary mini garden.
              </li>
            </ul>
          </div>

          <div className="font-semibold text-md lg:text-lg text-[#101828]">
            Total: <span className="tracking-tight text-[#498118]">RM {totalPrice.toFixed(2)}</span>
          </div>
        </>
      )}

      {/* Add to Cart */}
      <button
        className={`w-full p-2 lg:p-4 font-bold text-md lg:text-lg text-[#FFFFFF] rounded-md lg:rounded-lg shadow-lg transition ${
          !userArea || !validArea
            ? 'bg-[#498118]/50 cursor-not-allowed' 
            : 'bg-[#498118] cursor-pointer hover:scale-105 active:scale-95'
        }`}
        onClick={handleAddToCart}
        type="button"
        aria-disabled={!userArea || !validArea}
      >
        Add to Cart
      </button>

    </div>
  );
}

PricingCalculator.propTypes = {
  priceGroup: PropTypes.arrayOf(PropTypes.shape({
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    measurement: PropTypes.string.isRequired,
    sizeType: PropTypes.string.isRequired,
    icon: PropTypes.any,
    area: PropTypes.number, // optional, will be computed if not present
  })).isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
};