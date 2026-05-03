import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ONS CTRY codes for UK nations.
const NATION_FROM_CODE = {
  E92000001: "ENG",
  S92000003: "SCO",
  W92000004: "WAL",
  N92000002: "NIR",
};

const NATION_LABEL = { ENG: "England", SCO: "Scotland", WAL: "Wales", NIR: "Northern Ireland" };

// PCON24CD first letter → nation prefix.
const NATION_PREFIX = { ENG: "E", SCO: "S", WAL: "W", NIR: "N" };

export function Map({ nation, onSelect, onConstituencyClick, selectedConstituencyCode }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  const constituencyLayerRef = useRef(null);
  const constituencyGeoRef = useRef(null);     // cached geojson once fetched
  const constituencyResultsRef = useRef(null); // cached results once fetched
  const sharedTooltipRef = useRef(null);

  const nationRef = useRef(nation);
  useEffect(() => { nationRef.current = nation; }, [nation]);

  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  const onConstituencyClickRef = useRef(onConstituencyClick);
  useEffect(() => { onConstituencyClickRef.current = onConstituencyClick; }, [onConstituencyClick]);

  const selectedCodeRef = useRef(selectedConstituencyCode);
  useEffect(() => { selectedCodeRef.current = selectedConstituencyCode; }, [selectedConstituencyCode]);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map(mapDivRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomSnap: 0.1,
      inertia: true,
    });

    fetch("/uk-nations.geojson")
      .then((r) => {
        if (!r.ok) throw new Error(`geojson ${r.status}`);
        return r.json();
      })
      .then((data) => {
        layerRef.current = L.geoJSON(data, {
          style: (feat) => styleFor(feat, nationRef.current),
          onEachFeature: (feat, layer) => {
            const code = feat.properties.CTRY24CD || feat.properties.CTRY23CD;
            const id = NATION_FROM_CODE[code];
            if (!id || id === "NIR") return;
            layer.on("click", () => onSelectRef.current(id === nationRef.current ? "UK" : id));
            layer.on("mouseover", () => {
              if (id === nationRef.current) return;
              layer.setStyle({ fillOpacity: 0.95, weight: 1.4, color: "#aaa" });
            });
            layer.on("mouseout", () => {
              layer.setStyle(styleFor(layer.feature, nationRef.current));
            });
            layer.bindTooltip(NATION_LABEL[id], { sticky: true });
          },
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(layerRef.current.getBounds(), { padding: [40, 40] });
        mapRef.current.setZoom(mapRef.current.getZoom() - 0.15, { animate: false });
      })
      .catch((err) => {
        console.error("Map: failed to load /uk-nations.geojson —", err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.eachLayer((layer) => {
      layer.setStyle(styleFor(layer.feature, nation));
    });
  }, [nation]);

  useEffect(() => {
    const layer = constituencyLayerRef.current;
    const results = constituencyResultsRef.current;
    if (!layer || !results) return;
    layer.eachLayer((lyr) => {
      lyr.setStyle(constituencyStyle(lyr.feature, results, selectedConstituencyCode));
    });
  }, [selectedConstituencyCode]);

  // Constituency drill-down. Fires when nation changes; tears down or rebuilds
  // the constituency layer to match. NIR has its own greyed-out treatment, so
  // we don't drill into it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    ensureConstituencyPane(map);
    const pane = map.getPane("constituencies");

    // Drill out: fade pane, animate back to UK bounds, then remove the layer.
    if (nation === "UK" || nation === "NIR") {
      if (pane) pane.style.opacity = "0";
      const toRemove = constituencyLayerRef.current;
      constituencyLayerRef.current = null;
      if (toRemove) setTimeout(() => map.removeLayer(toRemove), 720);
      if (layerRef.current) {
        map.flyToBounds(layerRef.current.getBounds(), {
          padding: [40, 40], duration: 1.0, easeLinearity: 0.25,
        });
      }
      return;
    }

    let cancelled = false;
    loadConstituencyData().then(({ geo, results }) => {
      if (cancelled) return;
      if (constituencyLayerRef.current) {
        map.removeLayer(constituencyLayerRef.current);
        constituencyLayerRef.current = null;
      }
      // Start the new layer hidden so the fade-in is visible even when the
      // pane was already opaque (e.g. drilling between adjacent nations).
      pane.style.opacity = "0";

      const prefix = NATION_PREFIX[nation];
      const filtered = {
        type: "FeatureCollection",
        features: geo.features.filter((f) => f.properties.PCON24CD.startsWith(prefix)),
      };
      if (!sharedTooltipRef.current) {
        sharedTooltipRef.current = L.tooltip({ direction: "top", opacity: 0.95, offset: [0, -4] });
      }
      const layer = L.geoJSON(filtered, {
        pane: "constituencies",
        style: (feat) => constituencyStyle(feat, results, selectedCodeRef.current),
        onEachFeature: (feat, lyr) => {
          const code = feat.properties.PCON24CD;
          const name = feat.properties.PCON24NM;
          const r = results[code];
          lyr.on("mouseover", (e) => {
            const partyTxt = r ? `${r.party_name} · ${r.mp}` : "No result on file";
            sharedTooltipRef.current
              .setContent(`<strong>${name}</strong><br/>${partyTxt}`)
              .setLatLng(e.latlng)
              .openOn(map);
            lyr.setStyle({ color: "#fff", weight: 1.4 });
          });
          lyr.on("mousemove", (e) => {
            sharedTooltipRef.current.setLatLng(e.latlng);
          });
          lyr.on("mouseout", () => {
            map.closeTooltip(sharedTooltipRef.current);
            lyr.setStyle(constituencyStyle(feat, results, selectedCodeRef.current));
          });
          lyr.on("click", () => {
            if (!r) return;
            onConstituencyClickRef.current?.({
              code,
              name,
              partyId: r.party_id,
              partyName: r.party_name,
              colour: r.colour,
              mp: r.mp,
              majority: r.majority,
              voteShare: r.vote_share,
            });
          });
        },
      }).addTo(map);
      constituencyLayerRef.current = layer;

      map.flyToBounds(layer.getBounds(), {
        padding: [60, 60], duration: 1.0, easeLinearity: 0.25,
      });
      requestAnimationFrame(() => {
        if (!cancelled) pane.style.opacity = "1";
      });
    }).catch((err) => {
      console.error("Map: failed to load constituency data —", err.message);
    });

    return () => {
      cancelled = true;
    };
  }, [nation]);

  return <div ref={mapDivRef} className="map" />;

  async function loadConstituencyData() {
    if (constituencyGeoRef.current && constituencyResultsRef.current) {
      return { geo: constituencyGeoRef.current, results: constituencyResultsRef.current };
    }
    const [geoR, resR] = await Promise.all([
      fetch("/uk-constituencies.geojson"),
      fetch("/uk-constituency-results.json"),
    ]);
    if (!geoR.ok || !resR.ok) throw new Error(`constituency fetch ${geoR.status}/${resR.status}`);
    const [geo, resJson] = await Promise.all([geoR.json(), resR.json()]);
    constituencyGeoRef.current = geo;
    constituencyResultsRef.current = resJson.results || resJson;
    return { geo, results: constituencyResultsRef.current };
  }
}

