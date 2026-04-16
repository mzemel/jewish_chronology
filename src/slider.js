// Stepped slider: maps a linear 0-1000 range to non-linear years
// Denser steps for modern era, sparser for ancient history

const YEAR_STEPS = [
  // Ancient: century steps (1-1000)
  1, 70, 135, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  // Medieval: ~50-year steps (1000-1500)
  1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500,
  // Early modern: ~25-year steps (1500-1800)
  1525, 1550, 1575, 1600, 1625, 1650, 1675, 1700, 1725, 1750, 1775, 1800,
  // 19th century: ~decade steps
  1810, 1820, 1830, 1840, 1850, 1860, 1870, 1880, 1890, 1900,
  // 20th century: ~5-year steps
  1905, 1910, 1914, 1918, 1920, 1925, 1930, 1933, 1935, 1938, 1939,
  1940, 1941, 1942, 1943, 1944, 1945, 1946, 1948,
  1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995,
  2000, 2005, 2010, 2015, 2020
];

export function getSliderMax() {
  return YEAR_STEPS.length - 1;
}

export function sliderToYear(sliderValue) {
  const idx = Math.round(sliderValue);
  return YEAR_STEPS[Math.min(idx, YEAR_STEPS.length - 1)];
}

export function yearToSlider(year) {
  // Find the closest step
  let closest = 0;
  let minDist = Infinity;
  for (let i = 0; i < YEAR_STEPS.length; i++) {
    const dist = Math.abs(YEAR_STEPS[i] - year);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }
  return closest;
}

export function formatYear(year) {
  if (year <= 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

export function getYearSteps() {
  return YEAR_STEPS;
}
