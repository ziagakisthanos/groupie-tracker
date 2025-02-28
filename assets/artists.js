document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements for artists, pagination, modal, etc.
    const artistsContainer = document.getElementById("artists-container");
    const paginationControls = document.getElementById("pagination-controls");
    const modal = document.getElementById("artist-modal");
    const modalHeader = document.getElementById("modal-artist-name");
    const modalClose = document.getElementById("modal-close");
    const categoryList = document.getElementById("category-list");

    const jsonURL = "http://localhost:8080/api/data";
    let currentPage = 1;
    const itemsPerPage = 8;
    let artistsData = [];
    let currentArtist = null;

    // Expose artistsData globally for use by filters.js
    window.artistsData = [];

    // Fetch data with retry logic
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

    // Update dropdown content based on category
    function updateDropdownContent(dropdown, category, artistData) {
        let content = "";
        switch (category) {
            case "firstAlbum":
                content = `<p><strong>First Album:</strong> ${artistData.artist.firstAlbum}</p>`;
                break;
            case "members":
                content = `<p><strong>Members:</strong> ${artistData.artist.members.join(", ")}</p>`;
                break;
            case "concertDates":
                content = generateConcertList(artistData.relations);
                break;
            case "creationDate":
                content = `<p><strong>Creation Date:</strong> ${artistData.artist.creationDate ? artistData.artist.creationDate.toString() : "Unknown"}</p>`;
                break;
            default:
                content = "<p>No data available.</p>";
        }
        dropdown.innerHTML = content;
    }

    // Listen for clicks on category items in the modal dropdown
    if (categoryList) {
        categoryList.addEventListener("click", (event) => {
            const categoryItem = event.target.closest(".category-item");
            if (!categoryItem) return;
            const category = categoryItem.dataset.category;
            const dropdown = categoryItem.querySelector(".dropdown-content");
            if (!dropdown.classList.contains("hidden")) {
                dropdown.classList.add("hidden");
                dropdown.innerHTML = "";
            } else {
                categoryList.querySelectorAll(".dropdown-content").forEach((el) => {
                    el.classList.add("hidden");
                    el.innerHTML = "";
                });
                if (currentArtist && category) {
                    updateDropdownContent(dropdown, category, currentArtist);
                }
                dropdown.classList.remove("hidden");
            }
        });
    }

    // Format a raw location string to "Proper Case, USA"
    function formatLocation(rawLoc) {
        let temp = rawLoc.replace(/_/g, " ");
        let parts = temp.split("-");
        parts = parts.map(part => {
            const lower = part.toLowerCase();
            if (lower === "usa") {
                return "USA";
            }
            return part
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
        });
        return parts.join(", ");
    }

    // Format a date string
    function formatConcertDate(dateStr) {
        const parts = dateStr.split("-");
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}.${month}.${year}`;
    }

    // Generate a formatted list of concert dates by location
    function generateConcertList(relations) {
        if (!relations || Object.keys(relations).length === 0) {
            return "<p class='text-gray-600'>No concert data available.</p>";
        }
        return `
            <ul class="list-disc pl-5 space-y-2">
              ${Object.entries(relations)
            .map(([location, dates]) => {
                const formattedLocation = formatLocation(location);
                const formattedDates = dates
                    .map(date => formatConcertDate(date))
                    .join(", ");
                return `<li><strong>${formattedLocation}:</strong> ${formattedDates}</li>`;
            })
            .join("")}
            </ul>
        `;
    }

    // Open the artist modal with details
    function openArtistModal(artistData) {
        currentArtist = artistData;
        modalHeader.textContent = `${artistData.artist.name} Details`;
        if (categoryList) {
            categoryList.querySelectorAll(".dropdown-content").forEach((el) => {
                el.classList.add("hidden");
                el.innerHTML = "";
            });
        }
        modal.classList.remove("hidden");
        setTimeout(() => {
            modal.classList.remove("opacity-0", "scale-95");
            modal.classList.add("opacity-100", "scale-100");
        }, 10);
    }

    // Close the modal with a fade-out effect
    function closeModal() {
        modal.classList.remove("opacity-100", "scale-100");
        modal.classList.add("opacity-0", "scale-95");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 200);
    }

    // Modal close event listeners
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

// Listen for "View Details" button clicks on artist cards
    artistsContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (target.classList.contains("view-details-btn") || target.closest(".view-details-btn")) {
            const card = target.closest(".artist-card");
            // Determine the correct artist index based on pagination
            const startIndex = (currentPage - 1) * itemsPerPage;
            const indexInPage = Array.from(artistsContainer.children).indexOf(card);
            const artistIndex = startIndex + indexInPage;
            // Use filtered data if available, otherwise the full list.
            const dataSource = window.filteredArtists || artistsData;
            const artistData = dataSource[artistIndex];
            if (artistData) {
                openArtistModal(artistData);
            }
        }
    });

    // Render a specific page of artists or data
    function renderPage(page) {
        const dataToRender = window.filteredArtists || artistsData;
        if (!Array.isArray(dataToRender)) {
            console.error("Data is not an array:", dataToRender);
            artistsContainer.innerHTML = "<p class='text-red-500'>Invalid artist data format.</p>";
            return;
        }
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const artistsToShow = dataToRender.slice(startIndex, endIndex);
        if (artistsToShow.length === 0) {
            artistsContainer.innerHTML = "<p>No artists to display.</p>";
            return;
        }
        const fragment = document.createDocumentFragment();
        artistsContainer.innerHTML = "";
        artistsToShow.forEach((artist, index) => {
            const card = document.createElement("div");
            card.className = `artist-card bg-gray-200 rounded-lg shadow-2xl overflow-hidden w-full sm:w-70 md:w-90 h-auto min-h-[22rem] flex flex-col justify-start transition-all duration-300 opacity-0 fall-animation fall-delay-${(index % 8) + 1}`;
            card.setAttribute("data-index", index);
            card.innerHTML = `
  <div class="relative flex flex-col h-full bg-gray-200 shadow-2xl rounded-lg p-4 min-h-[350px]">
    <div class="flex justify-center items-center pt-2 pb-4">
      <img class="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-gray-200 transition-transform duration-300 ease-in-out transform hover:scale-110"
           src="${artist.artist.image}" alt="${artist.artist.name}">
    </div>
    <div class="flex-grow flex items-center justify-center">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800 text-center mt-1">
        ${artist.artist.name}
      </h2>
    </div>
    <!-- Display the creation date -->
    <div class="mt-auto flex flex-col justify-center pb-3">
      <button type="button"
              class="view-details-btn text-white bg-gradient-to-r from-gray-600 via-gray-800 to-black hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-4 py-2 text-center">
        View Details
      </button>
    </div>
  </div>
