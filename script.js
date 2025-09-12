let allFacilities = [];
let filteredFacilities = [];

// US State abbreviations to full names mapping
const stateNames = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming',
    'DC': 'District of Columbia',
    'AS': 'American Samoa',
    'GU': 'Guam',
    'MP': 'Northern Mariana Islands',
    'PR': 'Puerto Rico',
    'VI': 'U.S. Virgin Islands'
};

// Load facilities from JSON
async function loadFacilities() {
    try {
        const response = await fetch('index.json');
        const data = await response.json();

        allFacilities = data;
        filteredFacilities = [...allFacilities];

        // Update total count
        document.getElementById('totalFacilities').textContent =
            `${data.length - 1} Detention Centers`;

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
        // Get unique state abbreviations and sort them
        const stateAbbreviations = [...new Set(allFacilities.map(f => f.State).filter(Boolean))].sort();
        const cities = [...new Set(allFacilities.map(f => f.City).filter(Boolean))];
        const zips = [...new Set(allFacilities.map(f => f.Zip).filter(Boolean))];

        // Populate states dropdown with full names
        const stateSelect = document.getElementById('stateSearch');
        stateSelect.innerHTML = '<option value="">All States</option>';
        
        stateAbbreviations.forEach(abbr => {
            const option = document.createElement('option');
            option.value = abbr; // Keep abbreviation as value for filtering
            option.textContent = stateNames[abbr] || abbr; // Show full name, fallback to abbreviation
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
        const facilityState = (facility.State || '').toLowerCase();
        const facilityStateFull = (stateNames[facility.State] || '').toLowerCase(); // Full state name
        const facilityDetloc = (facility.DETLOC || '').toLowerCase();
        const facilityZip = (facility.Zip || '').toString().toLowerCase();

        // Main search (name, city, state abbreviation, state full name, detention code, zip)
        const matchesSearch = !searchQuery || 
            facilityName.includes(searchQuery) ||
            facilityCity.includes(searchQuery) ||
            facilityState.includes(searchQuery) ||
            facilityStateFull.includes(searchQuery) ||
            facilityDetloc.includes(searchQuery) ||
            facilityZip.includes(searchQuery);

        // State filter (exact match for dropdown)
        const matchesState = !stateQuery || facilityState.toUpperCase() === stateQuery.toUpperCase();

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
