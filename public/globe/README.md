# AICivSim Globe Visualization

Interactive Three.js globe showing AICivSim data across the world with a timeline (2026–2050) and scenario selector.

## Files

- **globe-static.html** — All data embedded. Works offline. No external API calls.
- **globe-realtime.html** — Fetches live ISS position and site climate data. Requires network.

## Layers

| Layer | Data Source | Description |
|-------|-------------|-------------|
| Critical Minerals | climate.json / embedded | Lithium, Cobalt, Copper, Rare Earths, Nickel (major producing regions) |
| Data Centers | embedded | Major AI/data center hubs (Virginia, Dublin, Frankfurt, Tokyo, etc.) |
| Energy Sources | climate.json / embedded | Grid mix by source (solar, wind, hydro, nuclear, coal, gas) |
| Internet Cables | embedded | Representative submarine cable routes |
| Satellites | **Live** (realtime) / embedded | ISS position from API; Starlink, OneWeb, GPS (static) |
| Sea Level Rise | climate.json / embedded | Scenario-based mm rise 2026–2050 |
| Emissions | embedded | Historical emissions by region |
| Biodiversity | climate.json / embedded | Key ecosystems (Amazon, Coral, Arctic, Boreal, Australia) |

## Running

Serve from the project root so `/data/climate.json` is available:

```bash
npm run dev
```

Then open:
- http://localhost:3000/globe/globe-static.html
- http://localhost:3000/globe/globe-realtime.html

Or open the HTML files directly (static works; realtime needs same-origin or CORS for climate fetch).

## Real-Time Data Sources (globe-realtime.html)

| Source | API | Notes |
|--------|-----|-------|
| ISS position | wheretheiss.at, open-notify.org | Refreshes every 5s when Satellites layer active |
| Climate | /data/climate.json | From site when same-origin |
| Sea level | — | Use scenario projections; NASA/Copernicus APIs need registration |
| Satellites (bulk) | N2YO, CelesTrak | Require API key; ISS is free |

## Extending

To add more real-time sources, extend `DATA_SOURCES` and the fetch/merge logic in `globe-realtime.html`. Wire new layer properties in `renderLayers()`.
