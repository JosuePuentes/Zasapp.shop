"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { PRODUCTS_BY_STORE_ERP } from "@/lib/api/graphql/queries/erp";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useTranslations } from "next-intl";

export default function ErpProductsScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState("");

  const { data, loading } = useQuery(PRODUCTS_BY_STORE_ERP, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });

  const products = data?.searchProductsByStore ?? [];

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.Products") ?? "Productos (Ficha)"}</h1>
      <p className="text-sm text-gray-500">
        Costo Real = costo usado para precio venta. Moneda BCV = Costo Legal; Calle = Costo de Reposición (ajustado por tasa). Precio venta = Costo Real / (1 - %Utilidad).
      </p>
      <div className="flex gap-2 items-center">
        <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
        <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
      </div>
      <Card>
        <DataTable value={products} loading={loading} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} emptyMessage={t("No data") ?? "Sin datos"}>
          <Column field="_id" header="ID" body={(r) => r._id?.slice(-8)} style={{ maxWidth: "90px" }} />
          <Column field="name" header={t("Name") ?? "Nombre"} />
          <Column field="costPrice" header="Costo Real ($)" body={(r) => (r.costPrice != null ? `$${Number(r.costPrice).toFixed(2)}` : "-")} />
          <Column field="costCurrency" header="Moneda costo" body={(r) => (r.costCurrency === "CALLE" ? "Calle (Reposición)" : "BCV (Legal)")} />
          <Column field="purchaseCurrencyType" header="Tipo costeo" body={(r) => r.purchaseCurrencyType ?? (r.isParallelRate ? "PARALLEL" : "BCV")} />
          <Column field="isParallelRate" header="Tasa paralela" body={(r) => (r.isParallelRate ? "Sí" : "No")} />
          <Column field="rateCalleAtCost" header="Tasa Calle al costear" body={(r) => (r.costCurrency === "CALLE" && r.rateCalleAtCost != null ? r.rateCalleAtCost : "-")} />
          <Column field="price" header="Precio venta ($)" body={(r) => (r.price != null ? `$${Number(r.price).toFixed(2)}` : "-")} />
          <Column field="marginPercent" header="% Utilidad" />
          <Column field="stock" header="Stock" />
        </DataTable>
      </Card>
    </div>
  );
}
