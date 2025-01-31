document.addEventListener("DOMContentLoaded", () => {
    const artistsContainer = document.getElementById("artists-container");
    const paginationControls = document.getElementById("pagination-controls");

    // Check if the required elements exist
    if (!artistsContainer || !paginationControls) return;

    const jsonURL = 'http://localhost:8080/api/data';
    let currentPage = 1;
    const itemsPerPage = 8;
    let artistsData = [];

    // Fetch artist data from API
    const fetchArtists = async () => {
        try {
            const response = await fetch(jsonURL);
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

            const data = await response.json();
            return Array.isArray(data.artists) ? data.artists : []; // Ensure data is an array
        } catch (error) {
            console.error("Error fetching artist data:", error);
            artistsContainer.innerHTML = "<p class='text-red-500'>Failed to load artist data.</p>";
            return [];
        }
    };

    // Render the artists for the current page
    const renderPage = (page) => {
        if (!Array.isArray(artistsData)) {
            console.error("artistsData is not an array:", artistsData);
            artistsContainer.innerHTML = "<p class='text-red-500'>Invalid artist data format.</p>";
            return;
        }

        // Calculate which artists to show based on the current page
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const artistsToShow = artistsData.slice(startIndex, endIndex);

        // Clear the container before rendering new items
        artistsContainer.innerHTML = "";

        if (artistsToShow.length === 0) {
            artistsContainer.innerHTML = "<p>No artists to display.</p>";
            return;
        }

        // Loop through each artist and create a card
        artistsToShow.forEach((artist) => {
            const card = document.createElement("div");
            card.className = "bg-gray-200 rounded-lg shadow-2xl overflow-hidden group w-full sm:w-70 md:w-90 h-auto min-h-[22rem] flex flex-col justify-start transition-all duration-300";

            // Card HTML including modal buttons
            card.innerHTML = `
                <div class="relative flex flex-col h-full bg-gray-200 shadow-2xl rounded-lg p-4 min-h-[350px]">
                    <div class="flex justify-center items-center pb-4">
                        <img class="w-30 h-30 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200"
                            src="${artist.image || 'default-image.jpg'}" alt="${artist.name}">
                    </div>
                    <div class="flex-grow">
                        <h2 class="text-xl font-bold text-gray-800">${artist.name}</h2>
                        <p class="text-sm text-gray-600"><strong>First Album:</strong> ${artist.firstAlbum || "Unknown"}</p>
                        <p class="text-sm text-gray-600"><strong>Members:</strong> ${Array.isArray(artist.members) ? artist.members.join(", ") : "Unknown"}</p>
                    </div>
                    <div class="mt-auto flex justify-center gap-7 pb-3">
                        <!-- Button to open Locations Modal -->
                        <button data-modal-target="large-modal-${artist.id}" data-modal-toggle="large-modal-${artist.id}" data-location-url="${artist.locations}"
                            class="tour-locations-btn text-white bg-gradient-to-r from-gray-600 via-gray-800 to-black hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-500 dark:focus:ring-gray-900 shadow-lg shadow-gray-600/50 dark:shadow-lg dark:shadow-gray-900/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            View Locations
                        </button>
                        <!-- Button to open Concert Dates Modal -->
                        <button data-modal-target="large-modal-${artist.id}" data-modal-toggle="large-modal-${artist.id}" data-dates-url="${artist.concertDates}"
                            class="tour-dates-btn text-white bg-gradient-to-r from-gray-600 via-gray-800 to-black hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-500 dark:focus:ring-gray-900 shadow-lg shadow-gray-600/50 dark:shadow-lg dark:shadow-gray-900/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            View Concert Dates
                        </button>
                    </div>
                </div>

                <!-- Large Modal (Reused for both Locations & Concert Dates) -->
                <div id="large-modal-${artist.id}" tabindex="-1" class="fixed inset-0 z-50 hidden flex justify-center items-center bg-gray-900 bg-opacity-50 backdrop-blur-md p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative w-full max-w-4xl max-h-full">
                        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                <h3 class="text-xl font-medium text-gray-900 dark:text-white">${artist.name} - Details</h3>
                                <button type="button" class="close-modal text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="large-modal-${artist.id}">
                                    &times;
                                </button>
                            </div>
                            <div class="p-4 md:p-5 space-y-4">
                                <h4 class="font-semibold">Tour Locations</h4>
                                <ul id="locations-list-${artist.id}" class="text-gray-700 dark:text-white">Click "View Locations" to load...</ul>
                                <h4 class="font-semibold mt-4">Concert Dates</h4>
                                <ul id="dates-list-${artist.id}" class="text-gray-700 dark:text-white">Click "View Concert Dates" to load...</ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            artistsContainer.appendChild(card);
        });
    };

    // Render pagination dynamically
    const renderPagination = (totalItems) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationControls.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.className = "px-4 py-2 mx-1 bg-gray-500 text-white rounded hover:bg-yellow-300";
            button.textContent = i;
            button.setAttribute("data-page", i);

            if (i === currentPage) {
                button.classList.add("text-black", "bg-yellow-400");
            }

            paginationControls.appendChild(button);
        }
    };

    // Handle pagination clicks
    paginationControls.addEventListener("click", (event) => {
        const button = event.target;
        const page = parseInt(button.getAttribute("data-page"), 10);

        if (page && page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
            renderPagination(artistsData.length);
        }
    });

    // Handle modal and data fetching
    document.body.addEventListener("click", async (event) => {
        const target = event.target;
        const modalId = target.getAttribute("data-modal-target");
        const modal = modalId ? document.getElementById(modalId) : null;

        if (modal) modal.classList.remove("hidden");

        // Close modal
        if (target.hasAttribute("data-modal-hide") || target.classList.contains("close-modal")) {
            const modalToClose = document.getElementById(target.getAttribute("data-modal-hide"));
            if (modalToClose) modalToClose.classList.add("hidden");
        }

        // Fetch Locations
        if (target.classList.contains("tour-locations-btn")) {
            const locationsUrl = target.getAttribute("data-location-url");
            const locationsList = document.getElementById(`locations-list-${modalId.split('-')[2]}`);

            try {
                const response = await fetch(locationsUrl);
                const data = await response.json();
                locationsList.innerHTML = data.locations.map(loc => `<li>${loc}</li>`).join("") || "<li class='text-red-500'>No locations available</li>";
            } catch (error) {
                locationsList.innerHTML = "<li class='text-red-500'>Failed to load locations</li>";
            }
        }
    });

    fetchArtists().then((data) => {
        artistsData = data;
        renderPage(currentPage);
        renderPagination(artistsData.length);
    }).catch((error) => console.error("Error initializing artists:", error));
});
