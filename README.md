# Barycentre

Find the optimal bar that minimizes travel time for your group.

## Features

- Add multiple participants with automatic geocoding
- Calculate personalized routes (car/bike/walk)
- Search for optimal bars by average distance
- Interactive map visualization
- Share sessions via URL
- Bilingual interface (FR/EN)

## Deployment

The application is automatically deployed to GitHub Pages on every push to the `main` branch.

**URL**: `https://ale-vnn.github.io/barycentre/`

## Local Development

```bash
# Installation
npm install

# Run dev server
npm run dev

# Build
npm run build
```

## License

MIT License - see [LICENSE](LICENSE)

## APIs & Services Used

- **Nominatim** (OpenStreetMap): Address geocoding
- **Overpass API** (OpenStreetMap): Bar/pub search
- **OSRM** (Open Source Routing Machine): Route calculation
- **CartoDB**: Base map tiles
- **Leaflet**: JavaScript mapping library
