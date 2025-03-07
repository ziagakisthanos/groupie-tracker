// Load Leaflet Library
const mapScript = document.createElement("script");
mapScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
mapScript.crossOrigin = "";
document.head.appendChild(mapScript);

const mapStyle = document.createElement("link");
mapStyle.rel = "stylesheet";
mapStyle.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(mapStyle);

// Global variables to hold the map instance and markers
window.myMap = null;
window.mapMarkers = [];


//Fetch geolocation data using OpenStreetMap's Nominatim API.
async function getCoordinates(location) {
    // Replace hyphens with commas for a better query format.
    const processedLocation = location.split("-").join(", ");
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(processedLocation)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
        return null;
    } catch (error) {
        console.error("Error fetching geolocation data:", error);
        return null;
    }
}

// Initializes or updates the map with markers based on concert locations.
async function loadGeolocationMap(artistData) {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) {
        console.error("Map container not found.");
        return;
    }
    // Clear any previous content.
    if (!window.myMap) {
        mapContainer.innerHTML = "";
    }

// Get and sort location keys by the earliest date (assumes date strings parse correctly)
    const locations = Object.keys(artistData.relations);
    const sortedLocations = locations.sort((a, b) => {
        const dateA = new Date(artistData.relations[a][0]);
        const dateB = new Date(artistData.relations[b][0]);
        return dateA - dateB;
    });

    // Fetch coordinates for each sorted location.
    const coordinates = await Promise.all(sortedLocations.map(getCoordinates));
    const validCoords = coordinates.filter(coord => coord !== null);

    if (validCoords.length === 0) {
        mapContainer.innerHTML = "<p class='text-red-500'>Map data unavailable.</p>";
        return;
    }

    // Use the first valid coordinate as the center.
    const center = [validCoords[0].lat, validCoords[0].lon];

    // If the map hasn't been created yet, initialize it.
    if (!window.myMap) {
        window.myMap = L.map(mapContainer).setView(center, 4);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.myMap);
    } else {
        // Update the map view.
        window.myMap.setView(center, 4);
        // Remove any existing markers.
        window.mapMarkers.forEach(marker => window.myMap.removeLayer(marker));
        window.mapMarkers = [];
    }

    // Add markers for each valid coordinate.
    validCoords.forEach((coord, index) => {
        const marker = L.marker([coord.lat, coord.lon]).addTo(window.myMap)
            .bindPopup(`<b>${locations[index]}</b>`);
        window.mapMarkers.push(marker);
    });

    // If there is more than one marker, draw a polyline connecting them in order.
    if (validCoords.length > 1) {
        const latLngs = validCoords.map(coord => [coord.lat, coord.lon]);
        L.polyline(latLngs, { color: 'blue' }).addTo(window.myMap);
    }
}

// Expose loadGeolocationMap globally.
window.loadGeolocationMap = loadGeolocationMap;
