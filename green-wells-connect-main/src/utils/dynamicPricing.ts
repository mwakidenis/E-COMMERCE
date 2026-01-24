/**
 * Dynamic Pricing Algorithm
 * Real-time pricing based on demand, distance, and time
 */

import { calculateDistance } from './routeOptimization';

export interface PricingFactors {
  basePrice: number;
  distance: number; // in km
  timeOfDay: number; // 0-23 hours
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  currentDemand: number; // 0-100 scale
  cylinderSize: string;
}

export interface DynamicPrice {
  basePrice: number;
  distanceFee: number;
  demandSurcharge: number;
  timeSurcharge: number;
  totalPrice: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

const BASE_PRICES: Record<string, number> = {
  "6KG": 950,
  "13KG": 1850,
  "35KG": 4200,
};

/**
 * Calculate distance-based pricing
 */
const calculateDistanceFee = (distance: number): number => {
  const freeDistanceKm = 5;
  const costPerKm = 20;
  
  if (distance <= freeDistanceKm) {
    return 0;
  }
  
  return Math.ceil((distance - freeDistanceKm) * costPerKm);
};

/**
 * Calculate demand-based surcharge
 * High demand = higher prices (surge pricing)
 */
const calculateDemandSurcharge = (
  basePrice: number,
  demandLevel: number
): number => {
  // Demand level 0-30: No surcharge
  // Demand level 30-60: 5% surcharge
  // Demand level 60-80: 10% surcharge
  // Demand level 80-100: 20% surcharge
  
  if (demandLevel <= 30) {
    return 0;
  } else if (demandLevel <= 60) {
    return Math.ceil(basePrice * 0.05);
  } else if (demandLevel <= 80) {
    return Math.ceil(basePrice * 0.10);
  } else {
    return Math.ceil(basePrice * 0.20);
  }
};

/**
 * Calculate time-based surcharge
 * Peak hours and weekends may have different pricing
 */
const calculateTimeSurcharge = (
  basePrice: number,
  timeOfDay: number,
  dayOfWeek: number
): number => {
  let surcharge = 0;
  
  // Weekend surcharge (Saturday-Sunday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    surcharge += Math.ceil(basePrice * 0.05);
  }
  
  // Night delivery surcharge (after 8 PM or before 6 AM)
  if (timeOfDay >= 20 || timeOfDay < 6) {
    surcharge += Math.ceil(basePrice * 0.10);
  }
  
  // Peak hours surcharge (5 PM - 8 PM on weekdays)
  if (dayOfWeek >= 1 && dayOfWeek <= 5 && timeOfDay >= 17 && timeOfDay < 20) {
    surcharge += Math.ceil(basePrice * 0.08);
  }
  
  return surcharge;
};

/**
 * Main dynamic pricing calculation
 */
export const calculateDynamicPrice = (factors: PricingFactors): DynamicPrice => {
  const basePrice = BASE_PRICES[factors.cylinderSize] || factors.basePrice;
  const distanceFee = calculateDistanceFee(factors.distance);
  const demandSurcharge = calculateDemandSurcharge(basePrice, factors.currentDemand);
  const timeSurcharge = calculateTimeSurcharge(
    basePrice,
    factors.timeOfDay,
    factors.dayOfWeek
  );
  
  const totalPrice = basePrice + distanceFee + demandSurcharge + timeSurcharge;
  
  const breakdown = [
    { label: "Base Price", amount: basePrice },
  ];
  
  if (distanceFee > 0) {
    breakdown.push({ label: "Distance Fee", amount: distanceFee });
  }
  
  if (demandSurcharge > 0) {
    breakdown.push({ label: "High Demand Surcharge", amount: demandSurcharge });
  }
  
  if (timeSurcharge > 0) {
    breakdown.push({ label: "Time-based Surcharge", amount: timeSurcharge });
  }
  
  return {
    basePrice,
    distanceFee,
    demandSurcharge,
    timeSurcharge,
    totalPrice,
    breakdown,
  };
};

/**
 * Get current demand level (simulated)
 * In production, this would query actual order data
 */
export const getCurrentDemandLevel = (): number => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  
  // Simulate demand based on time patterns
  let baseDemand = 30;
  
  // Higher demand during peak hours
  if (hour >= 17 && hour < 20) {
    baseDemand += 30;
  }
  
  // Higher demand during meal times
  if ((hour >= 6 && hour < 9) || (hour >= 12 && hour < 14)) {
    baseDemand += 20;
  }
  
  // Higher demand on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseDemand += 15;
  }
  
  // Add some randomness
  baseDemand += Math.random() * 10;
  
  return Math.min(100, baseDemand);
};

/**
 * Calculate price for an order with location data
 */
export const calculateOrderPrice = (
  cylinderSize: string,
  customerLat: number,
  customerLng: number,
  warehouseLat: number = -1.2921, // Default Nairobi coordinates
  warehouseLng: number = 36.8219
): DynamicPrice => {
  const distance = calculateDistance(
    warehouseLat,
    warehouseLng,
    customerLat,
    customerLng
  );
  
  const now = new Date();
  const currentDemand = getCurrentDemandLevel();
  
  return calculateDynamicPrice({
    basePrice: BASE_PRICES[cylinderSize] || 0,
    distance,
    timeOfDay: now.getHours(),
    dayOfWeek: now.getDay(),
    currentDemand,
    cylinderSize,
  });
};
