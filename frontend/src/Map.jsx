import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Maps GeoJSON nation codes (ONS CTRY) to our internal nation IDs.
// Confirm field name against the GeoJSON Builder D drops in /public/uk-nations.geojson.
const NATION_FROM_CODE = {
  E92000001: "ENG",
  S92000003: "SCO",
  W92000004: "WAL",
  N92000002: "NIR",
};

const NATION_LABEL = { ENG: "England", SCO: "Scotland", WAL: "Wales", NIR: "Northern Ireland" };

export function Map({ nation, onSelect }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map(mapDivRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([54.5, -3], 5);

    fetch("/uk-nations.geojson")
      .then((r) => {
        if (!r.ok) throw new Error(`geojson ${r.status}`);
        return r.json();
      })
      .then((data) => {
        layerRef.current = L.geoJSON(data, {
          style: (feat) => styleFor(feat, nation),
          onEachFeature: (feat, layer) => {
            const code = feat.properties.CTRY24CD || feat.properties.CTRY23CD;
            const id = NATION_FROM_CODE[code];
            if (!id) return;
            layer.on("click", () => onSelect(id === nation ? "UK" : id));
            layer.bindTooltip(NATION_LABEL[id], { sticky: true });
          },
        }).addTo(mapRef.current);
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

  return <div ref={mapDivRef} className="map" />;
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
