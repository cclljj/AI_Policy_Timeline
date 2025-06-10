// Use the global `vis` object instead
const { DataSet, Timeline } = vis;

// Add a link to the CDN-hosted CSS file dynamically
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis-timeline/7.7.0/vis-timeline-graph2d.min.css" />');

// Enhanced function to parse flexible date formats
function parseFlexibleDate(dateString) {
    if (!dateString) {
        console.warn("Empty date string provided");
        return new Date();
    }
    
    // Try to parse exact dates first (YYYY-MM-DD)
    const exactDateMatch = /^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString);
    if (exactDateMatch) {
        return new Date(dateString);
    }
    
    // Try to parse specific dates with custom format (e.g., "September 21, 2021")
    const specificDateRegex = /^([a-zA-Z]+)\s+(\d{1,2})(?:,|)\s+(\d{4})$/;
    const specificDateMatch = dateString.match(specificDateRegex);
    if (specificDateMatch) {
        const month = specificDateMatch[1];
        const day = parseInt(specificDateMatch[2]);
        const year = parseInt(specificDateMatch[3]);
        
        const monthMap = getMonthMap();
        const monthIndex = monthMap[month.toLowerCase()];
        
        if (monthIndex !== undefined) {
            return new Date(year, monthIndex, day);
        }
    }
    
    // Try to parse month and year (e.g., "January 2023", "Jan 2023")
    const monthYearRegex = /^([a-zA-Z]+)\s+(\d{4})$/;
    const monthYearMatch = dateString.match(monthYearRegex);
    if (monthYearMatch) {
        const month = monthYearMatch[1];
        const year = parseInt(monthYearMatch[2]);
        
        const monthMap = getMonthMap();
        const monthIndex = monthMap[month.toLowerCase()];
        
        if (monthIndex !== undefined) {
            return new Date(year, monthIndex, 1);
        }
    }
    
    // Try to parse just the year (e.g., "2023")
    const yearRegex = /^(\d{4})$/;
    const yearMatch = dateString.match(yearRegex);
    if (yearMatch) {
        return new Date(parseInt(yearMatch[1]), 0, 1); // January 1st of the year
    }
    
    // Try to parse date ranges and use the first date (e.g., "2017-2021")
    const dateRangeRegex = /^(\d{4})[^\d]*(\d{4})$/;
    const dateRangeMatch = dateString.match(dateRangeRegex);
    if (dateRangeMatch) {
        const startYear = parseInt(dateRangeMatch[1]);
        return new Date(startYear, 0, 1); // January 1st of the start year
    }
    
    // For dates that couldn't be parsed, log a warning and default to current date
    console.warn(`Could not parse date: "${dateString}", using current date as fallback`);
    return new Date();
}

// Helper function for month name mapping
function getMonthMap() {
    return {
        "january": 0, "jan": 0,
        "february": 1, "feb": 1,
        "march": 2, "mar": 2,
        "april": 3, "apr": 3,
        "may": 4,
        "june": 5, "jun": 5,
        "july": 6, "jul": 6,
        "august": 7, "aug": 7,
        "september": 8, "sep": 8, "sept": 8,
        "october": 9, "oct": 9,
        "november": 10, "nov": 10,
        "december": 11, "dec": 11
    };
}

// Function to normalize and clean date strings before parsing
function cleanDateString(dateString) {
    if (!dateString) return "";
    
    // Convert to string if not already
    dateString = String(dateString);
    
    // Trim whitespace
    dateString = dateString.trim();
    
    // Handle special cases
    if (dateString.toLowerCase() === "2023") return "2023";
    if (dateString.toLowerCase() === "2018") return "2018";
    if (dateString.toLowerCase() === "2019") return "2019";
    if (dateString.toLowerCase() === "2020") return "2020";
    if (dateString.toLowerCase() === "2024") return "2024";
    
    return dateString;
}

// Fetch and parse the JSON data
async function fetchData() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Process the JSON data
        return processData(data);
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return { items: [], uniqueEtypes: [], etypeColorMap: {} };
    }
}

// Process the JSON data into the required format
function processData(data) {
    const items = [];
    const uniqueEtypes = new Set();
    
    // Process each event in the JSON data - adjust for new format
    data.forEach((event, index) => {
        const dateString = cleanDateString(event.Date);
        const description = event.Description;
        const etype = event.Type;
        const title = event.Event;
        const uniqueId = `event-${index}`;
        
        // Parse the date using our enhanced flexible date parser
        const parsedDate = parseFlexibleDate(dateString);
        
        // Log parsing issues for debugging
        if (isNaN(parsedDate.getTime())) {
            console.error(`Failed to parse date for item ${index}: "${dateString}"`);
        }
        
        items.push({
            id: uniqueId,
            start: parsedDate,
            content: `[${etype}] ${title}`,
            detail: description,
            etype: etype,
            // Store original date string for display in tooltips
            originalDate: dateString
        });
        
        if (etype) {
            uniqueEtypes.add(etype);
        }
    });
    
    // Sort items by date
    items.sort((a, b) => a.start - b.start);
    
    // Generate consistent colors for each event type
    const etypeArray = Array.from(uniqueEtypes);
    const totalEtypes = etypeArray.length;
    const etypeColorMap = {};
    
    etypeArray.forEach((etype, index) => {
        etypeColorMap[etype] = `hsl(${index * (360 / totalEtypes)}, 70%, 80%)`;
    });
    
    // Apply colors to items
    items.forEach(item => {
        item.style = `background-color: ${etypeColorMap[item.etype]};`;
    });
    
    return {
        items,
        uniqueEtypes: etypeArray,
        etypeColorMap
    };
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

    const { items, uniqueEtypes, etypeColorMap } = await fetchData();
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

    // Determine the date range for the timeline based on available data
    let minDate = new Date();
    let maxDate = new Date();
    
    if (items.length > 0) {
        // Find earliest and latest dates
        minDate = new Date(Math.min(...items.map(item => item.start.getTime())));
        maxDate = new Date(Math.max(...items.map(item => item.start.getTime())));
        
        // Add some padding to the timeline (6 months before and after)
        minDate = new Date(minDate.getFullYear(), minDate.getMonth() - 6, 1);
        maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 6, 1);
    } else {
        // Default to a year range around current date if no items
        minDate = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
        maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1);
    }

    // Update the timeline options with the calculated date range
    const options = {
        start: minDate,
        end: maxDate,
        editable: false,
        margin: {
            item: 10
        },
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
            tooltip.innerHTML = `${item.originalDate}<br>${item.content}<br>${item.detail}`;
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
