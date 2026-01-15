interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Calculates the distance between two GPS coordinates in meters using the Haversine formula.
 * @param coord1 - The first coordinate object { latitude, longitude }.
 * @param coord2 - The second coordinate object { latitude, longitude }.
 * @returns The distance in meters.
 */
export const getDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = coord1.latitude * Math.PI / 180; // φ, λ in radians
    const lat2 = coord2.latitude * Math.PI / 180;
    const deltaLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const deltaLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in meters
    return distance;
};