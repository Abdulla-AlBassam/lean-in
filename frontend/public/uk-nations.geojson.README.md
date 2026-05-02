# uk-nations.geojson — Builder D's deliverable

The Map.jsx component fetches `/uk-nations.geojson` at boot. This file must be a GeoJSON FeatureCollection of the four UK countries (England, Scotland, Wales, Northern Ireland), each with a `properties.CTRY24CD` (or `CTRY23CD`) field.

## Recommended source

ONS Geoportal: Countries (December 2023) UK BUC, GeoJSON.
URL: https://geoportal.statistics.gov.uk/datasets/ons::countries-december-2023-boundaries-uk-buc-2/about

Or the pre-packaged equivalent:
https://github.com/martinjc/UK-GeoJSON/blob/master/json/administrative/gb/topo_ctry.json
(this is TopoJSON; convert to GeoJSON with `topojson-client` or use the .geojson sibling).

Save as `frontend/public/uk-nations.geojson`.

## Verify the field name

Open the file and check `properties.CTRY24CD` exists with values:
- E92000001 = England
- S92000003 = Scotland
- W92000004 = Wales
- N92000002 = Northern Ireland

If the field is named differently (e.g. `CTRY23CD`, `ctry_code`), Map.jsx already falls back to CTRY23CD; otherwise edit the NATION_FROM_CODE map in src/Map.jsx.
