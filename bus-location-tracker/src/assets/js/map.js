// This file handles the integration with the Google Maps JavaScript API, including initializing the map and updating the driver's location on the map.

let map;
let marker;

function initMap() {
    const initialLocation = { lat: -34.397, lng: 150.644 }; // Default location
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: initialLocation,
    });
    marker = new google.maps.Marker({
        position: initialLocation,
        map: map,
    });
}

function updateLocation(lat, lng) {
    const newLocation = { lat: lat, lng: lng };
    marker.setPosition(newLocation);
    map.setCenter(newLocation);
}

// Export functions for use in other modules
export { initMap, updateLocation };