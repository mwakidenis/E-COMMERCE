/**
 * Route Optimization Algorithm
 * AI-based routing to minimize delivery time and fuel costs
 */

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  orderId?: string;
}

export interface OptimizedRoute {
  locations: Location[];
  totalDistance: number;
  estimatedTime: number;
  estimatedFuelCost: number;
  sequence: number[];
}

/**
 * Calculate the distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

/**
 * Nearest Neighbor Algorithm for route optimization
 * This is a greedy algorithm that always visits the nearest unvisited location
 */
export const nearestNeighborOptimization = (
  startLocation: Location,
  deliveryLocations: Location[]
): OptimizedRoute => {
  if (deliveryLocations.length === 0) {
    return {
      locations: [startLocation],
      totalDistance: 0,
      estimatedTime: 0,
      estimatedFuelCost: 0,
      sequence: [],
    };
  }

  const unvisited = [...deliveryLocations];
  const route: Location[] = [startLocation];
  const sequence: number[] = [];
  let currentLocation = startLocation;
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Find nearest unvisited location
    unvisited.forEach((location, index) => {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.latitude,
        location.longitude
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    // Visit nearest location
    const nextLocation = unvisited[nearestIndex];
    route.push(nextLocation);
    sequence.push(deliveryLocations.indexOf(nextLocation));
    totalDistance += nearestDistance;
    currentLocation = nextLocation;
    unvisited.splice(nearestIndex, 1);
  }

  // Calculate estimated time (assuming average speed of 30 km/h in city traffic)
  const estimatedTime = Math.ceil((totalDistance / 30) * 60); // in minutes

  // Calculate fuel cost (assuming 10 km/L and KES 150/L)
  const estimatedFuelCost = Math.ceil((totalDistance / 10) * 150);

  return {
    locations: route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime,
    estimatedFuelCost,
    sequence,
  };
};

/**
 * 2-opt algorithm for further route optimization
 * This improves the initial route by eliminating crossing paths
 */
export const twoOptOptimization = (route: OptimizedRoute): OptimizedRoute => {
  let improved = true;
  let bestRoute = [...route.locations];
  let bestDistance = route.totalDistance;

  while (improved) {
    improved = false;

    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        // Calculate current segment distances
        const currentDist =
          calculateDistance(
            bestRoute[i].latitude,
            bestRoute[i].longitude,
            bestRoute[i + 1].latitude,
            bestRoute[i + 1].longitude
          ) +
          calculateDistance(
            bestRoute[j].latitude,
            bestRoute[j].longitude,
            bestRoute[j + 1].latitude,
            bestRoute[j + 1].longitude
          );

        // Calculate new segment distances after swap
        const newDist =
          calculateDistance(
            bestRoute[i].latitude,
            bestRoute[i].longitude,
            bestRoute[j].latitude,
            bestRoute[j].longitude
          ) +
          calculateDistance(
            bestRoute[i + 1].latitude,
            bestRoute[i + 1].longitude,
            bestRoute[j + 1].latitude,
            bestRoute[j + 1].longitude
          );

        if (newDist < currentDist) {
          // Perform 2-opt swap
          const newRoute = [
            ...bestRoute.slice(0, i + 1),
            ...bestRoute.slice(i + 1, j + 1).reverse(),
            ...bestRoute.slice(j + 1),
          ];
          bestRoute = newRoute;
          bestDistance = bestDistance - currentDist + newDist;
          improved = true;
        }
      }
    }
  }

  // Recalculate total distance
  let totalDistance = 0;
  for (let i = 0; i < bestRoute.length - 1; i++) {
    totalDistance += calculateDistance(
      bestRoute[i].latitude,
      bestRoute[i].longitude,
      bestRoute[i + 1].latitude,
      bestRoute[i + 1].longitude
    );
  }

  const estimatedTime = Math.ceil((totalDistance / 30) * 60);
  const estimatedFuelCost = Math.ceil((totalDistance / 10) * 150);

  return {
    locations: bestRoute,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime,
    estimatedFuelCost,
    sequence: route.sequence,
  };
};

/**
 * Main route optimization function combining multiple algorithms
 */
export const optimizeRoute = (
  startLocation: Location,
  deliveryLocations: Location[]
): OptimizedRoute => {
  // First pass: Nearest Neighbor
  const initialRoute = nearestNeighborOptimization(startLocation, deliveryLocations);

  // Second pass: 2-opt improvement
  const optimizedRoute = twoOptOptimization(initialRoute);

  return optimizedRoute;
};
