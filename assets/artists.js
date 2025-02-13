document.addEventListener("DOMContentLoaded", () => {
    const artistsContainer = document.getElementById("artists-container");
    const paginationControls = document.getElementById("pagination-controls");
    const loadingElement = document.createElement("div");
    const modal = document.getElementById("large-modal");
    const modalHeader = modal.querySelector("h3");
    const modalBody = document.getElementById("modal-body-content");

    const jsonURL = "http://localhost:8080/api/data";
    let currentPage = 1;
    const itemsPerPage = 8;
    let artistsData = [];

    // Fetch artist data with retry logic
    const fetchArtistsWithRetry = async (url, retries = 5, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status >= 400 && response.status < 500) {
                        throw new Error(`Client Error ${response.status}: Won't retry.`);
                    }
                    throw new Error(`Server Error ${response.status}: Retrying...`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    // Toggle the modal display for concert dates
    const toggleModal = (show, artistData = null) => {
        if (show) {
            modalHeader.textContent = `${artistData.artist.name} Concert Dates`;
            modalBody.innerHTML = generateConcertList(artistData.relations);
            modal.classList.remove("hidden");
            setTimeout(() => modal.classList.add("opacity-100", "scale-100"), 50);
        } else {
            modal.classList.remove("opacity-100", "scale-100");
            setTimeout(() => modal.classList.add("hidden"), 200);
        }
    };

    // Generate a formatted list of concert dates
    const generateConcertList = (relations) => {
        if (!relations || Object.keys(relations).length === 0) {
            return "<p class='text-gray-600 text-lg'>No concert data available.</p>";
        }

        return (
            `<ul class="list-disc list-inside space-y-3 text-gray-800 text-lg">` +
            Object.entries(relations)
                .map(([location, dates]) => {
                    const formattedLocation = location
                        .split("_")
                        .join(" ")
                        .split("-")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(", ");

                    return `
                        <li>
                            <strong class="text-gray-900">${formattedLocation}:</strong>
                            <ul class="list-none ml-4 mt-1">
                                ${dates.map(date => `<li class="text-gray-700">• ${date.replace(/-/g, ".")}</li>`).join("")}
                            </ul>
                        </li>
                    `;
                })
                .join("") +
            `</ul>`
        );
    };

    // Handle click events for dynamically created artist cards
    artistsContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (target.classList.contains("concert-dates-btn") || target.closest(".concert-dates-btn")) {
            const card = target.closest(".artist-card");
            const startIndex = (currentPage - 1) * itemsPerPage;
            const artistIndex = startIndex + Array.from(artistsContainer.children).indexOf(card);
            const artistData = artistsData[artistIndex];

            if (artistData) {
                toggleModal(true, artistData);
            }
        }
    });

    // Close modal when clicking any close button
    document.querySelectorAll('[data-modal-hide]').forEach((closeBtn) => {
        closeBtn.addEventListener("click", () => toggleModal(false));
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (event) => {
        if (event.target === modal) toggleModal(false);
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

        if (artistsToShow.length === 0) {
            artistsContainer.innerHTML = "<p>No artists to display.</p>";
            return;
        }

        const fragment = document.createDocumentFragment();
        artistsContainer.innerHTML = ""; // Clear only once

        artistsToShow.forEach((artist, index) => {
            const card = document.createElement("div");
            card.className = `artist-card bg-gray-200 rounded-lg shadow-2xl overflow-hidden w-full sm:w-70 md:w-90 h-auto min-h-[22rem] 
                          flex flex-col justify-start transition-all duration-300 opacity-0 fall-animation fall-delay-${(index % 8) + 1}`;

            card.innerHTML = `
            <div class="relative flex flex-col h-full bg-gray-200 shadow-2xl rounded-lg p-4 min-h-[350px]">
                <div class="flex justify-center items-center pb-4">
                    <img class="w-30 h-30 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200 
                                transition-transform duration-300 ease-in-out transform hover:scale-110"
                        src="${artist.artist.image}" alt="${artist.artist.name}">
                </div>
                <div class="flex-grow">
                    <h2 class="text-xl font-bold text-gray-800">${artist.artist.name}</h2>
                    <p class="text-sm text-gray-600"><strong>First Album:</strong> ${artist.artist.firstAlbum}</p>
                    <p class="text-sm text-gray-600"><strong>Members:</strong> ${artist.artist.members.join(", ")}</p>
                </div>
                <div class="mt-auto flex flex-col justify-center pb-3">
                    <button type="button" class="concert-dates-btn text-white bg-gradient-to-r from-gray-600 via-gray-800 to-black 
                            hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-500 dark:focus:ring-gray-900 
                            shadow-lg shadow-gray-600/50 dark:shadow-lg dark:shadow-gray-900/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        View Concert Dates
                    </button>
                    <div class="concert-details hidden text-sm text-gray-700 mt-2 p-2 bg-white rounded-lg shadow-md"></div>
                </div>
            </div>
        `;

            fragment.appendChild(card);

            setTimeout(() => {
                card.classList.remove("opacity-0");
            }, 50);
        });

        artistsContainer.appendChild(fragment); // Append all at once

        adjustPaginationPosition();
    };

    // Fetch data and initialize the UI
    fetchArtistsWithRetry(jsonURL)
        .then((data) => {
            artistsData = data;
            if (!Array.isArray(artistsData)) throw new Error("Fetched data is not an array");

            loadingElement.remove();
            renderPage(currentPage);
            renderPagination(artistsData.length);
            adjustPaginationPosition();
        })
        .catch((error) => {
            console.error("Error initializing artists:", error);
            loadingElement.textContent = "Failed to load artist data. Please try again later.";
        });

    const adjustPaginationPosition = () => {
        const artistsHeight = artistsContainer.scrollHeight;
        const viewportHeight = window.innerHeight;
        const paginationHeight = paginationControls.scrollHeight;

        // Ensure pagination does not overlap artist cards
        if (artistsHeight + paginationHeight < viewportHeight) {
            paginationControls.style.position = "absolute"; // Stick it to the bottom
            paginationControls.style.bottom = "0";
            paginationControls.style.left = "0";
            paginationControls.style.right = "0";
        } else {
            paginationControls.style.position = "relative"; // Move naturally with content
        }
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

    paginationControls.addEventListener("click", (event) => {
        const page = parseInt(event.target.getAttribute("data-page"), 10);
        if (page && page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
            renderPagination(artistsData.length);
            adjustPaginationPosition(); //Ensures pagination remains at the bottom
        }
    });

});
