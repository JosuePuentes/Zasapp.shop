"use client";

import React, { useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { ROUTE_BY_ID } from "@/lib/api/graphql/queries/driver";
import DriverRouteMap, {
  type RouteStopForMap,
  type DeliveryPointForMap,
} from "@/lib/ui/screen-components/driver/DriverRouteMap";
import { GoogleMapsContext } from "@/lib/context/global/google-maps.context";

export default function DriverRoutePage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params?.routeId as string;
  const { isLoaded: mapsLoaded } = useContext(GoogleMapsContext);

  const { data, loading, error } = useQuery(ROUTE_BY_ID, {
    variables: { routeId },
    skip: !routeId,
  });

  const route = data?.route;

  const pickupStops: RouteStopForMap[] = React.useMemo(() => {
    if (!route?.stops?.length) return [];
    return route.stops
      .slice()
      .sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)
      .map((s: { sequence: number; lat: number; lng: number; storeName?: string; items?: unknown[] }) => ({
        lat: s.lat ?? 0,
        lng: s.lng ?? 0,
        storeName: s.storeName,
        sequence: s.sequence,
        items: s.items,
      }));
  }, [route?.stops]);

  const delivery: DeliveryPointForMap = React.useMemo(() => ({
    lat: route?.deliveryLat ?? 0,
    lng: route?.deliveryLng ?? 0,
    address: route?.deliveryAddress,
  }), [route?.deliveryLat, route?.deliveryLng, route?.deliveryAddress]);

  if (loading) {
    return (
      <div className="p-4 min-h-[200px] flex items-center justify-center">
        <span className="text-gray-500">Cargando ruta…</span>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="p-4 min-h-[200px] flex flex-col items-center justify-center gap-2">
        <span className="text-red-500">No se pudo cargar la ruta.</span>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-primary-color underline"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold dark:text-white">Ruta de entrega</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {route.status}
        </span>
      </div>

      <section className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <DriverRouteMap
          isLoaded={Boolean(mapsLoaded)}
          pickupStops={pickupStops}
          delivery={delivery}
          height="320px"
          className="w-full"
        />
      </section>

      {route.totalDeliveryFee != null && route.driverEarnings != null && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tarifa total</span>
            <span className="font-medium">${route.totalDeliveryFee?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-600 dark:text-gray-400">Tu ganancia (92%)</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              ${route.driverEarnings?.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium dark:text-white mb-2">Picking (recolección)</h2>
        <ul className="space-y-3">
          {pickupStops.map((stop) => (
            <li
              key={stop.sequence}
              className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-color text-white flex items-center justify-center text-sm font-medium">
                {stop.sequence}
              </span>
              <div>
                <p className="font-medium dark:text-white">
                  {stop.storeName || `Parada ${stop.sequence}`}
                </p>
                {stop.items?.length ? (
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {stop.items.map((item: { productName?: string; quantity?: number }, i: number) => (
                      <li key={i}>
                        Recoger: {item.productName ?? "Producto"} x{item.quantity ?? 1}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="pt-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong className="dark:text-white">Entrega:</strong> {route.deliveryAddress || "—"}
        </p>
      </div>
    </div>
  );
}
