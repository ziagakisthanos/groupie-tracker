document.addEventListener("DOMContentLoaded", () => {
    const searchContainer = document.getElementById("search-container");
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const searchIcon = document.getElementById("search-icon");

    // Make the entire search bar clickable
    searchContainer.addEventListener("click", (e) => {
        if (e.target !== searchInput) {
            searchInput.focus();
        }
    });

    // Clicking the search icon focuses the input
    searchIcon.addEventListener("click", () => {
        searchInput.focus();
    });

    // Handle form submission
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert(`Searching for: ${searchInput.value}`);
    });
});
