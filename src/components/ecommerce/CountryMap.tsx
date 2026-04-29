import { useEffect, useRef } from "react";
import jsVectorMap from "jsvectormap";
import "jsvectormap/dist/maps/world.js";
import "jsvectormap/dist/jsvectormap.css";

interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mapRef.current = new jsVectorMap({
      selector: containerRef.current,
      map: "world",
      backgroundColor: "transparent",
      zoomOnScroll: false,
      zoomMax: 12,
      zoomMin: 1,
      zoomAnimate: true,
      zoomStep: 1.5,
      markersSelectable: true,
      markerStyle: {
        initial: {
          fill: "#6F3F97",
          r: 4,
        },
      },
      markers: [
        {
          coords: [37.2580397, -104.657039],
          name: "United States",
          style: {
            fill: "#6F3F97",
            stroke: "#383f47",
            strokeWidth: 1,
          },
        },
        {
          coords: [20.7504374, 73.7276105],
          name: "India",
          style: { fill: "#6F3F97", strokeWidth: 1, stroke: "white" },
        },
        {
          coords: [53.613, -11.6368],
          name: "United Kingdom",
          style: { fill: "#6F3F97", strokeWidth: 1, stroke: "white" },
        },
        {
          coords: [-25.0304388, 115.2092761],
          name: "Sweden",
          style: { fill: "#6F3F97", strokeWidth: 1, stroke: "white" },
        },
      ],
      regionStyle: {
        initial: {
          fill: mapColor || "#D0D5DD",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          fill: "#6f3f97",
          stroke: "none",
          cursor: "pointer",
        },
        selected: {
          fill: "#6F3F97",
        },
        selectedHover: {},
      },
      regionLabelStyle: {
        initial: {
          fill: "#35373e",
          fontFamily: "Outfit",
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
      },
    });

    return () => {
      try {
        mapRef.current?.destroy?.();
      } catch {
        // jsvectormap's EventHandler.flush() has a bug where the same handler
        // registered for multiple events gets its _uid overwritten, so flush
        // reads .selector on an already-deleted registry entry. Swallow it —
        // the container div is unmounted by React, so the SVG is gone anyway.
      }
      if (containerRef.current) containerRef.current.innerHTML = "";
      mapRef.current = null;
    };
  }, [mapColor]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default CountryMap;
