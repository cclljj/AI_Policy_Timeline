# AS-ITS Service Timeline

This project visualizes a timeline of events using the [vis-timeline](https://visjs.github.io/vis-timeline/) library. The timeline is populated with data from a CSV file and styled with custom CSS.

## Project Structure

```
index.html
src/
    timeline.js
style/
    timeline.css
data/
    events.csv
```

- **index.html**: The main HTML file that includes the timeline container and links to the necessary scripts and styles.
- **src/timeline.js**: Contains the JavaScript logic for loading data and rendering the timeline.
- **style/timeline.css**: Custom CSS for styling the timeline.
- **data/events.csv**: A CSV file containing the event data for the timeline.

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Open `index.html` in a web browser to view the timeline.

## Dependencies

- [vis-timeline](https://visjs.github.io/vis-timeline/): A library for creating interactive timelines.

## Usage

1. Add your event data to `data/events.csv` in the following format:
   ```csv
   id,start,end,content
   1,2025-04-01,2025-04-02,Event 1
   2,2025-04-03,2025-04-04,Event 2
   ```

2. Customize the timeline appearance by editing `style/timeline.css`.

3. Modify the timeline logic in `src/timeline.js` if needed.

## License

This project is licensed under the MIT License.