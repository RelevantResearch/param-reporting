# ICE Detention Facilities Directory

A comprehensive directory and wiki of ICE (Immigration and Customs Enforcement) detention facilities across the United States. This project provides transparent access to information about detention centers through an easy-to-use web interface.

## Live Site

Visit the directory at: **detentionreports.com**

## Overview

This directory currently contains information on **143 detention centers** across the United States. The site features:

- **Searchable Directory**: Real-time search functionality to find facilities by name or location
- **Individual Facility Pages**: Detailed information for each detention center
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean Interface**: Simple, accessible design for easy navigation

## Features

### Homepage
- Complete list of all detention facilities
- Real-time search with case-insensitive matching
- Clean, modern interface
- Mobile-responsive design

### Search Functionality
- **Instant Results**: Search results update as you type
- **Flexible Matching**: Find facilities using partial names or locations
- **Case Insensitive**: Search works regardless of capitalization
- **Smart Filtering**: Non-matching results disappear automatically

### Individual Facility Pages
Each facility has its own dedicated page with detailed information and statistics.

## Project Structure

```
├── index.html              # Homepage with searchable directory
├── index.json              # Facility data and metadata
├── facility/               # Individual facility pages
│   ├── ADAMS_COUNTY_DET_CENTER.html
│   ├── [OTHER_FACILITIES].html
│   └── ...
├── main.py                 # Python script to generate index.json
└── README.md               # This file
```

## Technical Details

### Built With
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data**: JSON for facility metadata
- **Hosting**: GitHub Pages
- **Search**: Client-side filtering with JavaScript

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Data Management

The facility data is managed through:

1. **Individual HTML files** for each detention center in the `/facility/` directory
2. **Automated indexing** using the included Python script (`main.py`)
3. **JSON metadata** (`index.json`) for the searchable directory

### Updating the Directory

To add new facilities or update existing ones:

1. Add new HTML files to the `/facility/` directory
2. Run the Python script to regenerate `index.json`:
   ```bash
   python main.py
   ```
3. Commit and push changes to automatically update the live site

## Purpose

This directory serves to:

- **Increase Transparency**: Provide public access to information about detention facilities
- **Support Research**: Enable researchers, journalists, and advocates to access facility data
- **Improve Accessibility**: Make facility information easily searchable and accessible
- **Document Reality**: Maintain a comprehensive record of the detention system

## Usage

1. **Browse All Facilities**: Visit the homepage to see the complete directory
2. **Search**: Use the search box to find specific facilities by name or location
3. **View Details**: Click on any facility to view its dedicated information page
4. **Share**: Each facility has its own URL for easy sharing and referencing

## Contributing

We welcome contributions to improve this directory:

- **Report Issues**: Found incorrect information? Please open an issue
- **Suggest Improvements**: Ideas for better functionality or design
- **Data Updates**: Help keep facility information current and accurate

## License

This project is open source and available for research, educational, and advocacy purposes.

## Links

- **Live Directory**: [detentionreports.com](https://detentionreports.com)
- **Source Code**: [https://github.com/RelevantResearch/param-reporting](https://github.com/RelevantResearch/param-reporting)
- **Developer**: [Relevant Research](https://relevant-research.com/)

## Contact

For questions, corrections, or collaboration opportunities, please:
- Open an issue on this repository
- Visit [Relevant Research](https://relevant-research.com/)

---

*This directory is maintained as a public service to increase transparency and accessibility of information about the U.S. immigration detention system.*