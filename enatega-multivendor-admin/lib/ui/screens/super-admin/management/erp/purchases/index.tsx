"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { PURCHASES_BY_STORE, SUPPLIERS_BY_STORE, LATEST_RATES } from "@/lib/api/graphql/queries/erp";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useTranslations } from "next-intl";

export default function ErpPurchasesScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState("");

  const { data: purchasesData, loading } = useQuery(PURCHASES_BY_STORE, {
    variables: { storeId: storeId || "none", limit: 50 },
    skip: !storeId,
  });
  const { data: suppliersData } = useQuery(SUPPLIERS_BY_STORE, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });
  const { data: ratesData } = useQuery(LATEST_RATES, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });

  const purchases = purchasesData?.purchasesByStore ?? [];
  const suppliers = suppliersData?.suppliersByStore ?? [];
  const latestRates = ratesData?.latestRates;

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.Purchases") ?? "Compras"}</h1>
      <p className="text-sm text-gray-500">
        Al registrar una compra, elige Moneda de Pago: BCV (costo real = costo factura) o Calle (costo real = costo factura × Tasa Calle / Tasa BCV). Configure las tasas en Configuración de Moneda.
      </p>
      <div className="flex gap-2 items-center flex-wrap">
        <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
        <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
      </div>
      {latestRates && (
        <Card title="Tasas vigentes para esta tienda" className="mb-2">
          <span className="mr-4">BCV: <strong>{latestRates.rateBcv}</strong></span>
          <span className="mr-4">Calle: <strong>{latestRates.rateCalle}</strong></span>
          <span className="text-amber-600">Diferencial: {latestRates.differentialPercent}%</span>
        </Card>
      )}
      <Card>
        <DataTable value={purchases} loading={loading} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} emptyMessage={t("No data") ?? "Sin datos"}>
          <Column field="_id" header="ID" body={(r) => r._id?.slice(-8)} style={{ maxWidth: "90px" }} />
          <Column field="supplier.companyName" header={t("ERP.Supplier") ?? "Proveedor"} />
          <Column field="total" header="Total" body={(r) => `$${Number(r.total).toFixed(2)}`} />
          <Column field="paymentCurrency" header="Moneda pago" body={(r) => r.paymentCurrency ?? "BCV"} />
          <Column field="purchaseDate" header="Fecha" body={(r) => r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString() : "-"} />
          <Column field="notes" header="Notas" />
        </DataTable>
      </Card>
      <p className="text-sm text-gray-500">
        Para crear una compra con selector de moneda (BCV/Calle), use la API GraphQL <code>createPurchase</code> con <code>paymentCurrency</code>. Aquí se listan las compras existentes.
      </p>
    </div>
  );
}
