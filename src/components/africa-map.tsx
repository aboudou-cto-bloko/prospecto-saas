"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, COVERED_COUNTRY_CODES, type AfricaCity, type AfricaCountry } from "@/lib/africa-cities";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const AFRICA_CODES = [
  "DZA","AGO","BEN","BWA","BFA","BDI","CMR","CPV","CAF","TCD","COM",
  "COG","COD","CIV","DJI","EGY","GNQ","ERI","SWZ","ETH","GAB","GMB",
  "GHA","GIN","GNB","KEN","LSO","LBR","LBY","MDG","MWI","MLI","MRT",
  "MUS","MAR","MOZ","NAM","NER","NGA","RWA","STP","SEN","SYC","SLE",
  "SOM","ZAF","SSD","SDN","TZA","TGO","TUN","UGA","ZMB","ZWE",
];

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
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const countryByCode = useMemo(() => {
    const map = new Map<string, AfricaCountry>();
    for (const c of COUNTRIES) map.set(c.code, c);
    return map;
  }, []);

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
              .filter((geo) => AFRICA_CODES.includes(String(geo.properties.ISO_A3 ?? geo.id)))
              .map((geo) => {
                const code = (geo.properties.ISO_A3 ?? geo.id) as string;
                const isCovered = COVERED_COUNTRY_CODES.includes(code);
                const isHovered = hoveredCountry === code;
                const isSelected = selectedCountry?.code === code;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      const c = countryByCode.get(code);
                      if (c) onSelectCountry(c);
                    }}
                    onMouseEnter={() => setHoveredCountry(code)}
                    onMouseLeave={() => setHoveredCountry(null)}
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

        {/* Glow on hovered covered country */}
        {hoveredCountry && countryByCode.has(hoveredCountry) && !selectedCountry && (
          <Marker coordinates={[
            countryByCode.get(hoveredCountry)!.lng,
            countryByCode.get(hoveredCountry)!.lat
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
              {countryByCode.get(hoveredCountry)!.name}
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
