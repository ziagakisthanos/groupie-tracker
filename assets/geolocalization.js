// Load Leaflet Library
const mapScript = document.createElement("script");
mapScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
mapScript.crossOrigin = "";
document.head.appendChild(mapScript);

const mapStyle = document.createElement("link");
mapStyle.rel = "stylesheet";
mapStyle.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(mapStyle);

// Global variables to hold the map instance, markers.
window.myMap = null;
window.mapMarkers = [];

// Fetch geolocation data using OpenStreetMap's Nominatim API.
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

// Progressive function to fetch coordinates and add markers as they become available.
async function fetchCoordinatesAndAddMarkers(sortedLocations, delay = 1100, concurrency = 3) {
    let currentIndex = 0;

    // Worker function that processes locations one at a time.
    async function worker() {
        while (currentIndex < sortedLocations.length) {
            const idx = currentIndex++;
            const location = sortedLocations[idx];
            const coord = await getCoordinates(location);
            if (coord) {
                // If the map isn't initialized yet, initialize it with the first valid coordinate.
                if (!window.myMap) {
                    const mapContainer = document.getElementById("map-container");
                    window.myMap = L.map(mapContainer).setView([coord.lat, coord.lon], 1);
                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(window.myMap);
                }
                // Add the marker immediately.
                const marker = L.marker([coord.lat, coord.lon]).addTo(window.myMap)
                    .bindPopup(`<b>${location}</b>`);
                window.mapMarkers.push(marker);
            }
            // Wait to respect rate limits before processing the next location.
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Start the workers based on the concurrency limit.
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
        workers.push(worker());
    }
    await Promise.all(workers);
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
    } else {
        // Remove existing markers.
        window.mapMarkers.forEach(marker => window.myMap.removeLayer(marker));
        window.mapMarkers = [];
    }

    // Get and sort location keys by the earliest date.
    const locations = Object.keys(artistData.relations);
    const sortedLocations = locations.sort((a, b) => {
        const dateA = new Date(artistData.relations[a][0]);
        const dateB = new Date(artistData.relations[b][0]);
        return dateA - dateB;
    });

    // Progressive loading: fetch coordinates and add markers as soon as they are available.
    await fetchCoordinatesAndAddMarkers(sortedLocations, 0, 5);
}

// Expose loadGeolocationMap globally.
window.loadGeolocationMap = loadGeolocationMap;
