"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { SEARCH_PRODUCTS_COMPARATIVE } from "@/lib/api/graphql/queries/products";
import { REQUEST_BUSINESS_PARTNER } from "@/lib/api/graphql/mutations/b2b";
import useUser from "@/lib/hooks/useUser";
import { useConfig } from "@/lib/context/configuration/configuration.context";
import B2BChatModal from "@/lib/ui/useable-components/b2b-chat-modal";

type ProductRow = {
  _id: string;
  name: string;
  price: number;
  priceWithDiscount?: number | null;
  store: { _id: string; name?: string; publicName?: string; brandColor?: string };
  segment: string;
  allyDiscountPercent?: number | null;
};

function getTipoLabel(segment: string): { label: string; isAlly: boolean } {
  if (segment === "DETAL") return { label: "Detal", isAlly: false };
  if (segment === "MY_ALLIES") return { label: "Mi Aliado", isAlly: true };
  return { label: "Distribuidor Externo", isAlly: false };
}

function getProveedorName(store: { name?: string; publicName?: string }): string {
  return store?.publicName || store?.name || "Tienda";
}

export default function B2BComparativeScreen() {
  const { CURRENCY_SYMBOL } = useConfig();
  const { profile } = useUser();
  const [buyerStoreId, setBuyerStoreId] = useState("");
  const [onlyAllies, setOnlyAllies] = useState(false);
  const [chatPartner, setChatPartner] = useState<{ partnerStoreId: string; partnerName: string } | null>(null);

  const [requestAlliance] = useMutation(REQUEST_BUSINESS_PARTNER, { onError: () => {} });

  const isEmpresa = profile?.clientType === "EMPRESA";

  const openChat = (partnerStoreId: string, partnerName: string) => {
    if (buyerStoreId) requestAlliance({ variables: { storeId: buyerStoreId, partnerStoreId } });
    setChatPartner({ partnerStoreId, partnerName });
  };

  const { data, loading } = useQuery(SEARCH_PRODUCTS_COMPARATIVE, {
    variables: {
      buyerStoreId: buyerStoreId || "none",
      department: undefined,
      onlyAllies,
    },
    skip: !buyerStoreId,
  });

  const products = (data?.searchProductsComparative ?? []) as ProductRow[];

  const groupedByProduct = useMemo(() => {
    const byName = new Map<string, ProductRow[]>();
    for (const p of products) {
      const name = p.name || "Sin nombre";
      if (!byName.has(name)) byName.set(name, []);
      byName.get(name)!.push(p);
    }
    const groups: { productName: string; rows: ProductRow[]; detalPrice: number | null }[] = [];
    byName.forEach((rows, productName) => {
      const detalRow = rows.find((r) => r.segment === "DETAL");
      const detalPrice = detalRow ? (detalRow.priceWithDiscount ?? detalRow.price) : (rows[0] ? (rows[0].priceWithDiscount ?? rows[0].price) : null);
      const sorted = [...rows].sort((a, b) => {
        const aAlly = a.segment === "MY_ALLIES" ? 1 : 0;
        const bAlly = b.segment === "MY_ALLIES" ? 1 : 0;
        if (bAlly !== aAlly) return bAlly - aAlly;
        const priceA = a.priceWithDiscount ?? a.price;
        const priceB = b.priceWithDiscount ?? b.price;
        return priceA - priceB;
      });
      groups.push({ productName, rows: sorted, detalPrice });
    });
    return groups;
  }, [products]);

  if (!isEmpresa) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Comparativa B2B</h1>
        <p className="text-amber-700 dark:text-amber-300">Esta vista es exclusiva para usuarios tipo Empresa. Actualiza tu perfil a Empresa para acceder.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tabla comparativa de precios B2B</h1>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID de mi tienda (comprador)</label>
          <input
            type="text"
            value={buyerStoreId}
            onChange={(e) => setBuyerStoreId(e.target.value)}
            placeholder="Ej. 507f1f77bcf86cd799439011"
            className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={onlyAllies} onChange={(e) => setOnlyAllies(e.target.checked)} className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Solo mis Aliados Comerciales</span>
        </label>
      </div>

      {!buyerStoreId && <p className="text-gray-500 dark:text-gray-400 text-sm">Ingresa el ID de tu tienda para cargar la comparativa.</p>}

      {buyerStoreId && loading && <p className="text-gray-500">Cargando…</p>}

      {buyerStoreId && !loading && groupedByProduct.length === 0 && <p className="text-gray-500">No hay productos para comparar.</p>}

      {buyerStoreId && !loading && groupedByProduct.length > 0 && (
        <div className="space-y-6">
          {groupedByProduct.map(({ productName, rows, detalPrice }) => (
            <div key={productName} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white">{productName}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left p-3">Proveedor</th>
                      <th className="text-left p-3">Tipo</th>
                      <th className="text-right p-3">Precio unitario</th>
                      <th className="text-right p-3">Ahorro</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const unitPrice = row.priceWithDiscount ?? row.price;
                      const savings = detalPrice != null && detalPrice > 0 ? (((detalPrice - unitPrice) / detalPrice) * 100).toFixed(1) : "-";
                      const { label: tipoLabel, isAlly } = getTipoLabel(row.segment);
                      const canAddToCart = row.segment === "DETAL" || row.segment === "MY_ALLIES";
                      const showNegotiate = row.segment === "OTHER_DISTRIBUTORS";
                      return (
                        <tr key={row._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="p-3 font-medium">{getProveedorName(row.store)}</td>
                          <td className="p-3">
                            <span className={isAlly ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                              {tipoLabel}
                              {isAlly && " ✓"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {CURRENCY_SYMBOL}
                            {unitPrice.toFixed(2)}
                            {row.allyDiscountPercent != null && row.allyDiscountPercent > 0 && (
                              <span className="text-xs text-primary-color dark:text-violet-400 ml-1">(-{row.allyDiscountPercent}%)</span>
                            )}
                          </td>
                          <td className="p-3 text-right">{savings === "-" ? "-" : `${savings}%`}</td>
                          <td className="p-3">
                            {canAddToCart && (
                              <button type="button" className="text-primary-color hover:underline text-sm mr-2">
                                Agregar al carrito
                              </button>
                            )}
                            {showNegotiate && (
                              <button
                                type="button"
                                onClick={() => openChat(row.store._id, getProveedorName(row.store))}
                                className="text-amber-600 dark:text-amber-400 hover:underline text-sm"
                              >
                                Negociar / Ver distribuidor
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {chatPartner && buyerStoreId && (
        <B2BChatModal
          buyerStoreId={buyerStoreId}
          partnerStoreId={chatPartner.partnerStoreId}
          partnerName={chatPartner.partnerName}
          onClose={() => setChatPartner(null)}
        />
      )}
    </div>
  );
}
