"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { SEARCH_PRODUCTS, SEARCH_PRODUCTS_BY_STORE } from "@/lib/api/graphql/queries/products";
import ProductCardStore from "@/lib/ui/useable-components/product-card-store";
import useUser from "@/lib/hooks/useUser";
import { useConfig } from "@/lib/context/configuration/configuration.context";
import { useUserAddress } from "@/lib/context/address/address.context";
import { useTranslations } from "next-intl";

export default function ProductsMarketplaceScreen() {
  const t = useTranslations();
  const { CURRENCY_SYMBOL } = useConfig();
  const { cartStoreIds } = useUser();
  const { userAddress } = useUserAddress();
  const department = "";
  const [sameStoreFilter, setSameStoreFilter] = useState<string | null>(null);

  const clientLat = userAddress?.location?.coordinates?.[1];
  const clientLng = userAddress?.location?.coordinates?.[0];
  const firstStoreId = cartStoreIds?.[0] || null;

  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_PRODUCTS, {
    variables: {
      department: department || undefined,
      clientLat: clientLat ?? undefined,
      clientLng: clientLng ?? undefined,
      firstStoreId: sameStoreFilter ? null : firstStoreId || undefined,
    },
  });

  const { data: byStoreData, loading: byStoreLoading } = useQuery(SEARCH_PRODUCTS_BY_STORE, {
    variables: { storeId: sameStoreFilter! },
    skip: !sameStoreFilter,
  });

  const products = sameStoreFilter ? (byStoreData?.searchProductsByStore ?? []) : (searchData?.searchProducts ?? []);
  const loading = sameStoreFilter ? byStoreLoading : searchLoading;
  const activeStoreId = sameStoreFilter || firstStoreId;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {t("Marketplace.products") || "Productos"}
      </h1>

      {firstStoreId && !sameStoreFilter && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
            Ver más productos de esta tienda para mantener tu delivery en $1.50
          </p>
          <button
            type="button"
            onClick={() => setSameStoreFilter(firstStoreId)}
            className="text-sm font-semibold text-green-700 dark:text-green-300 underline"
          >
            Ver más productos de esta tienda
          </button>
        </div>
      )}

      {sameStoreFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Filtro: misma tienda
          </span>
          <button
            type="button"
            onClick={() => setSameStoreFilter(null)}
            className="text-sm text-primary-color underline"
          >
            Ver todos
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Cargando…</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No hay productos</div>
        ) : (
          products.map((p: { _id: string; name: string; price: number; store?: { _id: string; publicName?: string; brandColor?: string } }) => (
            <ProductCardStore
              key={p._id}
              product={p}
              currencySymbol={CURRENCY_SYMBOL}
              highlight={activeStoreId === p.store?._id}
            />
          ))
        )}
      </div>
    </div>
  );
}