`;
            fragment.appendChild(card);
            setTimeout(() => {
                card.classList.remove("opacity-0");
            }, 50);
        });
        artistsContainer.appendChild(fragment);
        adjustPaginationPosition();
    }

    // Render pagination buttons based on total items
    function renderPagination(totalItems) {
        const dataLength = window.filteredArtists ? window.filteredArtists.length : artistsData.length;
        const totalPages = Math.ceil(dataLength / itemsPerPage);
        paginationControls.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.className = "pagination-btn px-4 py-2 mx-1 bg-gray-500 text-white rounded hover:bg-yellow-300";
            button.textContent = i;
            button.setAttribute("data-page", i);
            if (i === window.currentPage) {
                button.classList.add("active");
            }
            button.addEventListener("click", () => {
                window.currentPage = i;
                window.renderPage(window.currentPage);
                window.renderPagination(dataLength);
                adjustPaginationPosition();
            });
            paginationControls.appendChild(button);
        }
    }

    // Adjust the pagination container's position
    function adjustPaginationPosition() {
        const artistsHeight = artistsContainer.scrollHeight;
        const viewportHeight = window.innerHeight;
        const paginationHeight = paginationControls.scrollHeight;
        if (artistsHeight + paginationHeight < viewportHeight) {
            paginationControls.style.position = "absolute";
            paginationControls.style.bottom = "0";
            paginationControls.style.left = "0";
            paginationControls.style.right = "0";
        } else {
            paginationControls.style.position = "relative";
        }
    }

    // Pagination container click handling
    paginationControls.addEventListener("click", (event) => {
        const page = parseInt(event.target.getAttribute("data-page"), 10);
        if (page && page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
            renderPagination(artistsData.length);
            adjustPaginationPosition();
        }
    });

    // Fetch artist data and initialize UI
    fetchArtistsWithRetry(jsonURL)
        .then((data) => {
            window.artistsData = data;
            artistsData = data;
            renderPage(currentPage);
            renderPagination(artistsData.length);
            adjustPaginationPosition();
            document.dispatchEvent(new Event("artistsDataLoaded"));
        })
        .catch((error) => {
            console.error("Error initializing artists:", error);
            artistsContainer.innerHTML = "<p class='text-red-500'>Failed to load artist data. Please try again later.</p>";
        });

    // Expose render functions globally for use by filters
    window.renderPage = renderPage;
    window.renderPagination = renderPagination;
});
