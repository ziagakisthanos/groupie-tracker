document.addEventListener("DOMContentLoaded", () => {
    const artistsContainer = document.getElementById("artists-container");
    const paginationControls = document.getElementById("pagination-controls");
    const loadingElement = document.createElement("div");

    const jsonURL = "http://localhost:8080/api/data"; // Path to the JSON URL
    let currentPage = 1;
    const itemsPerPage = 8;
    let artistsData = [];

    // Display loading state
    artistsContainer.appendChild(loadingElement);

    // Fetch artist data with retry logic
    const fetchArtistsWithRetry = async (url, retries = 5, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    // Adjust the pagination container to act as a footer
    const adjustPaginationPosition = () => {
        const viewportHeight = window.innerHeight;
        const contentHeight = artistsContainer.scrollHeight + paginationControls.scrollHeight;

        paginationControls.style.position = contentHeight < viewportHeight ? "fixed" : "static";
        paginationControls.style.bottom = "0";
        paginationControls.style.left = "0";
        paginationControls.style.right = "0";
        paginationControls.style.padding = "10px";
    };

    // Generate a list of locations and dates
    const generateConcertList = (relations) => {
        if (!relations || Object.keys(relations).length === 0) return "<p>No concert data available.</p>";

        return `<ul class='text-left'>${Object.entries(relations)
            .map(([location, dates]) => `<li><strong>${location.replace(/_/g, " ")}</strong>: ${dates.join(", ")}</li>`)
            .join("")}</ul>`;
    };

    // Handle click events on dynamically added elements
    artistsContainer.addEventListener("click", (event) => {
        const target = event.target;

        if (target.classList.contains("concert-dates-btn")) {
            const card = target.closest(".artist-card");
            const detailsDiv = card.querySelector(".concert-details");

            detailsDiv.classList.toggle("hidden");

            if (!detailsDiv.classList.contains("hidden")) {
                const artistIndex = [...artistsContainer.children].indexOf(card);
                const artistData = artistsData[artistIndex];

                if (artistData) detailsDiv.innerHTML = generateConcertList(artistData.relations);
            }
        }
    });

    // Render artists for the current page
    const renderPage = (page) => {
        if (!Array.isArray(artistsData)) {
            console.error("artistsData is not an array:", artistsData);
            artistsContainer.innerHTML = "<p class='text-red-500'>Invalid artist data format.</p>";
            return;
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const artistsToShow = artistsData.slice(startIndex, endIndex);

        artistsContainer.innerHTML = "";

        if (artistsToShow.length === 0) {
            artistsContainer.innerHTML = "<p>No artists to display.</p>";
            return;
        }

        // Generate artist cards
        artistsToShow.forEach((artist) => {
            const card = document.createElement("div");
            card.className = "artist-card bg-gray-200 rounded-lg shadow-2xl overflow-hidden w-full sm:w-70 md:w-90 h-auto min-h-[22rem] flex flex-col justify-start transition-all duration-300";

            card.innerHTML = `
                <div class="relative flex flex-col h-full bg-gray-200 shadow-2xl rounded-lg p-4 min-h-[350px]">
                    <div class="flex justify-center items-center pb-4">
                        <img class="w-30 h-30 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200"
                            src="${artist.artist.image}" alt="${artist.artist.name}">
                    </div>
                    <div class="flex-grow">
                        <h2 class="text-xl font-bold text-gray-800">${artist.artist.name}</h2>
                        <p class="text-sm text-gray-600"><strong>First Album:</strong> ${artist.artist.firstAlbum}</p>
                        <p class="text-sm text-gray-600"><strong>Members:</strong> ${artist.artist.members.join(", ")}</p>
                    </div>
                    <div class="mt-auto flex flex-col justify-center pb-3">
                        <button type="button" class="concert-dates-btn text-white bg-gradient-to-r from-gray-600 via-gray-800 to-black hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-500 dark:focus:ring-gray-900 shadow-lg shadow-gray-600/50 dark:shadow-lg dark:shadow-gray-900/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            View Concert Dates
                        </button>
                        <div class="concert-details hidden text-sm text-gray-700 mt-2 p-2 bg-white rounded-lg shadow-md"></div>
                    </div>
                </div>
            `;

            artistsContainer.appendChild(card);
        });

        adjustPaginationPosition();
    };

    // Create pagination controls
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

    // Handle pagination button clicks
    paginationControls.addEventListener("click", (event) => {
        const page = parseInt(event.target.getAttribute("data-page"), 10);
        if (page && page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
            renderPagination(artistsData.length);
        }
    });

    // Fetch data and initialize the UI
    fetchArtistsWithRetry(jsonURL)
        .then((data) => {
            artistsData = data;

            if (!Array.isArray(artistsData)) throw new Error("Fetched data is not an array");

            loadingElement.remove();
            renderPage(currentPage);
            renderPagination(artistsData.length);
        })
        .catch((error) => {
            console.error("Error initializing artists:", error);
            loadingElement.textContent = "Failed to load artist data. Please try again later.";
        });
});
