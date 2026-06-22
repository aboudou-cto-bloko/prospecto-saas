"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, type AfricaCity, type AfricaCountry } from "@/lib/africa-cities";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Numeric ISO codes for all African countries (world-atlas uses these as `id`)
const AFRICA_IDS = [
  "012","024","072","108","120","140","148","174","178","180","204","226",
  "231","232","262","266","270","288","324","384","404","426","430","434",
  "450","454","466","478","504","508","516","562","566","624","646","686",
  "694","706","710","716","728","729","732","748","768","788","800","834",
  "854","894",
];

// Map ISO alpha-3 → numeric for our covered countries
const COVERED_NUMERIC: Record<string, string> = {
  BEN: "204", TGO: "768", CIV: "384", SEN: "686", CMR: "120",
  BFA: "854", MLI: "466", NER: "562", GIN: "324", GAB: "266",
  COG: "178", COD: "180", MDG: "450", TCD: "148", MRT: "478",
};

const NUMERIC_TO_ALPHA: Record<string, string> = {};
for (const [alpha, num] of Object.entries(COVERED_NUMERIC)) {
  NUMERIC_TO_ALPHA[num] = alpha;
}

type Props = {
  selectedCountry: AfricaCountry | null;
  selectedCity: AfricaCity | null;
  onSelectCountry: (country: AfricaCountry) => void;
  onSelectCity: (city: AfricaCity, country: AfricaCountry) => void;
};

export function AfricaMap({
  selectedCountry,
  selectedCity,
  onSelectCountry,
  onSelectCity,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const countryByAlpha = useMemo(() => {
    const map = new Map<string, AfricaCountry>();
    for (const c of COUNTRIES) map.set(c.code, c);
    return map;
  }, []);

  const coveredIds = useMemo(() => new Set(Object.values(COVERED_NUMERIC)), []);
  const selectedNumericId = selectedCountry ? COVERED_NUMERIC[selectedCountry.code] : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-[#080810]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [20, 5],
          scale: 350,
        }}
        width={500}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => AFRICA_IDS.includes(geo.id))
              .map((geo) => {
                const numId = geo.id;
                const isCovered = coveredIds.has(numId);
                const isHovered = hoveredId === numId;
                const isSelected = selectedNumericId === numId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      const alpha = NUMERIC_TO_ALPHA[numId];
                      if (alpha) {
                        const c = countryByAlpha.get(alpha);
                        if (c) onSelectCountry(c);
                      }
                    }}
                    onMouseEnter={() => setHoveredId(numId)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      default: {
                        fill: isSelected
                          ? "#5e6ad2"
                          : isCovered
                            ? isHovered ? "#3a3f6e" : "#1e2048"
                            : "#141418",
                        stroke: "#23252a",
                        strokeWidth: 0.5,
                        cursor: isCovered ? "pointer" : "default",
                        transition: "fill 0.2s",
                      },
                      hover: {
                        fill: isCovered
                          ? isSelected ? "#6e7ae0" : "#3a3f6e"
                          : "#1a1a20",
                        stroke: "#23252a",
                        strokeWidth: 0.5,
                        cursor: isCovered ? "pointer" : "default",
                      },
                      pressed: {
                        fill: isCovered ? "#5e6ad2" : "#141418",
                        stroke: "#23252a",
                        strokeWidth: 0.5,
                      },
                    }}
                  />
                );
              })
          }
        </Geographies>

        {/* City dots */}
        <AnimatePresence>
          {selectedCountry?.cities.map((city) => {
            const isActive = selectedCity?.slug === city.slug;
            return (
              <Marker
                key={city.slug}
                coordinates={[city.lng, city.lat]}
                onClick={() => onSelectCity(city, selectedCountry)}
              >
                <motion.circle
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: isActive ? 6 : 4, opacity: 1 }}
                  exit={{ r: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  fill={isActive ? "#5e6ad2" : "#828fff"}
                  stroke="#fff"
                  strokeWidth={isActive ? 2 : 1}
                  style={{ cursor: "pointer" }}
                />
                <motion.text
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: -10 }}
                  exit={{ opacity: 0 }}
                  textAnchor="middle"
                  style={{
                    fill: isActive ? "#f7f8f8" : "#8a8f98",
                    fontSize: isActive ? "11px" : "9px",
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: "Inter, sans-serif",
                    pointerEvents: "none",
                  }}
                >
                  {city.name}
                </motion.text>
              </Marker>
            );
          })}
        </AnimatePresence>

        {/* Hovered country label */}
        {hoveredId && NUMERIC_TO_ALPHA[hoveredId] && !selectedCountry && (
          <Marker coordinates={[
            countryByAlpha.get(NUMERIC_TO_ALPHA[hoveredId])!.lng,
            countryByAlpha.get(NUMERIC_TO_ALPHA[hoveredId])!.lat
          ]}>
            <text
              textAnchor="middle"
              style={{
                fill: "#8a8f98",
                fontSize: "10px",
                fontFamily: "Inter, sans-serif",
                pointerEvents: "none",
              }}
            >
              {countryByAlpha.get(NUMERIC_TO_ALPHA[hoveredId])!.name}
            </text>
          </Marker>
        )}
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 text-[10px] text-ink-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#1e2048]" /> Couvert
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#5e6ad2]" /> Sélectionné
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#828fff]" /> Ville
        </span>
      </div>
    </div>
  );
}
