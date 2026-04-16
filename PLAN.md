# Jewish Chronology — Interactive Diaspora Map

## Overview

A static website displaying a world map with a heatmap overlay of Jewish populations over time (0 AD – 2026 AD). A slider at the bottom controls the year. The map uses modern country borders throughout; only the heatmap changes. Deployed on **Cloudflare Pages**.

## Core Features

### 1. World Map with Heatmap
- Modern country borders (static, unchanging)
- Choropleth heatmap: transparent (low population) → red (high population)
- Population counts displayed (not percentages, for now)
- Smooth interpolation between known data points

### 2. Country Drill-Down
- Clicking a country opens a modal overlay with a zoomed-in map of that country
- Modal shows sub-country granularity (regions/cities) where data is available
- Same heatmap UX inside the modal, synced to the current slider year
- **Only indicate a country is clickable (e.g., cursor, highlight) when sufficient sub-country data exists for the current slider year** — degrade gracefully when city-level data isn't available
- Richest data: Europe 1750–1950 (IIJG dataset covers 827 communities)

### 3. Timeline Slider
- **Logarithmic scale**: century/decade steps for early periods, yearly steps for modern era
  - 0–1000 AD: ~century steps
  - 1000–1500 AD: ~50-year steps
  - 1500–1800 AD: ~decade steps
  - 1800–2026 AD: yearly steps
- Annotated with key historical events (clickable icons/tooltips that jump to that year)
- Smooth scrubbing with interpolated data

### 4. Event Annotations
Key events marked on the slider (non-exhaustive, to be expanded):
- 70 AD — Destruction of the Second Temple; beginning of the diaspora
- 135 AD — Bar Kokhba revolt; Jews expelled from Jerusalem
- 632 AD — Rise of Islam; Jewish communities under Islamic rule
- 1096 — First Crusade pogroms (Rhineland massacres)
- 1290 — Expulsion from England
- 1306 — Expulsion from France
- 1348–1351 — Black Death persecutions
- 1492 — Expulsion from Spain (Alhambra Decree)
- 1497 — Expulsion from Portugal
- 1648–1649 — Khmelnytsky massacres
- 1772–1795 — Partitions of Poland; Pale of Settlement established
- 1881–1884 — First wave of Russian pogroms
- 1894 — Dreyfus Affair
- 1903–1906 — Second wave of Russian pogroms (Kishinev, etc.)
- 1917 — Balfour Declaration
- 1933 — Hitler comes to power; beginning of Nazi persecution
- 1938 — Kristallnacht
- 1939–1945 — The Holocaust
- 1948 — Establishment of Israel; mass immigration (aliyah)
- 1950s–1970s — Expulsion/exodus from Arab countries (Mizrahi migration)
- 1989–1991 — Soviet Jewish emigration

---

## Data Sources

