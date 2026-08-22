# Kasatria Software Developer Internship Assignment — 3D Data Visualization

A 3D interactive data visualization web application developed as part of the Kasatria Software Developer Internship Assignment.

The application visualizes a dataset of people using an interactive Three.js interface. Users can explore the data through multiple 3D layouts, filter the dataset, and open individual profiles for more detailed information.

## Live Project

GitHub Repository:

https://github.com/mohammedaraljabri206/kasatria-3d-data-visualization

## Features

- Interactive 3D data visualization using Three.js
- Four visualization layouts:
  - Table
  - Sphere
  - Double Helix
  - Grid
- Interactive camera controls using OrbitControls
- Search by name
- Filter by country
- Filter by interest
- Filter by net worth
- Clear all filters
- Individual profile view for each person
- Profile information including:
  - Name
  - Age
  - Country
  - Interest
  - Net Worth
- Visual card colour coding based on net worth
- Google Sign-In integration
- Responsive user interface
- CSV data processing using PapaParse
- Data loaded from a published Google Sheets CSV source

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES Modules)
- Three.js
- PapaParse
- Vite
- Google Sheets
- Google Identity Services

## Project Structure

```text
kasatria-3d-data-visualization/
│
├── index.html
├── package.json
├── package-lock.json
│
├── public/
│   ├── data.csv
│   ├── icons.svg
│   └── favicon.svg
│
└── src/
    ├── main.js
    └── style.css
