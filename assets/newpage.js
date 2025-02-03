document.addEventListener("DOMContentLoaded", () => {
    const paginationContainer = document.getElementById("pagination-container");
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
                    console.log("Fetching data from:", jsonURL);
                    const response = await fetch(url);

                    if (!response.ok) {
                        console.error(`Error: ${response.status} - ${response.statusText}`);
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

// Adjust the pagination container to act as a footer
        const adjustPaginationPosition = () => {
            const viewportHeight = window.innerHeight;
            const contentHeight = artistsContainer.scrollHeight + paginationControls.scrollHeight;

            if (contentHeight < viewportHeight) {
                paginationControls.style.position = "fixed";
                paginationControls.style.bottom = "0";
                paginationControls.style.left = "0";
                paginationControls.style.right = "0";
                paginationControls.style.padding = "10px";
            } else {
                paginationControls.style.position = "static";
            }
        };

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
                adjustPaginationPosition(); // Adjust pagination position
            })
            .catch((error) => {
                console.error("Error initializing artists:", error);
                loadingElement.textContent = "Failed to load artist data. Please try again later.";
            });

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

                card.className = "bg-gray-200 rounded-lg shadow-2xl overflow-hidden group w-full sm:w-70 md:w-90 h-auto min-h-[22rem] flex flex-col justify-start transition-all duration-300";

// Card content
                card.innerHTML = `
    <div class="relative flex flex-col h-full gray-200 shadow-2xl rounded-lg p-4 min-h-[350px]">
        <div class="flex justify-center items-center pb-4">
            <img class="w-30 h-30 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200"
                src="${artist.artist.image}" alt="${artist.artist.name}">
        </div>
        <div class="flex-grow">
            <h2 class="text-xl font-bold text-gray-800">${artist.artist.name}</h2>
            <p class="text-sm text-gray-600"><strong>First Album:</strong> ${artist.artist.firstAlbum}</p>
            <p class="text-sm text-gray-600"><strong>Members:</strong> ${artist.artist.members.join(", ")}</p>
        </div>
        <div class="mt-auto flex justify-center gap-7 pb-3">
            <button type="button" onclick="alert('${artist.locations.join(", ")}')">
    View Locations
                class="text-white bg-gradient-to-r from-gray-600 via-gray-800 to-black hover:bg-gradient-to-br 
                       focus:ring-4 focus:outline-none focus:ring-gray-500 dark:focus:ring-gray-900 shadow-lg 
                       shadow-gray-600/50 dark:shadow-lg dark:shadow-gray-900/80 font-medium rounded-lg 
                       text-sm px-5 py-2.5 text-center">
                 View Locations
            </button>
            <button type="button" onclick="alert('${Object.values(artist.relations).flat().join(", ")}')">
                class="text-white bg-gradient-to-r from-gray-600 via-gray-800 to-black hover:bg-gradient-to-br 
                       focus:ring-4 focus:outline-none focus:ring-gray-500 dark:focus:ring-gray-900 shadow-lg 
                       shadow-gray-600/50 dark:shadow-lg dark:shadow-gray-900/80 font-medium rounded-lg 
                       text-sm px-5 py-2.5 text-center">
                 View Concert Dates
            </button>
        </div>
    </div>
`;

                // Expand text on click
                card.addEventListener("click", (event) => {
                    const paragraph = card.querySelector("p");
                    card.classList.toggle("h-auto");
                    paragraph.classList.toggle("line-clamp-none");
                });

                artistsContainer.appendChild(card);
            });

            // Adjust the pagination position after rendering the content
            adjustPaginationPosition();
        };

        // Create pagination controls dynamically
        const renderPagination = (totalItems) => {
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            console.log("Total Pages:", totalPages); // Check total pages calculation
            paginationControls.innerHTML = ""; // Clear existing buttons

            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement("button");
                button.className =
                    "px-4 py-2 mx-1 bg-gray-500 text-white rounded hover:bg-yellow-300";
                button.textContent = i;
                button.setAttribute("data-page", i);

                if (i === currentPage) {
                    button.classList.add("text-black", "bg-yellow-400");
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