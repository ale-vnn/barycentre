# Barycentre

Find the optimal meeting place that balances travel time for your entire group using the BaryScore algorithm.

## BaryScore System

The BaryScore algorithm ranks locations based on:
- **70% Proximity**: Exponential penalty for longer average travel times
- **30% Fairness**: Coefficient of variation to minimize disparities between participants

Each result shows:
- Overall BaryScore (0-100)
- Individual travel times per participant
- Advantage/penalty notes (e.g., -5min = advantaged, +3min = penalized)

## Local Development

```bash
# Installation
npm install

# Run dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technical Stack

- **Vite**: Fast build tool and dev server
- **Leaflet**: Interactive maps
- **Vanilla JS**: No heavy frameworks, lightweight and fast
- **Grid Routing**: Custom routing system with pre-computed speed data

## Data Sources

### Other Services
- **Nominatim**: Address geocoding (OpenStreetMap)
- **CartoDB**: Map tiles
- **Google Maps / OSRM**: External route viewing links

## License

MIT License - see [LICENSE](LICENSE)
