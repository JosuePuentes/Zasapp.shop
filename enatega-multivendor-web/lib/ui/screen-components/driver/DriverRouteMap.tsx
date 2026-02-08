"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import React, { useMemo, useRef, useEffect } from "react";
import { darkMapStyle } from "@/lib/utils/mapStyles/mapStyle";
import { useTheme } from "@/lib/providers/ThemeProvider";
import RestIcon from "@/lib/assets/rest_icon.png";
import HomeIcon from "@/lib/assets/home_icon.png";

export interface RouteStopForMap {
  lat: number;
  lng: number;
  storeName?: string;
  sequence: number;
  items?: { productName?: string; quantity?: number }[];
}

export interface DeliveryPointForMap {
  lat: number;
  lng: number;
  address?: string;
}

export interface DriverRouteMapProps {
  isLoaded: boolean;
  /** Paradas de recolección (tiendas) en orden */
  pickupStops: RouteStopForMap[];
  /** Punto de entrega final (cliente) */
  delivery: DeliveryPointForMap;
  /** Altura del mapa (ej: "400px" o "100vh") */
  height?: string;
  /** Zoom por defecto */
  zoom?: number;
  className?: string;
}

const defaultCenter = { lat: 14.6349, lng: -90.5069 };

function DriverRouteMap({
  isLoaded,
  pickupStops,
  delivery,
  height = "400px",
  zoom = 13,
  className = "",
}: DriverRouteMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { theme } = useTheme();

  const bounds = useMemo(() => {
    const points: { lat: number; lng: number }[] = [
      ...pickupStops.map((s) => ({ lat: s.lat, lng: s.lng })),
      { lat: delivery.lat, lng: delivery.lng },
    ].filter((p) => p.lat !== 0 || p.lng !== 0);
    if (points.length === 0) return null;
    const b = new google.maps.LatLngBounds();
    points.forEach((p) => b.extend(p));
    return b;
  }, [pickupStops, delivery]);

  const center = useMemo(() => {
    if (delivery.lat !== 0 || delivery.lng !== 0) return { lat: delivery.lat, lng: delivery.lng };
    if (pickupStops.length > 0)
      return { lat: pickupStops[0].lat, lng: pickupStops[0].lng };
    return defaultCenter;
  }, [pickupStops, delivery]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !bounds) return;
    mapRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
  }, [isLoaded, bounds]);

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ height }}
      >
        <span className="text-sm text-gray-500">Cargando mapa…</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%", borderRadius: "8px" }}
        center={center}
        zoom={zoom}
        options={{
          styles: theme === "dark" ? darkMapStyle : undefined,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
        onLoad={(map) => {
          mapRef.current = map;
          if (bounds) map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
        }}
      >
        {/* Pines de Recolección (tiendas) */}
        {pickupStops.map(
          (stop, index) =>
            (stop.lat !== 0 || stop.lng !== 0) && (
              <Marker
                key={`pickup-${index}-${stop.sequence}`}
                position={{ lat: stop.lat, lng: stop.lng }}
                icon={{
                  url: RestIcon.src,
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                label={{
                  text: String(stop.sequence),
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                title={`Recolección ${stop.sequence}: ${stop.storeName || "Tienda"}`}
              />
            )
        )}

        {/* Pin de Entrega (cliente) */}
        {(delivery.lat !== 0 || delivery.lng !== 0) && (
          <Marker
            position={{ lat: delivery.lat, lng: delivery.lng }}
            icon={{
              url: HomeIcon.src,
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            title={delivery.address ? `Entrega: ${delivery.address}` : "Entrega"}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export default DriverRouteMap;
