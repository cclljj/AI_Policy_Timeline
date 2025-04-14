// Update the import statement to use the global `vis` object provided by the CDN
// Remove the incorrect import
// import { DataSet, Timeline } from 'vis-timeline/standalone';

// Use the global `vis` object instead
const { DataSet, Timeline } = vis;
// Remove the local CSS import and use a CDN instead
// import '../node_modules/vis-timeline/styles/vis-timeline-graph2d.min.css';

// Add a link to the CDN-hosted CSS file dynamically
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis-timeline/7.7.0/vis-timeline-graph2d.min.css" />');

// Fetch and parse the CSV data
async function fetchCSVData() {
    // Fetch data from both CSV files
    const [event3Data, event4Data] = await Promise.all([
        fetchAndProcessCSV('data/event3.csv'),
        fetchAndProcessCSV('data/event4.csv')
    ]);

    // Combine data from both files
    const combinedItems = [...event3Data.items, ...event4Data.items];

    // Combine unique event types from both files
    const uniqueEtypes = new Set([
        ...event3Data.uniqueEtypes,
        ...event4Data.uniqueEtypes
    ]);
    
    // Create a dictionary with an increasing sequence number mapping to each distinct event type
    const etypeMap = {};
    let sequenceNumber = 0;
    uniqueEtypes.forEach(etype => {
        etypeMap[etype] = sequenceNumber++;
    });  

    // Generate consistent colors for each event type
    const totalEtypes = uniqueEtypes.size;
    const etypeColorMap = {}; 
    combinedItems.forEach(item => {
        // Generate color if not already assigned to this etype
        if (!etypeColorMap[item.etype]) {
            etypeColorMap[item.etype] = `hsl(${etypeMap[item.etype] * (360 / totalEtypes)}, 70%, 80%)`;
        }
        item.style = `background-color: ${etypeColorMap[item.etype]};`;
    });

    // Return the combined data
    return {
        items: combinedItems,
        uniqueEtypes: Array.from(uniqueEtypes),
        etypeColorMap
    };
}

// Helper function to fetch and process a single CSV file
async function fetchAndProcessCSV(csvFilePath) {
    const response = await fetch(csvFilePath);
    const csvText = await response.text();
    const rows = csvText.split('\n').slice(1); // Skip the header row

    const uniqueItems = new Map();
    const uniqueEtypes = new Set();

    rows.forEach((row, index) => {
        // Skip empty rows
        if (!row.trim()) return;
        
        // Use a proper CSV parsing approach for quoted fields
        const columns = parseCSVRow(row);
        if (columns.length < 4) return; // Skip malformed rows
        
        const [date, description, etype, event] = columns;
        let uniqueId = `${csvFilePath}-${date}-${index}`; // Use file path in ID to avoid conflicts between files

        uniqueItems.set(uniqueId, { 
            id: uniqueId, 
            start: date, 
            content: `[${etype}] ${event}`, 
            detail: description, 
            etype: etype 
        });
        
        if (etype) {
            uniqueEtypes.add(etype);
        }
    });
    
    return {
        items: Array.from(uniqueItems.values()),
        uniqueEtypes: Array.from(uniqueEtypes)
    };
}

// Helper function to properly parse CSV rows, handling quoted fields
function parseCSVRow(row) {
    const result = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    
    // Don't forget to add the last field
    result.push(currentField);
    return result;
}

