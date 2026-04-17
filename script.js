let allFacilities = [];
let filteredFacilities = [];
let currentSort = "name";
let maxAdp = 0;

// US State abbreviations to full names mapping
const stateNames = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
  AS: "American Samoa",
  GU: "Guam",
  MP: "Northern Mariana Islands",
  PR: "Puerto Rico",
  VI: "U.S. Virgin Islands",
};

let map;
let markersLayer;
let allCountyPoints = [];
// function initMap() {
//     map = L.map('map').setView([37.8, -96], 4); //US center
//     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 18,
//     attribution: '&copy; OpenStreetMap'
//   }).addTo(map);
//   markersLayer = L.layerGroup().addTo(map);
// }
// Continental US + Alaska/Hawaii bounding box
const USA_BOUNDS = L.latLngBounds(
  L.latLng(15.0, -180.0),
  L.latLng(72.0, -60.0),
);
const USA_CENTER = [38.5, -96];
const USA_ZOOM = 3;

function initMap() {
  map = L.map("map", {
    minZoom: 3,
    maxZoom: 13,
    maxBounds: USA_BOUNDS,
    maxBoundsViscosity: 1.0,
    zoomControl: true,
  }).setView(USA_CENTER, USA_ZOOM);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 13,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      bounds: USA_BOUNDS,
    },
  ).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Add ADP legend control to the map
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "map-legend");
    div.innerHTML = `
      <div class="map-legend-title">ADP Level</div>
      <div class="map-legend-item"><span class="map-legend-dot" style="background:#f03b20;"></span> &ge; 1,000</div>
      <div class="map-legend-item"><span class="map-legend-dot" style="background:#feb24c;"></span> 100 – 999</div>
      <div class="map-legend-item"><span class="map-legend-dot" style="background:#ffeda0; border:1px solid #feb24c;"></span> &lt; 100</div>
      <div class="map-legend-item"><span class="map-legend-dot" style="background:#bdc3c7;"></span> No updated data</div>
    `;
    return div;
  };
  legend.addTo(map);

  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}
async function loadCountyCoordinates() {
  try {
    const response = await fetch("./CountyCoordinates.json");
    const data = await response.json();
    allCountyPoints = data;
    renderCountyMarkers(data);
  } catch (error) {
    console.error("Error loading county coordinates:", error);
  }
}

function facilityNameToHtmlFile(name) {
  return (
    String(name || "")
      .trim()
      .toUpperCase()
      .replace(/ /g, "_") + // ONLY spaces
    ".html"
  );
}

const ADP_COLORS = {
  high: { fill: "#f03b20", stroke: "#bd0026" },
  medium: { fill: "#feb24c", stroke: "#f07d00" },
  low: { fill: "#ffeda0", stroke: "#feb24c" },
  none: { fill: "#bdc3c7", stroke: "#95a5a6" },
};

function adpColorKey(adp) {
  if (adp == null) return "none";
  if (adp >= 1000) return "high";
  if (adp >= 100) return "medium";
  return "low";
}

