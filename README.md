# Barycentre

Find the optimal meeting place that balances travel time for your entire group using the BaryScore algorithm.

## BaryScore System

Each candidate is scored from the estimated travel time of every participant, using their own
transport mode (car, bike, foot):

- **85% Proximity**: linear decay on the group's average travel time (100 at 0 min, 0 from 66 min)
- **15% Fairness**: coefficient of variation of the travel times, to penalise large disparities

Each result shows:
- Overall BaryScore (0-100)
- Individual travel times per participant
- Advantage/penalty notes vs. the group average (e.g. -5min = advantaged, +3min = penalised)

Travel times are **estimates**, not turn-by-turn routing: a pre-computed speed grid is sampled
along the straight line, then corrected by a detour factor. No routing API is called.

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

Static datasets in `public/` are pre-computed offline from OpenStreetMap extracts and committed
to this repository:

- `bars-france.geojson.gz` — bars and pubs in France
- `routing-grid-{car,bike,foot}.json.gz` — average speed per grid cell, with the grid geometry
  carried in `metadata.gridSize` / `metadata.bounds`. The app reads those metadata, so a grid
  regenerated with a different cell size stays correct.

Outside France, or when the static dataset returns nothing, the app falls back to the
**Overpass API**.

### Other Services
- **Nominatim**: Address geocoding (OpenStreetMap)
- **OpenStreetMap tiles**: Basemap, `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Google Maps / OSRM**: External route viewing links

The basemap is plain OSM, neutralised by a CSS filter on `.leaflet-tile-pane`: grayscale in light
mode, inverted in dark mode. One open source serves both themes, with no API key and no extra
dependency, and markers keep their colours because only the tile pane is filtered.

CARTO basemaps were used until their raster tiles started requiring an API key (tiles now come
back stamped "API KEY REQUIRED"). OSM tiles come from donation-funded servers under the
[tile usage policy](https://operations.osmfoundation.org/policies/tiles/): fine for a project at
this scale, but heavy traffic would need a dedicated provider — the open, unlimited option being
OpenFreeMap vector tiles, which requires MapLibre GL (~230 kB gzip) instead of Leaflet rasters.

## Sharing a session

The share button encodes the participants into the URL (`?data=<base64>`). An incoming link is
untrusted input: every participant is rebuilt from validated fields only (numeric coordinates and
id, bounded text, known transport mode), and all rendered values are HTML-escaped.

## License

MIT License - see [LICENSE](LICENSE)
