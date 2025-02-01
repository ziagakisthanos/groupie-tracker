document.addEventListener("DOMContentLoaded", () => {
    const artistsContainer = document.getElementById("artists-container");
    const paginationControls = document.getElementById("pagination-controls");
    const loadingElement = document.createElement("div"); // Create a loading element
    loadingElement.className = "text-center text-gray-600 py-4";
    loadingElement.textContent = "Loading artist data...";

    if (artistsContainer && paginationControls) {
        const jsonURL = 'http://localhost:8080/api/data'; // Path to the JSON URL
        let currentPage = 1; // Track the current page
        const itemsPerPage = 8; // Number of cards per page
        let artistsData = []; // This will hold the fetched artist data

        // Display loading state
        artistsContainer.appendChild(loadingElement);

        // Fetch artist data with retry logic
        const fetchArtistsWithRetry = async (url, retries = 5, delay = 1000) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log("Fetched data:", data); // Log the fetched data
                    return data; // Return the fetched JSON array
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i === retries - 1) {
                        throw error; // Throw the error if all retries fail
                    }
                    await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
                }
            }
        };

        // Render the artists for the current page
        const renderPage = (page) => {
            if (!Array.isArray(artistsData)) {
                console.error("artistsData is not an array:", artistsData);
                artistsContainer.innerHTML = "<p class='text-red-500'>Invalid artist data format.</p>";
                return;
            }

            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = page * itemsPerPage;
            const artistsToShow = artistsData.slice(startIndex, endIndex);

            // Clear the container
            artistsContainer.innerHTML = "";

            if (artistsToShow.length === 0) {
                artistsContainer.innerHTML = "<p>No artists to display.</p>";
                return;
            }

            // Generate and append cards
            artistsToShow.forEach((artist) => {
                const card = document.createElement("div");
                card.className = "bg-white rounded-lg shadow-lg overflow-hidden group";

                card.innerHTML = `
                    <div class="relative pt-4 px-4 flex items-center justify-center">
                        <img class="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                             src="${artist.artist.image}" alt="${artist.artist.name}">
                    </div>
                    <div class="p-4">
                        <h2 class="text-xl font-bold text-gray-800">${artist.artist.name}</h2>
                        <p class="text-sm text-gray-600"><strong>First Album:</strong> ${artist.artist.firstAlbum}</p>
                        <p class="text-sm text-gray-600"><strong>Members:</strong> ${artist.artist.members.join(", ")}</p>
                        <div class="mt-2">
                            <p class="text-sm text-gray-600"><strong>Locations:</strong> ${artist.locations.join(", ")}</p>
                            <p class="text-sm text-gray-600"><strong>Concert Dates:</strong> ${artist.dates.join(", ")}</p>
                        </div>
                    </div>
                `;
                artistsContainer.appendChild(card);
            });
        };

        // Create pagination controls dynamically
        const renderPagination = (totalItems) => {
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            paginationControls.innerHTML = ""; // Clear existing buttons

            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement("button");
                button.className =
                    "px-4 py-2 mx-1 bg-blue-500 text-white rounded hover:bg-blue-600";
                button.textContent = i;
                button.setAttribute("data-page", i);

                if (i === currentPage) {
                    button.classList.add("bg-blue-700");
                }

                paginationControls.appendChild(button);
            }
        };

        // Handle pagination button clicks
        paginationControls.addEventListener("click", (event) => {
            const button = event.target;
            const page = parseInt(button.getAttribute("data-page"), 10);

            if (page && page !== currentPage) {
                currentPage = page; // Update the current page
                renderPage(currentPage); // Render the new page
                renderPagination(artistsData.length); // Update pagination styling
            }
        });

        // Fetch data and initialize the UI
        fetchArtistsWithRetry(jsonURL)
            .then((data) => {
                console.log("Data fetched successfully:", data); // Log the fetched data

                // Assign the fetched data to artistsData
                artistsData = data;

                if (!Array.isArray(artistsData)) {
                    throw new Error("Fetched data is not an array");
                }

                loadingElement.remove(); // Remove the loading spinner
                renderPage(currentPage);
                renderPagination(artistsData.length);
            })
            .catch((error) => {
                console.error("Error initializing artists:", error);
                loadingElement.textContent = "Failed to load artist data. Please try again later.";
            });
    }
});