document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        // --- Basic Filter Panel Setup ---
        const filtersPanel = document.getElementById("filters-panel");
        const toggleFiltersBtn = document.getElementById("toggle-filters");
        const closeFiltersBtn = document.getElementById("close-filters");
        // Remove applyFiltersBtn from our check since it's removed from HTML
        if (!filtersPanel || !toggleFiltersBtn || !closeFiltersBtn) {
            console.error("❌ Filters elements not found in the DOM.");
            return;
        }

        // Toggle Filters Panel
        toggleFiltersBtn.addEventListener("click", () => {
            filtersPanel.classList.toggle("-translate-x-full");
        });
        closeFiltersBtn.addEventListener("click", () => {
            filtersPanel.classList.add("-translate-x-full");
        });

        // --- Range Input Elements for Creation and Album Dates ---
        const creationStart = document.getElementById("creation-start");
        const creationEnd = document.getElementById("creation-end");
        const creationStartValue = document.getElementById("creation-start-value");
        const creationEndValue = document.getElementById("creation-end-value");

        const albumStart = document.getElementById("album-start");
        const albumEnd = document.getElementById("album-end");
        const albumStartValue = document.getElementById("album-start-value");
        const albumEndValue = document.getElementById("album-end-value");

        // --- Attach Validation on Range Inputs ---
        function validateRangeInput(startInput, endInput, startDisplay, endDisplay) {
            startInput.addEventListener("input", () => {
                if (parseInt(startInput.value) > parseInt(endInput.value)) {
                    startInput.value = endInput.value;
                }
                startDisplay.textContent = startInput.value;
                startInput.classList.add("focus-glow");
            });
            endInput.addEventListener("input", () => {
                if (parseInt(endInput.value) < parseInt(startInput.value)) {
                    endInput.value = startInput.value;
                }
                endDisplay.textContent = endInput.value;
                endInput.classList.add("focus-glow");
            });
        }
        validateRangeInput(creationStart, creationEnd, creationStartValue, creationEndValue);
        validateRangeInput(albumStart, albumEnd, albumStartValue, albumEndValue);

        // --- Attach Change Listeners for Filter Controls ---
        // (Do not include location-checkbox here since those are added dynamically)
        const filterControls = [
            creationStart,
            creationEnd,
            albumStart,
            albumEnd,
            ...document.querySelectorAll(".members-checkbox")
        ];
        filterControls.forEach(control => {
            control.addEventListener("change", () => {
                updateFilters();
            });
        });

        // --- Members Checkboxes Appearance ---
        const membersCheckboxes = document.querySelectorAll(".members-checkbox");
        membersCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    checkbox.parentElement.classList.remove("bg-gray-100");
                    checkbox.parentElement.classList.add("bg-yellow-300");
                } else {
                    checkbox.parentElement.classList.remove("bg-yellow-300");
                    checkbox.parentElement.classList.add("bg-gray-100");
                }
            });
        });

        // --- Location Dropdown Setup ---
        const locationFilterToggle = document.getElementById("location-filter-toggle");
        const locationDropdown = document.getElementById("location-dropdown");
        // locationCheckboxes will be populated dynamically
        let locationCheckboxes = document.querySelectorAll(".location-checkbox");

        if (!locationFilterToggle || !locationDropdown) {
            console.error("❌ Location filter elements are missing.");
            return;
        }
        locationFilterToggle.addEventListener("click", () => {
            locationDropdown.classList.toggle("hidden");
        });

        // --- Clear Filters Functionality ---
        const clearFiltersBtn = document.getElementById("clear-filters");
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener("click", () => {
                console.log("Clear button clicked");
                // Reset range inputs to defaults
                creationStart.value = "1950";
                creationEnd.value = "2025";
                albumStart.value = "1950";
                albumEnd.value = "2025";
                creationStartValue.textContent = creationStart.value;
                creationEndValue.textContent = creationEnd.value;
                albumStartValue.textContent = albumStart.value;
                albumEndValue.textContent = albumEnd.value;

                // Clear members checkboxes
                membersCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.parentElement.classList.remove("bg-yellow-300");
                    checkbox.parentElement.classList.add("bg-gray-100");
                });
                // Re-query and clear location checkboxes (dynamically added)
                document.querySelectorAll(".location-checkbox").forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.parentElement.classList.remove("bg-yellow-300");
                    checkbox.parentElement.classList.add("bg-gray-100");
                });
                console.log("Filters cleared");

                // Now call updateFilters() so that it detects no filters and renders page 1
                updateFilters();
            });
        } else {
            console.error("Clear Filters button not found.");
        }

        // --- Filtering Function ---
        function updateFilters() {
            if (!window.artistsData || window.artistsData.length === 0) {
                console.warn("artistsData not loaded yet.");
                return;
            }

            const selectedCreationStart = parseInt(creationStart.value) || 1950;
            const selectedCreationEnd = parseInt(creationEnd.value) || 2025;
            const selectedAlbumStart = parseInt(albumStart.value) || 1950;
            const selectedAlbumEnd = parseInt(albumEnd.value) || 2025;

            const selectedMembers = [];
            document.querySelectorAll(".members-checkbox").forEach(checkbox => {
                if (checkbox.checked) {
                    const val = parseInt(checkbox.value);
                    if (!isNaN(val)) selectedMembers.push(val);
                }
            });
            const selectedLocations = [];
            document.querySelectorAll(".location-checkbox").forEach(checkbox => {
                if (checkbox.checked) selectedLocations.push(checkbox.value.toLowerCase());
            });

            console.log("Creation range:", selectedCreationStart, "-", selectedCreationEnd);
            console.log("Album range:", selectedAlbumStart, "-", selectedAlbumEnd);
            console.log("Selected members:", selectedMembers);
            console.log("Selected locations:", selectedLocations);

            // If no filters are applied, clear the filtered results
            if (
                selectedCreationStart === 1950 && selectedCreationEnd === 2025 &&
                selectedAlbumStart === 1950 && selectedAlbumEnd === 2025 &&
                selectedMembers.length === 0 && selectedLocations.length === 0
            ) {
                window.filteredArtists = null;
                window.currentPage = 1;
                window.renderPage(window.currentPage);
                window.renderPagination(window.artistsData.length);
                return;
            }

            const filteredArtists = window.artistsData.filter(artist => {
                const creationYear = parseInt(artist.artist.creationDate);
                // Extract album year using a regex for robustness:
                let albumYearMatch = artist.artist.firstAlbum.match(/\d{4}/);
                let albumYear = albumYearMatch ? parseInt(albumYearMatch[0]) : 1950;
                const membersCount = artist.artist.members.length;
                const artistLocations = Object.keys(artist.relations).map(loc => loc.toLowerCase());

                return (
                    creationYear >= selectedCreationStart && creationYear <= selectedCreationEnd &&
                    albumYear >= selectedAlbumStart && albumYear <= selectedAlbumEnd &&
                    (selectedMembers.length === 0 || selectedMembers.includes(membersCount)) &&
                    (selectedLocations.length === 0 || selectedLocations.some(loc => artistLocations.includes(loc)))
                );
            });

            console.log("Filtered artists:", filteredArtists);
            window.filteredArtists = filteredArtists;
            window.currentPage = 1;
            window.renderPage(window.currentPage);
            window.renderPagination(filteredArtists.length);
        }

        // --- Dynamically Populate Location Filter ---
        function populateLocationFilter() {
            const locationDropdown = document.getElementById("location-dropdown");
            if (!locationDropdown) return;
            if (!window.artistsData || window.artistsData.length === 0) {
                console.warn("No artists data available to populate locations.");
                return;
            }
            const locationsSet = new Set();
            window.artistsData.forEach(artist => {
                if (artist.relations && typeof artist.relations === "object") {
                    Object.keys(artist.relations).forEach(loc => locationsSet.add(loc));
                }
            });
            locationDropdown.innerHTML = "";
            locationsSet.forEach(loc => {
                const formattedLoc = loc.split("_").join(" ");
                const label = document.createElement("label");
                label.className =
                    "flex items-center space-x-2 p-2 bg-gray-50 border border-gray-200 rounded cursor-pointer hover:bg-yellow-50 transition-colors duration-200";
                label.innerHTML = `<input type="checkbox" class="location-checkbox accent-yellow-400" value="${loc}">
                           <span class="text-sm text-gray-800">${formattedLoc}</span>`;
                locationDropdown.appendChild(label);
            });
            // Update local reference for location checkboxes
            locationCheckboxes = document.querySelectorAll(".location-checkbox");
            console.log("Location filter populated with:", Array.from(locationsSet));
        }

        // Listen for the custom event dispatched when artistsData is loaded
        document.addEventListener("artistsDataLoaded", () => {
            populateLocationFilter();
        });
    }, 200);
});