// Initialize the timeline
async function initializeTimeline() {
    const container = document.getElementById('timeline');
    if (!container) {
        console.error('Timeline container not found!');
        return;
    }

    // Create a wrapper for the entire layout
    let layoutWrapper = document.getElementById('layout-wrapper');
    if (!layoutWrapper) {
        layoutWrapper = document.createElement('div');
        layoutWrapper.id = 'layout-wrapper';
        container.parentNode.insertBefore(layoutWrapper, container);
        layoutWrapper.appendChild(container);
        
        // Add CSS for the layout
        const layoutStyle = document.createElement('style');
        layoutStyle.textContent = `
            #layout-wrapper {
                display: flex;
                flex-direction: row;
                width: 100%;
                max-width: 100%;
                overflow-x: hidden;
            }
            #filter-container {
                min-width: 180px;
                padding: 10px;
                background-color: #f5f5f5;
                border-right: 1px solid #ddd;
                overflow-y: auto;
                max-height: 100vh;
            }
            #timeline {
                flex-grow: 1;
                height: 100vh;
                min-height: 500px;
            }
            .filter-item {
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                padding: 3px 5px;
                border-radius: 4px;
            }
            .filter-item input {
                margin-right: 8px;
            }
            .filter-title {
                font-weight: bold;
                margin-bottom: 10px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 5px;
            }
            @media (max-width: 768px) {
                #layout-wrapper {
                    flex-direction: column;
                }
                #filter-container {
                    width: 100%;
                    max-width: 100%;
                    border-right: none;
                    border-bottom: 1px solid #ddd;
                    max-height: 200px;
                }
            }
        `;
        document.head.appendChild(layoutStyle);
    }

    // Create or get the filter container and add it to the layout wrapper
    let filterContainer = document.getElementById('filter-container');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.id = 'filter-container';
        layoutWrapper.insertBefore(filterContainer, container);
    }

    const { items, uniqueEtypes, etypeColorMap } = await fetchCSVData();
    const dataSet = new DataSet(items);

    // Add a title to the filter container
    const filterTitle = document.createElement('div');
    filterTitle.className = 'filter-title';
    // Add filter section title
    filterTitle.textContent = 'Event Types';
    filterContainer.appendChild(filterTitle);

    // Create the filter UI and tracking mechanism
    const activeEtypes = new Set(uniqueEtypes); // Track currently visible event types
    
    // Generate filter checkboxes for each event type
    uniqueEtypes.forEach(etype => {
        // Create filter item with matching background color as the timeline item
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        filterItem.style.backgroundColor = etypeColorMap[etype];
        
        // Create and configure checkbox for toggling event visibility
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-${etype}`;
        checkbox.checked = true; // All event types visible by default
        
        // Create label for the checkbox
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = etype;
        
        // Add event listener to update timeline when filter changes
        checkbox.addEventListener('change', () => {
            // Update the set of active event types
            checkbox.checked ? activeEtypes.add(etype) : activeEtypes.delete(etype);
            updateTimeline();
        });

        // Add checkbox and label to the filter item
        filterItem.append(checkbox, label);
        filterContainer.appendChild(filterItem);
    });

    // Function to update the timeline based on active event types
    function updateTimeline() {
        const filteredItems = items.filter(item => activeEtypes.has(item.etype));
        dataSet.clear();
        dataSet.add(filteredItems);
    }

    // Update the timeline options to center on today's date and adjust the timeline scale to cover the first and next 6 months
    const options = {
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1), // Start 6 months before today
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1),   // End 6 months after today
        editable: false,
        margin: {
            item: 10
        },
        center: new Date(), // Center the timeline on today's date
        orientation: {
            axis: 'top',    // Place the axis at the top
            item: 'top'     // Place items at the top
        }
    };

    const timeline = new Timeline(container, dataSet, options);

    // Add window resize event to handle responsive adjustments
    window.addEventListener('resize', () => {
        timeline.redraw();
    });

    // Add a tooltip element to the document
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    // Update the tooltip content to include the "Description" field
    timeline.on('itemover', function (properties) {
        const item = dataSet.get(properties.item);
        if (item) {
            tooltip.innerHTML = `${item.start}<br>${item.content}<br>${item.detail}`; // Updated to show "Date" and "Description"
            tooltip.style.display = 'block';
        }
    });

    timeline.on('itemout', function () {
        tooltip.style.display = 'none';
    });

    document.addEventListener('mousemove', function (event) {
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    });
}

// Call the initialization function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTimeline();
});