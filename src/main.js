import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { loadData, getPopulationAtYear, getTotalPopulation, getEventsNearYear, getEvents, getMaxCountryPopulation } from './data.js';
import { getSliderMax, sliderToYear, yearToSlider, formatYear } from './slider.js';

let countryIdToAlpha3 = {};
let alpha3ToName = {};

const colorScale = d3.scaleSequentialLog(d3.interpolateReds)
  .domain([1, 5000000]);

const baseColor = '#1e1e3a';

let currentYear = 1;
let svg, projection, pathGenerator, countriesGroup, tooltip;
let countryFeatures = [];

async function init() {
  // Load data first
  await loadData();

  // Load world topology
  const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  countryFeatures = topojson.feature(world, world.objects.countries).features;

  buildCountryMapping();

  setupMap(countryFeatures);
  setupSlider();
  setupEventMarkers();
  setupModal();
  updateMap(1);
  updateYearDisplay(1);
}

function buildCountryMapping() {
  const mapping = {
    '004': 'AFG', '008': 'ALB', '012': 'DZA', '020': 'AND', '024': 'AGO',
    '031': 'AZE', '032': 'ARG', '036': 'AUS', '040': 'AUT', '050': 'BGD',
    '051': 'ARM', '056': 'BEL', '060': 'BMU', '064': 'BTN', '068': 'BOL',
    '070': 'BIH', '072': 'BWA', '076': 'BRA', '084': 'BLZ', '090': 'SLB',
    '096': 'BRN', '100': 'BGR', '104': 'MMR', '108': 'BDI', '112': 'BLR',
    '116': 'KHM', '120': 'CMR', '124': 'CAN', '140': 'CAF', '144': 'LKA',
    '148': 'TCD', '152': 'CHL', '156': 'CHN', '158': 'TWN', '170': 'COL',
    '174': 'COM', '178': 'COG', '180': 'COD', '188': 'CRI', '191': 'HRV',
    '192': 'CUB', '196': 'CYP', '203': 'CZE', '204': 'BEN', '208': 'DNK',
    '212': 'DMA', '214': 'DOM', '218': 'ECU', '222': 'SLV', '226': 'GNQ',
    '231': 'ETH', '232': 'ERI', '233': 'EST', '234': 'FRO', '238': 'FLK',
    '242': 'FJI', '246': 'FIN', '250': 'FRA', '254': 'GUF', '258': 'PYF',
    '262': 'DJI', '266': 'GAB', '268': 'GEO', '270': 'GMB', '275': 'PSE',
    '276': 'DEU', '288': 'GHA', '296': 'KIR', '300': 'GRC', '304': 'GRL',
    '308': 'GRD', '316': 'GUM', '320': 'GTM', '324': 'GIN', '328': 'GUY',
    '332': 'HTI', '336': 'VAT', '340': 'HND', '344': 'HKG', '348': 'HUN',
    '352': 'ISL', '356': 'IND', '360': 'IDN', '364': 'IRN', '368': 'IRQ',
    '372': 'IRL', '376': 'ISR', '380': 'ITA', '384': 'CIV', '388': 'JAM',
    '392': 'JPN', '398': 'KAZ', '400': 'JOR', '404': 'KEN', '408': 'PRK',
    '410': 'KOR', '414': 'KWT', '417': 'KGZ', '418': 'LAO', '422': 'LBN',
    '426': 'LSO', '428': 'LVA', '430': 'LBR', '434': 'LBY', '438': 'LIE',
    '440': 'LTU', '442': 'LUX', '446': 'MAC', '450': 'MDG', '454': 'MWI',
    '458': 'MYS', '462': 'MDV', '466': 'MLI', '470': 'MLT', '478': 'MRT',
    '480': 'MUS', '484': 'MEX', '492': 'MCO', '496': 'MNG', '498': 'MDA',
    '499': 'MNE', '504': 'MAR', '508': 'MOZ', '512': 'OMN', '516': 'NAM',
    '520': 'NRU', '524': 'NPL', '528': 'NLD', '533': 'ABW', '540': 'NCL',
    '548': 'VUT', '554': 'NZL', '558': 'NIC', '562': 'NER', '566': 'NGA',
    '570': 'NIU', '578': 'NOR', '583': 'FSM', '584': 'MHL', '585': 'PLW',
    '586': 'PAK', '591': 'PAN', '598': 'PNG', '600': 'PRY', '604': 'PER',
    '608': 'PHL', '616': 'POL', '620': 'PRT', '624': 'GNB', '626': 'TLS',
    '630': 'PRI', '634': 'QAT', '642': 'ROU', '643': 'RUS', '646': 'RWA',
    '652': 'BLM', '659': 'KNA', '660': 'AIA', '662': 'LCA', '666': 'SPM',
    '670': 'VCT', '674': 'SMR', '678': 'STP', '682': 'SAU', '686': 'SEN',
    '688': 'SRB', '690': 'SYC', '694': 'SLE', '702': 'SGP', '703': 'SVK',
    '704': 'VNM', '705': 'SVN', '706': 'SOM', '710': 'ZAF', '716': 'ZWE',
    '724': 'ESP', '728': 'SSD', '729': 'SDN', '732': 'ESH', '740': 'SUR',
    '744': 'SJM', '748': 'SWZ', '752': 'SWE', '756': 'CHE', '760': 'SYR',
    '762': 'TJK', '764': 'THA', '768': 'TGO', '772': 'TKL', '776': 'TON',
    '780': 'TTO', '784': 'ARE', '788': 'TUN', '792': 'TUR', '795': 'TKM',
    '798': 'TUV', '800': 'UGA', '804': 'UKR', '807': 'MKD', '818': 'EGY',
    '826': 'GBR', '831': 'GGY', '832': 'JEY', '833': 'IMN', '834': 'TZA',
    '840': 'USA', '850': 'VIR', '854': 'BFA', '858': 'URY', '860': 'UZB',
    '862': 'VEN', '876': 'WLF', '882': 'WSM', '887': 'YEM', '894': 'ZMB',
    '010': 'ATA', '-99': 'XKX'
  };

  for (const feature of countryFeatures) {
    const numericId = String(feature.id);
    const alpha3 = mapping[numericId.padStart(3, '0')] || mapping[numericId];
    if (alpha3) {
      countryIdToAlpha3[feature.id] = alpha3;
      alpha3ToName[alpha3] = feature.properties.name;
    }
  }
}

