export const openGoogleMapsDirections = (
  destinationLat: number,
  destinationLng: number,
  destinationName?: string,
  sourceLat?: number,
  sourceLng?: number
) => {
  let mapsUrl = 'https://www.google.com/maps/dir/';
  
  // Add source coordinates if available, otherwise use current location
  if (sourceLat && sourceLng) {
    mapsUrl += `${sourceLat},${sourceLng}/`;
  } else {
    mapsUrl += '/';
  }
  
  // Add destination coordinates
  mapsUrl += `${destinationLat},${destinationLng}`;
  
  // Add destination name as query parameter if available
  if (destinationName) {
    mapsUrl += `/@${destinationLat},${destinationLng},15z/data=!4m2!4m1!3e0?entry=ttu`;
  }
  
  // Open in new tab/window
  window.open(mapsUrl, '_blank');
};

export const hasValidLocation = (latitude?: number, longitude?: number): boolean => {
  return latitude !== undefined && longitude !== undefined && latitude !== 0 && longitude !== 0;
};