function startSharingLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const { latitude, longitude } = position.coords;
            updateLocationInDatabase(latitude, longitude);
        }, error => {
            console.error("Error getting location: ", error);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function updateLocationInDatabase(latitude, longitude) {
    const locationRef = firebase.database().ref('drivers/location');
    locationRef.set({
        latitude: latitude,
        longitude: longitude
    });
}

function generateShareableLink() {
    const uniqueId = generateUniqueId();
    const link = `${window.location.origin}/passenger.html?id=${uniqueId}`;
    // Store the unique ID in the database for passengers to access
    firebase.database().ref(`drivers/links/${uniqueId}`).set({
        shared: true
    });
    return link;
}

function stopSharingLocation() {
    const locationRef = firebase.database().ref('drivers/location');
    locationRef.remove();
}

function generateUniqueId() {
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    });
}