function renderCountyMarkers(points) {
  markersLayer.clearLayers();

  points.forEach((p) => {
    const lat = Number(p.Latitude);
    const lng = Number(p.Longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    // Match to allFacilities to get ADP
    const pNameUpper = (p.Name || "").toUpperCase();
    const match = allFacilities.find(
      (f) => (f.Name || "").toUpperCase() === pNameUpper,
    );
    const adp = match ? match.CurrentIntervalADP : null;
    const colorKey = adpColorKey(adp);
    const colors = ADP_COLORS[colorKey];

    // Rich tooltip with ADP info
    const adpLabel =
      adp != null ? `ADP: ${adp.toLocaleString()}` : "No ADP data";
    const updatedLabel =
      match && match.LatestUpdate ? formatDate(match.LatestUpdate) : "";
    const tooltipHtml = `
      <div style="font-size:0.82rem; line-height:1.5;">
        <div style="font-weight:600; margin-bottom:2px;">${p.Name}</div>
        <div style="color:#888; font-size:0.75rem;">${p.City}, ${p.State}</div>
        <div style="color:${colors.fill}; font-weight:700; margin-top:4px;">${adpLabel}</div>
        ${updatedLabel ? `<div style="color:#aaa; font-size:0.72rem;">Updated: ${updatedLabel}</div>` : ""}
      </div>`;

    const marker = L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: colors.fill,
      color: colors.stroke,
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .addTo(markersLayer)
      .bindTooltip(tooltipHtml, { direction: "top", offset: [0, -6] });

    marker.on("click", () => {
      const filename = match ? match.filename : facilityNameToHtmlFile(p.Name);
      window.location.href = `facility/${filename}`;
    });
  });
}

function updateMapMarkers() {
  if (!allCountyPoints.length) return;
  const filteredNames = new Set(
    filteredFacilities.map((f) => (f.Name || "").toUpperCase()),
  );
  const visiblePoints = allCountyPoints.filter((p) =>
    filteredNames.has((p.Name || "").toUpperCase()),
  );
  renderCountyMarkers(visiblePoints);

  const isFiltered = filteredFacilities.length < allFacilities.length;

  if (!isFiltered || visiblePoints.length === 0) {
    // Reset to full USA view when no filter or no results
    map.flyTo(USA_CENTER, USA_ZOOM, { animate: true, duration: 0.8 });
    return;
  }

  const latlngs = visiblePoints
    .filter(
      (p) =>
        Number.isFinite(Number(p.Latitude)) &&
        Number.isFinite(Number(p.Longitude)),
    )
    .map((p) => [Number(p.Latitude), Number(p.Longitude)]);

  if (latlngs.length === 0) return;

  if (latlngs.length === 1) {
    map.flyTo(latlngs[0], 9, { animate: true, duration: 0.8 });
  } else {
    const bounds = L.latLngBounds(latlngs);
    map.flyToBounds(bounds, {
      padding: [40, 40],
      maxZoom: 9,
      animate: true,
      duration: 0.8,
    });
  }
}

// Load facilities from JSON
async function loadFacilities() {
  try {
    const response = await fetch("./index.json");
    const data = await response.json();

    // Separate the NOTES entry from real facilities
    const notesEntry = data.find((f) => f.DETLOC === "NOTES");
    allFacilities = data.filter((f) => f.DETLOC !== "NOTES");
    filteredFacilities = [...allFacilities];

    // Compute max ADP for the progress bar
    maxAdp = Math.max(
      0,
      ...allFacilities
        .map((f) => f.CurrentIntervalADP)
        .filter((v) => v !== null && v !== undefined),
    );

    // Show notes link if notes entry exists
    const notesLink = document.getElementById("notesLink");
    if (notesEntry && notesLink) {
      notesLink.href = `facility/${notesEntry.filename}`;
      notesLink.style.display = "inline-flex";
    }

    // Update total count (header badge)
    document.getElementById("totalFacilities").textContent =
      `${allFacilities.length} Detention Centers`;

    // Results count in toolbar
    const resultsCount = document.getElementById("resultsCount");
    if (resultsCount)
      resultsCount.textContent = `${allFacilities.length} facilities`;

    // Set dynamic placeholders based on first few facilities
    setDynamicPlaceholders();

    // Display facilities
    displayFacilities(filteredFacilities);
  } catch (error) {
    console.error("Error loading facilities:", error);
    document.getElementById("facilitiesContent").innerHTML =
      '<div class="no-results">Error loading facilities. Please check if index.json exists.</div>';
  }
}

// Set dynamic placeholders and populate dropdowns based on actual data
function setDynamicPlaceholders() {
  if (allFacilities.length > 0) {
    // Get unique state abbreviations and sort them
    const stateAbbreviations = [
      ...new Set(allFacilities.map((f) => f.State).filter(Boolean)),
    ].sort();
    const cities = [
      ...new Set(allFacilities.map((f) => f.City).filter(Boolean)),
    ];
    const zips = [...new Set(allFacilities.map((f) => f.Zip).filter(Boolean))];

    // Populate states dropdown with full names
    const stateSelect = document.getElementById("stateSearch");
    stateSelect.innerHTML = '<option value="">All States</option>';

    stateAbbreviations.forEach((abbr) => {
      const option = document.createElement("option");
      option.value = abbr; // Keep abbreviation as value for filtering
      option.textContent = stateNames[abbr] || abbr; // Show full name, fallback to abbreviation
      stateSelect.appendChild(option);
    });

    // Set placeholders for other fields with examples from the data
    document.getElementById("citySearch").placeholder =
      cities.length > 0 ? `e.g., ${cities[0]}` : "Search cities...";
    document.getElementById("zipSearch").placeholder =
      zips.length > 0 ? `e.g., ${zips[0]}` : "Search zip codes...";
  }
}

function sortFacilities(facilities) {
  return [...facilities].sort((a, b) => {
    switch (currentSort) {
      case "adp-desc":
        if (a.CurrentIntervalADP == null && b.CurrentIntervalADP == null)
          return 0;
        if (a.CurrentIntervalADP == null) return 1;
        if (b.CurrentIntervalADP == null) return -1;
        return b.CurrentIntervalADP - a.CurrentIntervalADP;
      case "adp-asc":
        if (a.CurrentIntervalADP == null && b.CurrentIntervalADP == null)
          return 0;
        if (a.CurrentIntervalADP == null) return 1;
        if (b.CurrentIntervalADP == null) return -1;
        return a.CurrentIntervalADP - b.CurrentIntervalADP;
      case "updated-desc":
        if (!a.LatestUpdate && !b.LatestUpdate) return 0;
        if (!a.LatestUpdate) return 1;
        if (!b.LatestUpdate) return -1;
        return b.LatestUpdate.localeCompare(a.LatestUpdate);
      case "updated-asc":
        if (!a.LatestUpdate && !b.LatestUpdate) return 0;
        if (!a.LatestUpdate) return 1;
        if (!b.LatestUpdate) return -1;
        return a.LatestUpdate.localeCompare(b.LatestUpdate);
      default:
        return (a.Name || "").localeCompare(b.Name || "");
    }
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// Display facilities
function displayFacilities(facilities) {
  const container = document.getElementById("facilitiesContent");

  if (facilities.length === 0) {
    container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">&#9740;</div>
                <div>No facilities match your filters.</div>
                <button onclick="clearAllFilters()" class="no-results-clear">Clear filters</button>
            </div>`;
    return;
  }

  const sorted = sortFacilities(facilities);

  const facilitiesHTML = sorted
    .map((facility) => {
      const linkPath = `facility/${facility.filename}`;
      const adp = facility.CurrentIntervalADP;
      const hasAdp = adp !== null && adp !== undefined;

      // Color class based on ADP level
      let adpClass = "adp-none";
      if (hasAdp) {
        if (adp >= 1000) adpClass = "adp-high";
        else if (adp >= 100) adpClass = "adp-medium";
        else adpClass = "adp-low";
      }

      const adpBadge = hasAdp
        ? `<span class="facility-adp"><span class="meta-label">ADP</span> ${adp.toLocaleString()}</span>`
        : "";
      const updatedBadge = facility.LatestUpdate
        ? `<span class="facility-updated"><span class="meta-label">Updated</span> ${formatDate(facility.LatestUpdate)}</span>`
        : "";

      // Mini progress bar relative to max ADP
      const barPct =
        hasAdp && maxAdp > 0
          ? Math.min((adp / maxAdp) * 100, 100).toFixed(1)
          : 0;
      const adpBar = hasAdp
        ? `
            <div class="facility-adp-track">
                <div class="facility-adp-fill ${adpClass}-fill" style="width:${barPct}%"></div>
            </div>`
        : "";

      return `
            <a href="${linkPath}" class="facility-item ${adpClass}">
                <div class="facility-name">${facility.Name}</div>
                <div class="facility-location">${facility.City}, ${facility.State} ${facility.Zip}</div>
                <div class="facility-meta">${adpBadge}${updatedBadge}</div>
                ${adpBar}
            </a>
        `;
    })
    .join("");

  container.innerHTML = `<div class="facilities-list">${facilitiesHTML}</div>`;
}

// Search + filter functionality
function searchFacilities() {
  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const stateQuery = document.getElementById("stateSearch").value;
  const cityQuery = document
    .getElementById("citySearch")
    .value.toLowerCase()
    .trim();
  const zipQuery = document
    .getElementById("zipSearch")
    .value.toLowerCase()
    .trim();

  filteredFacilities = allFacilities.filter((facility) => {
    const facilityName = (facility.Name || "").toLowerCase();
    const facilityCity = (facility.City || "").toLowerCase();
    const facilityState = (facility.State || "").toLowerCase();
    const facilityStateFull = (stateNames[facility.State] || "").toLowerCase();
    const facilityDetloc = (facility.DETLOC || "").toLowerCase();
    const facilityZip = (facility.Zip || "").toString().toLowerCase();

    const matchesSearch =
      !searchQuery ||
      facilityName.includes(searchQuery) ||
      facilityCity.includes(searchQuery) ||
      facilityState.includes(searchQuery) ||
      facilityStateFull.includes(searchQuery) ||
      facilityDetloc.includes(searchQuery) ||
      facilityZip.includes(searchQuery);

    const matchesState =
      !stateQuery || facilityState.toUpperCase() === stateQuery.toUpperCase();
    const matchesCity = !cityQuery || facilityCity.includes(cityQuery);
    const matchesZip = !zipQuery || facilityZip.includes(zipQuery);

    return matchesSearch && matchesState && matchesCity && matchesZip;
  });

  const hasFilters = searchQuery || stateQuery || cityQuery || zipQuery;

  // Results count in toolbar
  const resultsCount = document.getElementById("resultsCount");
  if (resultsCount) {
    resultsCount.textContent = hasFilters
      ? `${filteredFacilities.length} of ${allFacilities.length} facilities`
      : `${allFacilities.length} facilities`;
  }

  // Show/hide clear button
  const clearBtn = document.getElementById("clearFilters");
  if (clearBtn) clearBtn.style.display = hasFilters ? "inline-flex" : "none";

  displayFacilities(filteredFacilities);
  updateMapMarkers();
}

function clearAllFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("stateSearch").value = "";
  document.getElementById("citySearch").value = "";
  document.getElementById("zipSearch").value = "";
  searchFacilities();
}

// Event listeners
document
  .getElementById("searchInput")
  .addEventListener("input", searchFacilities);
document
  .getElementById("stateSearch")
  .addEventListener("change", searchFacilities);
document
  .getElementById("citySearch")
  .addEventListener("input", searchFacilities);
document
  .getElementById("zipSearch")
  .addEventListener("input", searchFacilities);
document
  .getElementById("clearFilters")
  .addEventListener("click", clearAllFilters);
document.getElementById("sortBy").addEventListener("change", (e) => {
  currentSort = e.target.value;
  displayFacilities(filteredFacilities);
});
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".map-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const lat = btn.dataset.lat;
  const lng = btn.dataset.lng;
  const name = btn.dataset.name;

  window.location.href = `result.html?lat=${lat}&lng=${lng}&name=${name}`;
});

initMap();
loadFacilities().then(() => loadCountyCoordinates());