function styleFor(feat, selectedNation) {
  const code = feat.properties.CTRY24CD || feat.properties.CTRY23CD;
  const id = NATION_FROM_CODE[code];
  const isNI = id === "NIR";
  const isSelected = id === selectedNation;
  const isOther = selectedNation !== "UK" && !isSelected;

  return {
    fillColor: isNI ? "#1a1a1a" : isSelected ? "#0a1f3a" : "#222",
    fillOpacity: isNI ? 0.4 : isOther ? 0.25 : 0.85,
    color: isSelected ? "#fff" : "#444",
    weight: isSelected ? 2 : 0.8,
  };
}

function constituencyStyle(feat, results, selectedCode) {
  const r = results[feat.properties.PCON24CD];
  const isSelected = !!selectedCode && feat.properties.PCON24CD === selectedCode;
  return {
    fillColor: r?.colour || "#444",
    fillOpacity: r ? (isSelected ? 0.85 : 0.55) : 0.2,
    color: isSelected ? "#fff" : "#8a94a8",
    weight: isSelected ? 2 : 0.6,
  };
}

function ensureConstituencyPane(map) {
  if (map.getPane("constituencies")) return;
  const pane = map.createPane("constituencies");
  pane.style.transition = "opacity 700ms ease";
  pane.style.opacity = "0";
  pane.style.zIndex = 410;
}
