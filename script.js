let allFacilities = [];
let filteredFacilities = [];

// Load facilities from JSON
async function loadFacilities() {
    try {
        const response = await fetch('index.json');
        const data = await response.json();

        allFacilities = data;
        filteredFacilities = [...allFacilities];

        // Update total count
        document.getElementById('totalFacilities').textContent =
            `${data.length} Detention Centers`;

        // Set dynamic placeholders based on first few facilities
        setDynamicPlaceholders();

        // Display facilities
        displayFacilities(filteredFacilities);

    } catch (error) {
        console.error('Error loading facilities:', error);
        document.getElementById('facilitiesContent').innerHTML =
            '<div class="no-results">Error loading facilities. Please check if index.json exists.</div>';
    }
}

// Set dynamic placeholders and populate dropdowns based on actual data
function setDynamicPlaceholders() {
    if (allFacilities.length > 0) {
        // Get unique values for placeholders and dropdowns
        const states = [...new Set(allFacilities.map(f => f.State).filter(Boolean))].sort();
        const cities = [...new Set(allFacilities.map(f => f.City).filter(Boolean))];
        const zips = [...new Set(allFacilities.map(f => f.Zip).filter(Boolean))];

        // Populate states dropdown
        const stateSelect = document.getElementById('stateSearch');
        stateSelect.innerHTML = '<option value="">All States</option>';
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });

        // Set placeholders for other fields with examples from the data
        document.getElementById('citySearch').placeholder = cities.length > 0 ? `e.g., ${cities[0]}` : 'Search cities...';
        document.getElementById('zipSearch').placeholder = zips.length > 0 ? `e.g., ${zips[0]}` : 'Search zip codes...';
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
                <div class="facility-name">${facility.Name}</div>
                <div class="facility-location">${facility.City}, ${facility.State} ${facility.Zip}</div>
                <div class="facility-detloc">${facility.DETLOC}</div>
            </a>
        `;
    }).join('');

    container.innerHTML = `<div class="facilities-list">${facilitiesHTML}</div>`;
}

// Search functionality
function searchFacilities() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    const stateQuery = document.getElementById('stateSearch').value; // No need to lowercase for exact match
    const cityQuery = document.getElementById('citySearch').value.toLowerCase().trim();
    const zipQuery = document.getElementById('zipSearch').value.toLowerCase().trim();

    filteredFacilities = allFacilities.filter(facility => {
        // Ensure all fields exist and convert to lowercase for comparison
        const facilityName = (facility.Name || '').toLowerCase();
        const facilityCity = (facility.City || '').toLowerCase();
        const facilityState = (facility.State || '');
        const facilityDetloc = (facility.DETLOC || '').toLowerCase();
        const facilityZip = (facility.Zip || '').toString();

        // Main search (name, location, detention code)
        const matchesSearch = !searchQuery || 
            facilityName.includes(searchQuery) ||
            facilityCity.includes(searchQuery) ||
            facilityState.toLowerCase().includes(searchQuery) ||
            facilityDetloc.includes(searchQuery) ||
            facilityZip.includes(searchQuery);

        // State filter (exact match for dropdown)
        const matchesState = !stateQuery || facilityState === stateQuery;

        // City filter
        const matchesCity = !cityQuery || 
            facilityCity.includes(cityQuery);

        // Zip filter
        const matchesZip = !zipQuery || 
            facilityZip.includes(zipQuery);

        return matchesSearch && matchesState && matchesCity && matchesZip;
    });

    // Update search results info
    const searchResults = document.getElementById('searchResults');
    const hasFilters = searchQuery || stateQuery || cityQuery || zipQuery;
    
    if (hasFilters) {
        searchResults.textContent = `${filteredFacilities.length} facilities found. `;
    } else {
        searchResults.textContent = '';
    }

    displayFacilities(filteredFacilities);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', searchFacilities);
document.getElementById('stateSearch').addEventListener('input', searchFacilities);
document.getElementById('citySearch').addEventListener('input', searchFacilities);
document.getElementById('zipSearch').addEventListener('input', searchFacilities);

// Load facilities on page load
loadFacilities();