### Primary
1. **DellaPergola's World Jewish Population Estimates**
   - Published annually in the American Jewish Year Book
   - Archived at [Berman Jewish DataBank](https://www.jewishdatabank.org/)
   - Latest: [World Jewish Population, 2024 (PDF)](https://www.cbs.gov.il/he/Documents/World%20DellaPergola%202024%20complete.pdf)
   - Long-run historical: ["Some Fundamentals of Jewish Demographic History" (PDF)](https://www.bjpa.org/content/upload/bjpa/dell/DellaPergola%20Some%20Fundamentals.pdf)

2. **Wikipedia — Historical Jewish Population by Country**
   - [Article](https://en.wikipedia.org/wiki/Historical_Jewish_population_by_country)
   - Tabular data aggregated from DellaPergola and others
   - Most immediately usable structured source for the baseline dataset

3. **IIJG Digital Maps (1750–1950)**
   - [Maps portal](https://iijg.org/tools-and-technologies/maps-of-jewish-communities/)
   - 827 communities across 6 time frames (1750, 1800, 1850, 1900, 1930, 1950)
   - City-level granularity for Europe — powers the drill-down modal

### Secondary
4. **Statista — Historical Jewish Population by Region (1170–1995)**
   - [Link](https://www.statista.com/statistics/1357607/historical-jewish-population/)
   - Regional breakdown for medieval/early-modern periods

5. **JewishGen Communities Database**
   - [Databases](https://www.jewishgen.org/databases/)
   - Geocoded lat/long for thousands of communities
   - Useful for historical-region → modern-country mapping

---

## Data Pipeline

### Step 1: Compile Raw Data
- Extract population tables from Wikipedia and DellaPergola PDFs
- Structure as JSON: `{ year, region_or_country, population }`
- For city-level data (IIJG), structure as: `{ year, city, lat, lng, population }`

### Step 2: Historical Region → Modern Country Mapping
Create a translation table mapping historical entities to modern countries with proportional weights:

| Historical Region | Modern Countries (approximate weights) |
|---|---|
| Roman Judea / Palestine | Israel (0.7), Palestine (0.2), Jordan (0.1) |
| Babylonia / Mesopotamia | Iraq (0.9), Syria (0.1) |
| Iberian Peninsula (pre-1492) | Spain (0.6), Portugal (0.4) |
| Polish-Lithuanian Commonwealth | Poland (0.5), Lithuania (0.15), Belarus (0.15), Ukraine (0.2) |
| Prussia | Germany (0.7), Poland (0.2), Russia (0.1) |
| Pale of Settlement | Russia (0.3), Ukraine (0.3), Poland (0.2), Belarus (0.1), Lithuania (0.1) |
| Ottoman Empire | Turkey (0.3), Greece (0.15), Bulgaria (0.1), Romania (0.1), Iraq (0.1), Syria (0.1), Israel/Palestine (0.15) |
| Austria-Hungary | Austria (0.3), Hungary (0.3), Czech Republic (0.15), Slovakia (0.1), parts of Poland/Ukraine/Romania (0.15) |

*These weights are rough starting points and should be refined with actual sub-regional data where available.*

### Step 3: Interpolation
- Linear interpolation between known data points for smooth slider behavior
- Flag interpolated vs. measured data (optional future feature)

### Step 4: Output
- Static JSON files bundled with the site
- One file per "layer": country-level data, city-level data, events

---

## Tech Stack

| Component | Choice | Rationale |
|---|---|---|
| Visualization | **d3.js** (d3-geo) | Choropleth maps, color scales, transitions, tooltips — all native. No tile server dependency. User has prior d3 experience ([thebackend.dev/monarchs](https://thebackend.dev/monarchs)) |
| Country borders | **GeoJSON** (Natural Earth Data) | Modern political boundaries, rendered via d3-geo projection |
| Heatmap rendering | **d3 color scales** (country level) + **d3 circles/regions** (city level in modals) | Same library for both views |
| Slider | Custom HTML/CSS/JS or **noUiSlider** | Stepped scale support, event annotation |
| Modal | Custom lightweight modal | No framework dependency |
| Framework | **Vanilla JS** | Minimal bundle, no framework overhead for a single-page visualization |
| Build tool | **Vite** | Fast builds, good static site support |
| Hosting | **Cloudflare Pages** | Free, git-integrated deployment. Custom domain: `jews.thebackend.dev` (CNAME via Cloudflare dashboard — no terraform needed) |

---

## Implementation Phases

### Phase 1: Data Compilation
- [ ] Extract DellaPergola long-run estimates (0 AD – 2024)
- [ ] Scrape/extract Wikipedia country-level tables
- [ ] Build historical-region → modern-country mapping
- [ ] Create master JSON dataset (country-level, by year)
- [ ] Extract IIJG city-level data for drill-down modals

### Phase 2: Core Map
- [ ] Set up Vite project with Leaflet
- [ ] Render world map with modern country borders (GeoJSON)
- [ ] Implement choropleth heatmap layer
- [ ] Wire up basic linear slider (0–2026)

### Phase 3: Slider UX
- [ ] Implement logarithmic scale
- [ ] Add event annotations (icons/tooltips)
- [ ] Click-to-jump for annotated events
- [ ] Smooth interpolation on scrub

### Phase 4: Drill-Down Modals
- [ ] Country click handler → modal with zoomed map
- [ ] City/region-level heatmap inside modal
- [ ] Sync modal year with main slider

### Phase 5: Polish & Deploy
- [ ] Responsive design (mobile-friendly)
- [ ] Loading states, error handling
- [ ] Data source attribution / "About" section
- [ ] Deploy to Cloudflare Pages
- [ ] Uncertainty annotations for early-period data

---

## Future Ideas (backlog)
- Percentage of total population toggle
- Migration flow arrows (animated paths showing movement)
- Narrative mode (auto-play through key events with text commentary)
- Search by community name
- Embed/share specific year views via URL hash
