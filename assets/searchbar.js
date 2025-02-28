document.addEventListener("DOMContentLoaded", () => {
    // Grab searchbar elements.
    const searchContainer = document.getElementById("search-container");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const searchIcon = document.getElementById("search-icon");

    if (!searchContainer || !searchForm || !searchInput || !searchIcon) {
        console.error("Searchbar elements are missing in the DOM.");
        return;
    }

    // Focus the search input when clicking the container or icon.
    searchContainer.addEventListener("click", (e) => {
        if (e.target !== searchInput) searchInput.focus();
    });
    searchIcon.addEventListener("click", () => searchInput.focus());

    // Create suggestion box if not already present.
    let suggestionBox = document.getElementById("suggestion-box");
    if (!suggestionBox) {
        suggestionBox = document.createElement("div");
        suggestionBox.id = "suggestion-box";
        suggestionBox.className = "absolute bg-white border border-gray-300 w-full z-50";
        searchContainer.style.position = "relative";
        suggestionBox.style.top = "100%";
        suggestionBox.style.left = "0";
        suggestionBox.style.right = "0";
        suggestionBox.style.maxHeight = "200px";
        suggestionBox.style.overflowY = "auto";
        searchContainer.appendChild(suggestionBox);
    }

    // Normalize a string: remove non-alphanumeric characters and lowercase.
    function normalizeString(str) {
        return str.replace(/[^a-z0-9]/gi, "").toLowerCase();
    }

    // Format a raw location string (e.g., "saitama-japan") into "Saitama, Japan".
    function formatLocation(rawLoc) {
        let temp = rawLoc.replace(/_/g, " ");
        let parts = temp.split("-");
        parts = parts.map(part =>
            part
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ")
        );
        return parts.map(p => (p.toLowerCase() === "usa" ? "USA" : p)).join(", ");
    }

    // Clear the suggestion box.
    function clearSuggestions() {
        suggestionBox.innerHTML = "";
    }

    // Create a suggestion item element.
    function createSuggestionItem(text, type) {
        if (type === "location") text = formatLocation(text);
        const item = document.createElement("div");
        item.className = "px-4 py-2 hover:bg-gray-200 cursor-pointer";
        item.textContent = text;
        item.addEventListener("click", () => {
            searchInput.value = text;
            clearSuggestions();
            // Submit the form programmatically.
            searchForm.dispatchEvent(new Event("submit"));
        });
        return item;
    }

    // Perform live suggestions using substring matching on normalized values.
    // For a single-character query, only return suggestions that start with that character.
    function performSearchSuggestions(query) {
        if (!window.artistsData) return [];
        const normalizedQuery = normalizeString(query);
        const suggestionsMap = new Map();

        window.artistsData.forEach(artist => {
            // Artist name check.
            const artistName = artist.artist.name;
            const normalizedArtistName = normalizeString(artistName);
            if (normalizedQuery.length === 1) {
                if (normalizedArtistName.startsWith(normalizedQuery)) {
                    const key = normalizedArtistName;
                    if (!suggestionsMap.has(key)) {
                        suggestionsMap.set(key, { text: artistName, type: "artist" });
                    }
                }
            } else if (normalizedArtistName.includes(normalizedQuery)) {
                const key = `${normalizedArtistName}|artist`;
                if (!suggestionsMap.has(key)) {
                    suggestionsMap.set(key, { text: artistName, type: "artist" });
                }
            }

            // Members check.
            artist.artist.members.forEach(member => {
                const normalizedMember = normalizeString(member);
                if (normalizedQuery.length === 1) {
                    if (normalizedMember.startsWith(normalizedQuery)) {
                        const key = `${normalizedMember}|member`;
                        if (!suggestionsMap.has(key)) {
                            suggestionsMap.set(key, { text: member, type: "member" });
                        }
                    }
                } else if (normalizedMember.includes(normalizedQuery)) {
                    const key = `${normalizedMember}|member`;
                    if (!suggestionsMap.has(key)) {
                        suggestionsMap.set(key, { text: member, type: "member" });
                    }
                }
            });

            // Locations check.
            if (Array.isArray(artist.locations)) {
                artist.locations.forEach(loc => {
                    const normalizedLoc = normalizeString(loc);
                    if (normalizedQuery.length === 1) {
                        if (normalizedLoc.startsWith(normalizedQuery)) {
                            const key = `${normalizedLoc}|location`;
                            if (!suggestionsMap.has(key)) {
                                suggestionsMap.set(key, { text: loc, type: "location" });
                            }
                        }
                    } else if (normalizedLoc.includes(normalizedQuery)) {
                        const key = `${normalizedLoc}|location`;
                        if (!suggestionsMap.has(key)) {
                            suggestionsMap.set(key, { text: loc, type: "location" });
                        }
                    }
                });
            }

            // First album date check.
            if (artist.artist.firstAlbum && normalizeString(artist.artist.firstAlbum).includes(normalizedQuery)) {
                const key = `${normalizeString(artist.artist.firstAlbum)}|first album`;
                if (!suggestionsMap.has(key)) {
                    suggestionsMap.set(key, { text: artist.artist.firstAlbum, type: "first album" });
                }
            }

            // Creation date check.
            if (artist.artist.creationDate && artist.artist.creationDate.toString().includes(query)) {
                const key = `${artist.artist.creationDate.toString()}|creation date`;
                if (!suggestionsMap.has(key)) {
                    suggestionsMap.set(key, { text: artist.artist.creationDate.toString(), type: "creation date" });
                }
            }
        });
        return Array.from(suggestionsMap.values());
    }

    // Debounce live suggestions on keyup.
    let debounceTimer;
    searchInput.addEventListener("keyup", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            if (!query) {
                clearSuggestions();
                return;
            }
            const suggestions = performSearchSuggestions(query);
            clearSuggestions();
            suggestions.forEach(sugg => {
                const item = createSuggestionItem(sugg.text, sugg.type);
                suggestionBox.appendChild(item);
            });
        }, 300);
    });

    // Add an input event listener to reset the view if search input is cleared.
    searchInput.addEventListener("input", () => {
        if (searchInput.value.trim() === "") {
            window.filteredArtists = null;
            window.currentPage = 1;
            window.renderPage(window.currentPage);
            window.renderPagination(window.artistsData.length);
        }
    });

    // Handle search form submission: filter artists and update UI.
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        clearSuggestions();
        const rawQuery = searchInput.value.trim();
        const normalizedQuery = normalizeString(rawQuery);

        // If the search input is empty, reset filtering.
        if (rawQuery === "") {
            window.filteredArtists = null;
            window.currentPage = 1;
            window.renderPage(window.currentPage);
            window.renderPagination(window.artistsData.length);
            return;
        }

        // If the query has no alphanumeric characters, show no results.
        if (normalizedQuery === "") {
            window.filteredArtists = [];
            window.currentPage = 1;
            window.renderPage(window.currentPage);
            window.renderPagination(0);
            return;
        }

        let results;
        // If query is a single character, only filter artist names using startsWith.
        if (normalizedQuery.length === 1) {
            results = window.artistsData.filter(artist =>
                normalizeString(artist.artist.name).startsWith(normalizedQuery)
            );
        } else {
            results = window.artistsData.filter(artist =>
                normalizeString(artist.artist.name).includes(normalizedQuery) ||
                artist.artist.members.some(member => normalizeString(member).includes(normalizedQuery)) ||
                (Array.isArray(artist.locations) && artist.locations.some(loc => normalizeString(loc).includes(normalizedQuery))) ||
                (artist.artist.firstAlbum && normalizeString(artist.artist.firstAlbum).includes(normalizedQuery)) ||
                (artist.artist.creationDate && artist.artist.creationDate.toString().includes(rawQuery))
            );
        }
        window.filteredArtists = results;
        window.currentPage = 1;
        window.renderPage(window.currentPage);
        window.renderPagination(results.length);
    });
});
