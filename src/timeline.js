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
    const response = await fetch('data/events.csv');
    const csvText = await response.text();
    const rows = csvText.split('\n').slice(1); // Skip the header row

    const uniqueItems = new Map();

    rows.forEach((row, index) => {
        // Skip empty rows
        if (!row.trim()) return;
        
        // Use a proper CSV parsing approach for quoted fields
        const columns = parseCSVRow(row);
        if (columns.length < 4) return; // Skip malformed rows
        
        const [date, description, etype, event] = columns;
        let uniqueId = date;

        // Ensure the id is unique by appending a counter if necessary
        while (uniqueItems.has(uniqueId)) {
            uniqueId = `${date}-${index}`;
        }

        uniqueItems.set(uniqueId, { id: uniqueId, start: date, content: `[${etype}] ${event}`, detail: description, etype: etype });
    });
    
    // find the unique/distinct etype in uniqueId
    const uniqueEtypes = new Set();
    uniqueItems.forEach(item => {
        if (item.etype) {
            uniqueEtypes.add(item.etype);
        }
    });
    // create a dictionary with an increasing sequence number (starting from 0) mapping to each distinct uniqueItem
    const etypeMap = {};
    let sequenceNumber = 0;
    uniqueEtypes.forEach(etype => {
        etypeMap[etype] = sequenceNumber++;
    });  

    // For each event, assign a distinct background color based on its etype
    const totalEtypes = uniqueEtypes.size;
    const etypeColorMap = {}; // Create a map to store colors for each etype
    uniqueItems.forEach(item => {
        // Generate color if not already assigned to this etype
        if (!etypeColorMap[item.etype]) {
            etypeColorMap[item.etype] = `hsl(${etypeMap[item.etype] * (360 / totalEtypes)}, 70%, 80%)`;
        }
        item.style = `background-color: ${etypeColorMap[item.etype]};`;
    });

    // Return both the items, unique event types, and the color map
    return {
        items: Array.from(uniqueItems.values()),
        uniqueEtypes: Array.from(uniqueEtypes),
        etypeColorMap
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
    filterTitle.textContent = 'Event Types';
    filterContainer.appendChild(filterTitle);

    // Create checkboxes for each unique event type
    const activeEtypes = new Set(uniqueEtypes); // Track active event types

    uniqueEtypes.forEach(etype => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        // Apply the same background color as the event type
        filterItem.style.backgroundColor = etypeColorMap[etype];
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-${etype}`;
        checkbox.checked = true;

        const label = document.createElement('label');
        label.htmlFor = `filter-${etype}`;
        label.textContent = etype;

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                activeEtypes.add(etype);
            } else {
                activeEtypes.delete(etype);
            }
            updateTimeline();
        });

        filterItem.appendChild(checkbox);
        filterItem.appendChild(label);
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