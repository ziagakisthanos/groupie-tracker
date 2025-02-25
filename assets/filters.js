document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const filtersPanel = document.getElementById("filters-panel");
        const toggleFiltersBtn = document.getElementById("toggle-filters");
        const closeFiltersBtn = document.getElementById("close-filters");
        const applyFiltersBtn = document.getElementById("apply-filters");

        if (!filtersPanel || !toggleFiltersBtn || !closeFiltersBtn || !applyFiltersBtn) {
            console.error("❌ Filters elements not found in the DOM.");
            return;
        }

        // ✅ Toggle Filters Panel
        toggleFiltersBtn.addEventListener("click", () => {
            filtersPanel.classList.toggle("-translate-x-full");
        });

        closeFiltersBtn.addEventListener("click", () => {
            filtersPanel.classList.add("-translate-x-full");
        });

        // ✅ Get Filter Elements
        const creationStart = document.getElementById("creation-start");
        const creationEnd = document.getElementById("creation-end");
        const creationStartValue = document.getElementById("creation-start-value");
        const creationEndValue = document.getElementById("creation-end-value");

        const albumStart = document.getElementById("album-start");
        const albumEnd = document.getElementById("album-end");
        const albumStartValue = document.getElementById("album-start-value");
        const albumEndValue = document.getElementById("album-end-value");

        const membersCheckboxes = document.querySelectorAll(".members-checkbox");
        const locationFilterToggle = document.getElementById("location-filter-toggle");
        const locationDropdown = document.getElementById("location-dropdown");
        const locationCheckboxes = document.querySelectorAll(".location-checkbox");

        if (!locationFilterToggle || !locationDropdown) {
            console.error("❌ Location filter elements are missing.");
            return;
        }

        // ✅ Toggle Location Dropdown
        locationFilterToggle.addEventListener("click", () => {
            locationDropdown.classList.toggle("hidden");
        });

        // ✅ Update Member Checkbox Selection with More Visible Color
        membersCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    // When checked, set a more visible blue background
                    checkbox.parentElement.classList.remove("bg-gray-100");
                    checkbox.parentElement.classList.add("bg-blue-300");
                } else {
                    // Restore the default background when unchecked
                    checkbox.parentElement.classList.remove("bg-blue-300");
                    checkbox.parentElement.classList.add("bg-gray-100");
                }
            });
        });

        function validateRangeInput(startInput, endInput, startDisplay, endDisplay) {
            startInput.addEventListener("input", () => {
                if (parseInt(startInput.value) > parseInt(endInput.value)) {
                    startInput.value = endInput.value; // Prevent crossing
                }
                startDisplay.textContent = startInput.value;
                startInput.classList.add("focus-glow"); // Add glow effect
            });

            endInput.addEventListener("input", () => {
                if (parseInt(endInput.value) < parseInt(startInput.value)) {
                    endInput.value = startInput.value; // Prevent crossing
                }
                endDisplay.textContent = endInput.value;
                endInput.classList.add("focus-glow");
            });
        }

        // ✅ Apply validation for both date ranges
        validateRangeInput(creationStart, creationEnd, creationStartValue, creationEndValue);
        validateRangeInput(albumStart, albumEnd, albumStartValue, albumEndValue);

        // ✅ Apply Filters When Button is Clicked
        applyFiltersBtn.addEventListener("click", () => {
            updateFilters();
        });

        // ✅ Clear Filters Functionality
        const clearFiltersBtn = document.getElementById("clear-filters");
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener("click", () => {
                console.log("Clear button clicked");
                // Reset range inputs to default values
                creationStart.value = "1950";
                creationEnd.value = "2025";
                albumStart.value = "1950";
                albumEnd.value = "2025";

                // Update display spans for range inputs
                creationStartValue.textContent = creationStart.value;
                creationEndValue.textContent = creationEnd.value;
                albumStartValue.textContent = albumStart.value;
                albumEndValue.textContent = albumEnd.value;

                // Uncheck all member checkboxes and restore default background
                membersCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.parentElement.classList.remove("bg-blue-300");
                    checkbox.parentElement.classList.add("bg-gray-100");
                });
                // Uncheck all location checkboxes and restore default background if applied
                locationCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.parentElement.classList.remove("bg-blue-300");
                    checkbox.parentElement.classList.add("bg-gray-100");
                });
                console.log("Filters cleared");
            });
        } else {
            console.error("Clear Filters button not found.");
        }

        // ✅ Function to Filter Artists
        function updateFilters() {
            const selectedCreationStart = parseInt(creationStart.value);
            const selectedCreationEnd = parseInt(creationEnd.value);

            const selectedAlbumStart = parseInt(albumStart.value);
            const selectedAlbumEnd = parseInt(albumEnd.value);

            const selectedMembers = [];
            membersCheckboxes.forEach(checkbox => {
                if (checkbox.checked) selectedMembers.push(parseInt(checkbox.value));
            });

            const selectedLocations = [];
            locationCheckboxes.forEach(checkbox => {
                if (checkbox.checked) selectedLocations.push(checkbox.value.toLowerCase());
            });

            // ✅ Show all artists if no filters are applied
            if (
                selectedCreationStart === 1950 && selectedCreationEnd === 2025 &&
                selectedAlbumStart === 1950 && selectedAlbumEnd === 2025 &&
                selectedMembers.length === 0 && selectedLocations.length === 0
            ) {
                renderPage(artistsData); // Reset to show all artists
                return;
            }

            // ✅ Fetch artists data (assuming `artistsData` is available globally)
            if (typeof artistsData === "undefined") {
                console.error("❌ artistsData is not defined.");
                return;
            }

            const filteredArtists = artistsData.filter(artist => {
                const creationYear = parseInt(artist.artist.creationDate);
                const albumYear = parseInt(artist.artist.firstAlbum.split("-")[2]);
                const membersCount = artist.artist.members.length;
                const artistLocations = Object.keys(artist.relations).map(loc => loc.toLowerCase());

                // ✅ Apply filters
                return (
                    creationYear >= selectedCreationStart && creationYear <= selectedCreationEnd &&
                    albumYear >= selectedAlbumStart && albumYear <= selectedAlbumEnd &&
                    (selectedMembers.length === 0 || selectedMembers.includes(membersCount)) &&
                    (selectedLocations.length === 0 || selectedLocations.some(loc => artistLocations.includes(loc)))
                );
            });

            // ✅ Re-render Artists
            renderPage(filteredArtists);
        }

        // ✅ Function to Re-Render Artists after Filtering
        function renderPage(filteredArtists) {
            const artistsContainer = document.getElementById("artists-container");
            artistsContainer.innerHTML = "";

            if (filteredArtists.length === 0) {
                artistsContainer.innerHTML = "<p class='text-center text-gray-600 text-lg'>No artists match your filters.</p>";
                return;
            }

            filteredArtists.forEach(artist => {
                const card = document.createElement("div");
                card.className = "artist-card bg-gray-200 rounded-lg shadow-2xl p-4";

                card.innerHTML = `
                    <div class="relative flex flex-col h-full bg-gray-200 shadow-2xl rounded-lg p-4 min-h-[350px]">
                        <h2 class="text-xl font-bold text-gray-800">${artist.artist.name}</h2>
                        <p class="text-sm text-gray-600"><strong>First Album:</strong> ${artist.artist.firstAlbum}</p>
                        <p class="text-sm text-gray-600"><strong>Members:</strong> ${artist.artist.members.join(", ")}</p>
                    </div>
                `;
                artistsContainer.appendChild(card);
            });
        }

    }, 200);
});
