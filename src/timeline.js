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
        const [date, description, type, event] = row.split(',');
        let uniqueId = date;

        // Ensure the id is unique by appending a counter if necessary
        while (uniqueItems.has(uniqueId)) {
            uniqueId = `${date}-${index}`;
        }

        uniqueItems.set(uniqueId, { id: uniqueId, start: date, content: event, detail: description });
    });

    return Array.from(uniqueItems.values());
}

// Initialize the timeline
async function initializeTimeline() {
    const container = document.getElementById('timeline');
    const items = await fetchCSVData();

    const dataSet = new DataSet(items);
    // Update the timeline options to center on today's date and adjust the timeline scale to cover the first and next 6 months
    const options = {
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1), // Start 6 months before today
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1),   // End 6 months after today
        editable: false,
        margin: {
            item: 10
        },
        center: new Date() // Center the timeline on today's date
    };

    const timeline = new Timeline(container, dataSet, options);

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
            tooltip.innerHTML = `${item.start}<br>${item.detail}`; // Updated to show "Date" and "Description"
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

// Call the initialization function
initializeTimeline();