function setupMap(features) {
  const container = document.getElementById('map-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  svg = d3.select('#map')
    .attr('width', width)
    .attr('height', height);

  projection = d3.geoNaturalEarth1()
    .fitSize([width, height], { type: 'FeatureCollection', features });

  pathGenerator = d3.geoPath().projection(projection);

  countriesGroup = svg.append('g');

  countriesGroup.selectAll('path')
    .data(features)
    .join('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', baseColor)
    .on('mouseover', handleMouseOver)
    .on('mousemove', handleMouseMove)
    .on('mouseout', handleMouseOut)
    .on('click', handleClick);

  tooltip = document.getElementById('tooltip');

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    svg.attr('width', w).attr('height', h);
    projection.fitSize([w, h], { type: 'FeatureCollection', features: countryFeatures });
    countriesGroup.selectAll('path').attr('d', pathGenerator);
  });
}

function setupSlider() {
  const slider = document.getElementById('year-slider');
  slider.max = getSliderMax();
  slider.value = 0;

  slider.addEventListener('input', (e) => {
    const year = sliderToYear(Number(e.target.value));
    currentYear = year;
    updateMap(year);
    updateYearDisplay(year);
    updateEventDisplay(year);
  });
}

function setupEventMarkers() {
  const container = document.getElementById('event-markers');
  const sliderMax = getSliderMax();
  const events = getEvents();

  events.forEach(event => {
    const sliderPos = yearToSlider(event.year);
    const pct = (sliderPos / sliderMax) * 100;

    const marker = document.createElement('div');
    marker.className = `event-marker ${event.impact}`;
    marker.style.left = `${pct}%`;

    const line = document.createElement('div');
    line.className = 'marker-line';

    const tip = document.createElement('div');
    tip.className = 'marker-tooltip';
    tip.textContent = `${event.year} — ${event.title}`;

    marker.appendChild(line);
    marker.appendChild(tip);

    marker.addEventListener('click', () => {
      const slider = document.getElementById('year-slider');
      slider.value = sliderPos;
      currentYear = event.year;
      updateMap(event.year);
      updateYearDisplay(event.year);
      updateEventDisplay(event.year);
    });

    container.appendChild(marker);
  });
}

function updateMap(year) {
  const data = getPopulationAtYear(year);
  const maxPop = getMaxCountryPopulation();

  colorScale.domain([100, maxPop]);

  countriesGroup.selectAll('path')
    .attr('fill', d => {
      const alpha3 = countryIdToAlpha3[d.id];
      if (!alpha3) return baseColor;
      const pop = data[alpha3];
      if (!pop || pop < 10) return baseColor;
      return colorScale(pop);
    })
    .classed('has-data', d => {
      const alpha3 = countryIdToAlpha3[d.id];
      return alpha3 && (data[alpha3] || 0) > 0;
    });
}

function updateYearDisplay(year) {
  document.getElementById('current-year').textContent = formatYear(year);
  const total = getTotalPopulation(year);
  document.getElementById('total-population').textContent =
    `World Jewish population: ~${formatPopulation(total)}`;
}

function updateEventDisplay(year) {
  const display = document.getElementById('event-display');
  const nearbyEvents = getEventsNearYear(year, 3);

  if (nearbyEvents.length === 0) {
    display.classList.remove('visible');
    return;
  }

  const event = nearbyEvents[0];
  display.classList.add('visible');
  display.innerHTML = `
    <div class="event-title">${event.year} CE — ${event.title}</div>
    <div class="event-description">${event.description}</div>
  `;
}

function handleMouseOver(event, d) {
  const alpha3 = countryIdToAlpha3[d.id];
  if (!alpha3) return;

  const data = getPopulationAtYear(currentYear);
  const pop = data[alpha3];
  if (!pop || pop < 10) return;

  const countryName = alpha3ToName[alpha3] || d.properties.name || 'Unknown';

  tooltip.innerHTML = `
    <div class="country-name">${countryName}</div>
    <div class="population">Jewish population: ~${formatPopulation(pop)}</div>
  `;
  tooltip.classList.add('visible');
}

function handleMouseMove(event) {
  const container = document.getElementById('map-container');
  const rect = container.getBoundingClientRect();
  tooltip.style.left = (event.clientX - rect.left + 15) + 'px';
  tooltip.style.top = (event.clientY - rect.top - 10) + 'px';
}

function handleMouseOut() {
  tooltip.classList.remove('visible');
}

function handleClick(event, d) {
  // Placeholder for drill-down modal
}

function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = overlay.querySelector('.modal-close');

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });
}

function formatPopulation(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

init();
