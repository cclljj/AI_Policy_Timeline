# AI Policy Timeline

A visual timeline application for tracking and displaying AI policy events from around the world in an interactive and user-friendly format.

## Overview

This application renders an interactive timeline visualization from AI policy event data stored in JSON format. The application automatically discovers and loads all JSON files in the `data/` directory, making it easy to add new countries or regions without modifying the source code. Users can filter events by country/region and view detailed information about each policy event. The timeline uses color-coding to distinguish between different countries/regions, providing an intuitive visual representation of global AI policy development.

## Features

- **Interactive Timeline**: Navigate through time with zoom and pan capabilities
- **Dynamic File Discovery**: Automatically discovers and loads all JSON files in the data/ directory
- **Country/Region Filtering**: Filter events by country or region with checkboxes
- **Color-Coded Categories**: Each country/region has a unique color for easy identification
- **Responsive Design**: Optimized for desktop, tablet, and mobile displays
- **Event Details**: Access comprehensive information by hovering over timeline items
- **Easy Data Management**: Add new countries/regions by simply dropping JSON files in the data/ folder

## Project Structure

```
AI_Policy_Timeline/
├── index.html           # Main HTML entry point
├── src/
│   └── timeline.js      # Core timeline rendering and dynamic file discovery logic
├── style/
│   └── timeline.css     # Timeline styling and responsive design rules
├── data/                # AI policy data files (automatically discovered)
│   ├── China.json       # China AI policy events
│   ├── USA.json         # USA AI policy events
│   ├── Japan.json       # Japan AI policy events
│   ├── Germany.json     # Germany AI policy events
│   ├── France.json      # France AI policy events
│   ├── UK.json          # UK AI policy events
│   ├── India.json       # India AI policy events
│   ├── Korea.json       # South Korea AI policy events
│   ├── Singapore.json   # Singapore AI policy events
│   └── Taiwan.json      # Taiwan AI policy events
├── LICENSE              # MIT License
└── README.md            # Project documentation
```

## Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Basic knowledge of HTML/CSS/JavaScript for customization

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/AI_Policy_Timeline.git
   cd AI_Policy_Timeline
   ```

2. No build process is required. You can:
   - Open `index.html` directly in a web browser
   - Host using a local server (recommended):
     ```bash
     # Using Python
     python3 -m http.server 8000
     
     # Using Node.js (after installing http-server)
     npx http-server
     ```
   - Then visit `http://localhost:8000` in your browser

3. For production deployment, upload all files to your web server.

## Configuration

### Adding New Countries/Regions

The application automatically discovers JSON files in the `data/` directory. To add a new country or region:

1. Create a new JSON file in the `data/` directory (e.g., `Canada.json`, `EU.json`)
2. Follow the event data format below
3. The application will automatically detect and load the new file on next page refresh

### Event Data Format

Each JSON file should contain an array of policy events in this format:

```json
[
  {
    "Date": "January 2023",
    "Event": "AI Risk Management Framework (RMF)",
    "Description": "The National Institute of Standards and Technology (NIST) released the AI Risk Management Framework...",
    "Type": "USA"
  },
  {
    "Date": "March 2021", 
    "Event": "14th Five-Year Plan for National Economic and Social Development",
    "Description": "The plan identifies AI as one of seven priority areas for technological breakthroughs...",
    "Type": "China"
  }
]
```

**Required Fields:**
- `Date`: Date of the policy event (flexible formats supported: "January 2023", "2023", "March 15, 2023")
- `Event`: Short title of the policy or event
- `Description`: Detailed description of the policy and its implications
- `Type`: Country/region identifier (should match the filename without .json extension)

### Customization

- **Styling**: Modify `style/timeline.css` to change colors, fonts, and layout
- **File Discovery**: The application automatically searches for common country/region patterns
- **Date Parsing**: Supports flexible date formats including "January 2023", "2023", "March 15, 2023"
- **Extensions**: Add new features by extending the timeline.js functionality

### Supported File Names

The application looks for JSON files matching common patterns:
- **Countries**: China.json, USA.json, Japan.json, Germany.json, France.json, UK.json, etc.
- **Regions**: EU.json, Asia.json, Europe.json, Americas.json, etc.
- **Organizations**: OECD.json, UN.json, WHO.json, etc.
- **Generic**: International.json, Global.json, etc.

## Usage

1. **View Timeline**: Open the application to see all AI policy events on an interactive timeline
2. **Filter by Country**: Use the checkboxes on the left to show/hide events from specific countries
3. **Navigate Timeline**: 
   - Zoom in/out using mouse wheel or zoom controls
   - Pan left/right by dragging the timeline
   - Click and drag to select time ranges
4. **View Details**: Hover over any event to see detailed information in a tooltip
5. **Add Data**: Drop new JSON files in the `data/` folder to add more countries/regions

## Current Data

The timeline currently includes AI policy events from:
- **China** - AI development plans, regulations, and ethical frameworks
- **USA** - Executive orders, frameworks, and federal AI initiatives  
- **Japan** - AI principles, guidelines, and policy frameworks
- **Germany** - National AI strategy and workplace regulations
- **France** - National AI strategies and data protection measures
- **UK** - AI strategies and pro-innovation regulatory approaches
- **India** - National AI strategy and responsible AI initiatives
- **South Korea** - AI strategies and comprehensive AI legislation
- **Singapore** - AI governance frameworks and national strategies
- **Taiwan** - AI action plans and draft legislation

## Browser Compatibility

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)  
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript (no build process required)
- **Visualization**: vis-timeline library for interactive timeline rendering
- **Data Loading**: Dynamic file discovery using fetch API with pattern matching
- **Responsive**: Mobile-friendly design with collapsible filter panel

## Dependencies

- [vis-timeline](https://visjs.github.io/vis-timeline/) - Dynamic, browser-based visualization library (loaded via CDN)

## Contributing

Contributions are welcome! Here are some ways you can help:

### Adding New Data
- Create JSON files for additional countries/regions following the data format
- Update existing files with new policy events
- Verify accuracy of policy descriptions and dates

### Code Improvements  
- Enhance the file discovery mechanism
- Improve responsive design for mobile devices
- Add new timeline features or filtering options

### Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Maintenance

This project is actively maintained. If you encounter any issues or have suggestions, please open an issue in the repository.

## License

This project is licensed under the MIT License. See the LICENSE file for details.