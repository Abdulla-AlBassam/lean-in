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

export function Map({ nation, onSelect }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  // The click handler binds once; this ref keeps the latest selection
  // visible to it without rebinding listeners on every re-render.
  const nationRef = useRef(nation);
  useEffect(() => { nationRef.current = nation; }, [nation]);

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
      zoomSnap: 0.1,
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
            layer.on("click", () => onSelect(id === nationRef.current ? "UK" : id));
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
