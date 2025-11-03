// This file contains the JavaScript logic for the passenger view, including functions to retrieve the driver's location from the database and update the map in real-time.

const passengerId = window.location.pathname.split('/').pop(); // Extract passenger ID from URL
const dbRef = firebase.database().ref('drivers/' + passengerId); // Reference to the driver's location in Firebase

// Initialize the map
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: { lat: 0, lng: 0 }, // Default center
    });

    // Listen for location updates
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const { latitude, longitude } = data;
            const position = { lat: latitude, lng: longitude };
            map.setCenter(position);
            new google.maps.Marker({
                position: position,
                map: map,
            });
        }
    });
}

// Call initMap when the window loads
window.onload = initMap;