let allFacilities = [];
let filteredFacilities = [];

// Load facilities from JSON
async function loadFacilities() {
    try {
        const response = await fetch('index.json');
        const data = await response.json();

        allFacilities = data.files;
        filteredFacilities = [...allFacilities];

        // Update total count
        document.getElementById('totalFacilities').textContent =
            `${data.total_files} Detention Centers`;

        // Display facilities
        displayFacilities(filteredFacilities);

    } catch (error) {
        console.error('Error loading facilities:', error);
        document.getElementById('facilitiesContent').innerHTML =
            '<div class="no-results">Error loading facilities. Please check if index.json exists.</div>';
    }
}

// Display facilities
function displayFacilities(facilities) {
    const container = document.getElementById('facilitiesContent');

    if (facilities.length === 0) {
        container.innerHTML = '<div class="no-results">No facilities found matching your search.</div>';
        return;
    }

    const facilitiesHTML = facilities.map(facility => {
        const linkPath = `facility/${facility.filename}`;
        return `
            <a href="${linkPath}" class="facility-item">
                <div class="facility-name">${facility.name}</div>
            </a>
        `;
    }).join('');

    container.innerHTML = `<div class="facilities-list">${facilitiesHTML}</div>`;
}

// Search functionality
function searchFacilities(query) {
    if (!query.trim()) {
        filteredFacilities = [...allFacilities];
    } else {
        const searchTerm = query.toLowerCase();
        filteredFacilities = allFacilities.filter(facility =>
            facility.name.toLowerCase().includes(searchTerm) ||
            facility.filename.toLowerCase().includes(searchTerm)
        );
    }

    // Update search results info
    const searchResults = document.getElementById('searchResults');
    if (query.trim()) {
        searchResults.textContent = `${filteredFacilities.length} facilities found. `;
    } else {
        searchResults.textContent = '';
    }

    displayFacilities(filteredFacilities);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchFacilities(e.target.value);
});

// Load facilities on page load
loadFacilities();