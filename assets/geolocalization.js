// Load Leaflet Library
const mapScript = document.createElement("script");
mapScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
mapScript.crossOrigin = "";
document.head.appendChild(mapScript);

const mapStyle = document.createElement("link");
mapStyle.rel = "stylesheet";
mapStyle.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(mapStyle);

// Function to fetch geolocation data using OpenStreetMap's Nominatim API
async function getCoordinates(location) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
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

// Function to initialize and load the map with markers based on concert locations
async function loadGeolocationMap(artistData) {
    // 'artistData.relations' should contain concert locations as keys, e.g.:
    // { "Germany Mainz": [dates...], "USA New York": [dates...] }
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) {
        console.error("Map container not found.");
        return;
    }
    mapContainer.innerHTML = ""; // Clear any previous map content

    // Wait for Leaflet to be available
    if (!window.L) {
        mapScript.onload = async () => {
            await initializeMap(artistData, mapContainer);
        };
    } else {
        await initializeMap(artistData, mapContainer);
    }
}

// Helper function to initialize the map once coordinates have been fetched
async function initializeMap(artistData, mapContainer) {
    const locations = Object.keys(artistData.relations);
    const coordinates = await Promise.all(locations.map(getCoordinates));
    const validCoords = coordinates.filter(coord => coord !== null);

    if (validCoords.length === 0) {
        mapContainer.innerHTML = "<p class='text-red-500'>Map data unavailable.</p>";
        return;
    }

    // For simplicity, set the view to the first valid coordinate
    const center = [validCoords[0].lat, validCoords[0].lon];
    const map = L.map(mapContainer).setView(center, 4);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Loop through locations to add markers with popups
    validCoords.forEach((coord, index) => {
        L.marker([coord.lat, coord.lon]).addTo(map)
            .bindPopup(`<b>${locations[index]}</b>`);
    });
}

// Expose the function for external use
window.loadGeolocationMap = loadGeolocationMap;
