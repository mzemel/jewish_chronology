let populationData = null;
let dataYears = [];
let eventsData = [];
let maxCountryPop = 0;

export async function loadData() {
  const [popResponse, eventsResponse] = await Promise.all([
    fetch('/populations.json'),
    fetch('/events.json'),
  ]);
  const popRaw = await popResponse.json();
  populationData = popRaw.data;
  dataYears = Object.keys(populationData).map(Number).sort((a, b) => a - b);

  eventsData = await eventsResponse.json();

  // Pre-compute max country population for color scale
  for (const yearData of Object.values(populationData)) {
    for (const [key, value] of Object.entries(yearData)) {
      if (!key.startsWith('_') && typeof value === 'number' && value > maxCountryPop) {
        maxCountryPop = value;
      }
    }
  }
}

export function getEvents() {
  return eventsData;
}

// Get population data for a specific year, interpolating between known data points
export function getPopulationAtYear(year) {
  let lowerYear = dataYears[0];
  let upperYear = dataYears[dataYears.length - 1];

  if (year <= lowerYear) return getYearData(lowerYear);
  if (year >= upperYear) return getYearData(upperYear);

  for (let i = 0; i < dataYears.length - 1; i++) {
    if (dataYears[i] <= year && dataYears[i + 1] >= year) {
      lowerYear = dataYears[i];
      upperYear = dataYears[i + 1];
      break;
    }
  }

  if (lowerYear === year) return getYearData(lowerYear);
  if (upperYear === year) return getYearData(upperYear);

  const t = (year - lowerYear) / (upperYear - lowerYear);
  const lowerData = getYearData(lowerYear);
  const upperData = getYearData(upperYear);

  const allCountries = new Set([...Object.keys(lowerData), ...Object.keys(upperData)]);
  const result = {};

  for (const country of allCountries) {
    const lv = lowerData[country] || 0;
    const uv = upperData[country] || 0;
    const interpolated = Math.round(lv + (uv - lv) * t);
    if (interpolated > 0) {
      result[country] = interpolated;
    }
  }

  return result;
}

function getYearData(year) {
  const raw = populationData[String(year)] || {};
  const result = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key.startsWith('_') && typeof value === 'number') {
      result[key] = value;
    }
  }
  return result;
}

export function getTotalPopulation(year) {
  const data = getPopulationAtYear(year);
  return Object.values(data).reduce((sum, v) => sum + v, 0);
}

export function getEventsNearYear(year, tolerance = 2) {
  return eventsData.filter(e => Math.abs(e.year - year) <= tolerance);
}

export function getMaxCountryPopulation() {
  return maxCountryPop;
}
