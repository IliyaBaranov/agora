import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, MapContainerProps } from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "@/context/LanguageContext";
import { Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// фиксим стандартные иконки leaflet (иначе не отображаются в React)
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPlaceholderProps {
  city: string;
  lat?: number;
  lng?: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

// компонент, который ловит клики по карте
function ClickHandler({
  onSelect,
}: {
  onSelect?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapPlaceholder({
  city,
  lat,
  lng,
  onLocationChange,
}: MapPlaceholderProps) {
  const { t } = useLanguage();

  // дефолтный центр — Таллин
  const [center, setCenter] = useState<[number, number]>([
    lat ?? 59.437,
    lng ?? 24.7536,
  ]);

  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );

  // получаем координаты города через OSM Nominatim
  useEffect(() => {
    if (!city) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      city
    )}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data?.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCenter([lat, lon]);
        }
      })
      .catch(() => {});
  }, [city]);

  const handleSelect = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    onLocationChange?.(lat, lng);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/50">
      {/* MAP */}
      <div className="h-64 w-full">
          <MapContainer
            {...({
              center,
              zoom: 12,
              scrollWheelZoom: true,
              style: { height: "100%", width: "100%" },
            } as any)}
          >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            {...{
              attribution: "© OpenStreetMap contributors",
            }}
          />

          <ClickHandler onSelect={handleSelect} />

          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>

      {/* INFO */}
      <div className="border-t border-border bg-background p-3 text-xs text-muted-foreground">
        {markerPos ? (
          <div className="space-y-1">
            {/* Место */}
            <p className="font-medium text-foreground flex items-center gap-1">
              📍 {t("map.title")} {city}
            </p>

            {/* Время выбора */}
            <p className="text-muted-foreground">
              ⏱️ Время: <strong>{new Date().toLocaleTimeString()}</strong>
            </p>

            {/* Координаты */}
            <p>
              Координаты:
              <strong>
                {" "}
                lat: {markerPos[0].toFixed(6)}, lng: {markerPos[1].toFixed(6)}
              </strong>
            </p>
          </div>
        ) : (
          <p>🖱️ Кликните по карте, чтобы выбрать точку адреса.</p>
        )}
      </div>
    </div>
  );
}
