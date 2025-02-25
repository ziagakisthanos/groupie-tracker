document.addEventListener("DOMContentLoaded", () => {
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
    let currentArtist = null; // Stores the currently selected artist

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

    // Function to fill the dropdown for the chosen category
    function updateDropdownContent(dropdown, category, artistData) {
        let content = "";
        if (category === "firstAlbum") {
            content = `<p><strong>First Album:</strong> ${artistData.artist.firstAlbum}</p>`;
        } else if (category === "members") {
            content = `<p><strong>Members:</strong> ${artistData.artist.members.join(", ")}</p>`;
        } else if (category === "concertDates") {
            content = generateConcertList(artistData.relations);
        } else if (category === "creationDate") {
            content = `<p><strong>Creation Date:</strong> ${artistData.artist.creationDate || "Unknown"}</p>`;
        }
        dropdown.innerHTML = content;
    }

    // Listen for clicks on category items (dropdown behavior)
    if (categoryList) {
        categoryList.addEventListener("click", (event) => {
            const categoryItem = event.target.closest(".category-item");
            if (!categoryItem) return;
            const category = categoryItem.dataset.category;
            const dropdown = categoryItem.querySelector(".dropdown-content");

            // Toggle: if already open, close it; otherwise, close all others then open this one
            if (!dropdown.classList.contains("hidden")) {
                dropdown.classList.add("hidden");
                dropdown.innerHTML = "";
            } else {
                // Close any open dropdowns first
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

    // Generate a list of concert dates
    function generateConcertList(relations) {
        if (!relations || Object.keys(relations).length === 0) {
            return "<p class='text-gray-600'>No concert data available.</p>";
        }
        return `
      <ul class="list-disc pl-5 space-y-2">
        ${Object.entries(relations)
            .map(([location, dates]) => {
                const formattedLocation = location
                    .split("_")
                    .join(" ")
                    .split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                return `<li><strong>${formattedLocation}:</strong> ${dates
                    .map(date => date.replace(/-/g, "."))
                    .join(", ")}</li>`;
            })
            .join("")}
      </ul>`;
    }

    // Open the modal with the given artist data
    function openArtistModal(artistData) {
        currentArtist = artistData;
        // Update modal header to show artist name (without creation date here)
        modalHeader.textContent = `${artistData.artist.name} Details`;
        // Reset all dropdowns
        if (categoryList) {
            categoryList.querySelectorAll(".dropdown-content").forEach((el) => {
                el.classList.add("hidden");
                el.innerHTML = "";
            });
        }
        // Show the modal with fade/scale transition
        modal.classList.remove("hidden");
        setTimeout(() => {
            modal.classList.remove("opacity-0", "scale-95");
            modal.classList.add("opacity-100", "scale-100");
        }, 10);
    }

    // Close the modal
    function closeModal() {
        modal.classList.remove("opacity-100", "scale-100");
        modal.classList.add("opacity-0", "scale-95");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 200);
    }

    // Close button and overlay click to close modal
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Hook up "View Details" button for each artist card
    artistsContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (target.classList.contains("view-details-btn") || target.closest(".view-details-btn")) {
            const card = target.closest(".artist-card");
            // Determine the correct artist index based on pagination
            const startIndex = (currentPage - 1) * itemsPerPage;
            const indexInPage = Array.from(artistsContainer.children).indexOf(card);
            const artistIndex = startIndex + indexInPage;
            const artistData = artistsData[artistIndex];
            if (artistData) {
                openArtistModal(artistData);
            }
        }
    });

    // Render artists for the current page
    function renderPage(page) {
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
        artistsContainer.innerHTML = "";
        artistsToShow.forEach((artist, index) => {
            const card = document.createElement("div");
            card.className = `artist-card bg-gray-200 rounded-lg shadow-2xl overflow-hidden w-full sm:w-70 md:w-90 h-auto min-h-[22rem] flex flex-col justify-start transition-all duration-300 opacity-0 fall-animation fall-delay-${(index % 8) + 1}`;
            card.setAttribute("data-index", index);
            card.innerHTML = `
        <div class="relative flex flex-col h-full bg-gray-200 shadow-2xl rounded-lg p-4 min-h-[350px]">
          <!-- Image Container -->
          <div class="flex justify-center items-center pt-2 pb-4">
            <img class="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-gray-200 transition-transform duration-300 ease-in-out transform hover:scale-110"
                 src="${artist.artist.image}" alt="${artist.artist.name}">
          </div>
          <!-- Artist Name -->
          <div class="flex-grow flex items-center justify-center">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800 text-center mt-1">
              ${artist.artist.name}
            </h2>
          </div>
          <!-- Button -->
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

    // Create pagination controls
    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationControls.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.className = "pagination-btn px-4 py-2 mx-1 bg-gray-500 text-white rounded hover:bg-yellow-300";
            button.textContent = i;
            button.setAttribute("data-page", i);
            if (i === currentPage) {
                button.classList.add("active");
            }
            button.addEventListener("click", () => {
                if (currentPage !== i) {
                    currentPage = i;
                    renderPage(currentPage);
                    renderPagination(artistsData.length);
                    adjustPaginationPosition();
                }
            });
            paginationControls.appendChild(button);
        }
    }

    // Adjust pagination position
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

    // Handle clicks on pagination container
    paginationControls.addEventListener("click", (event) => {
        const page = parseInt(event.target.getAttribute("data-page"), 10);
        if (page && page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
            renderPagination(artistsData.length);
            adjustPaginationPosition();
        }
    });

    // Fetch data and initialize UI
    fetchArtistsWithRetry(jsonURL)
        .then((data) => {
            artistsData = data;
            if (!Array.isArray(artistsData)) throw new Error("Fetched data is not an array");
            renderPage(currentPage);
            renderPagination(artistsData.length);
            adjustPaginationPosition();
        })
        .catch((error) => {
            console.error("Error initializing artists:", error);
            artistsContainer.innerHTML = "<p class='text-red-500'>Failed to load artist data. Please try again later.</p>";
        });
});
