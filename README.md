# The Jewish Diaspora — A Population History

An interactive world map visualizing Jewish population distribution from 1 CE to 2020 CE. Move the timeline slider to see how Jewish communities shifted across the globe in response to expulsions, pogroms, emancipation, the Holocaust, the founding of Israel, and other pivotal events.

Live at [jews.thebackend.dev](https://jews.thebackend.dev)

## Primary Sources

Population estimates are drawn from the following scholarly and institutional sources:

- **Sergio DellaPergola**, "World Jewish Population" — published annually in the *American Jewish Year Book*, archived at the [Berman Jewish DataBank](https://www.jewishdatabank.org/). DellaPergola is the leading demographer of world Jewry; his estimates form the backbone of our modern-era data (1800–2020).
- **Sergio DellaPergola**, ["Some Fundamentals of Jewish Demographic History"](https://www.bjpa.org/content/upload/bjpa/dell/DellaPergola%20Some%20Fundamentals.pdf) (2003) — provides long-run population estimates from antiquity through the modern period, including regional breakdowns.
- **Wikipedia**, ["Historical Jewish population comparisons"](https://en.wikipedia.org/wiki/Historical_Jewish_population) and ["Historical Jewish population by country"](https://en.wikipedia.org/wiki/Historical_Jewish_population_by_country) — aggregated tabular data sourced from DellaPergola, the *Jewish Encyclopedia* (1901–1906), and other reference works.
- **International Institute for Jewish Genealogy (IIJG)**, [Digital Maps of Jewish Populations in Europe, 1750–1950](https://iijg.org/tools-and-technologies/maps-of-jewish-communities/) — city-level population data for 827 European communities across six time frames, based on the research of Laurence Leitenberg.

## Methodology

### Time coverage

The dataset includes 20 reference years between 1 CE and 2020 CE, with denser coverage in modern periods where data is more reliable. The slider interpolates linearly between known data points.

### Historical regions to modern borders

All population data is mapped onto modern country boundaries (ISO 3166-1 alpha-3 codes) so the map shows a consistent geography. For historical political entities that no longer exist, populations were distributed across modern successor states using proportional weights based on scholarly estimates of where Jewish communities were concentrated. Examples:

| Historical Entity | Modern Countries |
|---|---|
| Roman Judea / Palestine | Israel, Palestine, Jordan |
| Babylonia / Mesopotamia | Iraq, Syria, Iran |
| Polish-Lithuanian Commonwealth | Poland, Lithuania, Belarus, Ukraine |
| Pale of Settlement | Russia, Ukraine, Poland, Belarus, Lithuania |
| Ottoman Empire | Turkey, Greece, Bulgaria, Iraq, Syria, Israel |
| Austria-Hungary | Austria, Hungary, Czech Republic, Slovakia |

These weights are approximate and represent educated guesses informed by the sources above. They are a starting point for refinement.

### Uncertainty

Estimates for the ancient and medieval periods (before ~1700) are rough approximations based on limited literary, archaeological, and rabbinical sources. Scholars disagree significantly on totals for these periods — for example, estimates of the 1st-century Jewish population range from 2.5 million to 8 million depending on the source. We generally follow DellaPergola's more conservative estimates.

Modern data (post-1800) is substantially more reliable, drawing on national censuses, community records, and systematic demographic surveys.

### Event annotations

The timeline is annotated with 37 key historical events — expulsions, pogroms, migrations, and political milestones — with descriptions summarized from standard historical references.

## Tech Stack

- **d3.js** (d3-geo) for map rendering and choropleth visualization
- **Natural Earth** country boundaries via [world-atlas](https://github.com/topojson/world-atlas)
- **Vite** for build tooling
- **Cloudflare Pages** for hosting

## Development

```bash
npm install
npm run dev
```

## License

Data is derived from publicly available scholarly sources cited above. Code is MIT licensed.
