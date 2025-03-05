// Global cache for coordinates.
const coordinatesCache = new Map();

// Load Leaflet Library
const mapScript = document.createElement("script");
mapScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
mapScript.crossOrigin = "";
document.head.appendChild(mapScript);

const mapStyle = document.createElement("link");
mapStyle.rel = "stylesheet";
mapStyle.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(mapStyle);

// Global variable to hold the map instance.
let mapInstance = null;

// Function to fetch geolocation data using OpenStreetMap's Nominatim API with caching.
async function getCoordinates(location) {
    // If we have the coordinates cached, return them immediately.
    if (coordinatesCache.has(location)) {
        return coordinatesCache.get(location);
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            // Cache the result for future use.
            coordinatesCache.set(location, coords);
            return coords;
        }
        return null;
    } catch (error) {
        console.error("Error fetching geolocation data:", error);
        return null;
    }
}

// Function to initialize and load the map with markers based on concert locations.
async function loadGeolocationMap(artistData) {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) {
        console.error("Map container not found.");
        return;
    }

    // Remove previous map instance if it exists.
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    // Clear previous map content.
    mapContainer.innerHTML = "";

    // Wait for Leaflet to be available.
    if (!window.L) {
        mapScript.onload = async () => {
            mapInstance = await initializeMap(artistData, mapContainer);
        };
    } else {
        mapInstance = await initializeMap(artistData, mapContainer);
    }
}

// Helper function to initialize the map once coordinates have been fetched.
async function initializeMap(artistData, mapContainer) {
    const locations = Object.keys(artistData.relations);
    // Use Promise.all to fetch coordinates concurrently.
    const coordinates = await Promise.all(locations.map(getCoordinates));
    const validCoords = coordinates.filter(coord => coord !== null);

    if (validCoords.length === 0) {
        mapContainer.innerHTML = "<p class='text-red-500'>Map data unavailable.</p>";
        return null;
    }

    // Set the view to the first valid coordinate.
    const center = [validCoords[0].lat, validCoords[0].lon];
    const map = L.map(mapContainer).setView(center, 4);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers with popups.
    validCoords.forEach((coord, index) => {
        L.marker([coord.lat, coord.lon]).addTo(map)
            .bindPopup(`<b>${locations[index]}</b>`);
    });

    return map;
}

// Expose the loadGeolocationMap function for external use.
window.loadGeolocationMap = loadGeolocationMap;
