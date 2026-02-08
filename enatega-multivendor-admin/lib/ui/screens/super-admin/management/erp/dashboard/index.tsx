"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { DASHBOARD_SALES, INVENTORY_BY_COSTEO } from "@/lib/api/graphql/queries/erp";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useTranslations } from "next-intl";

const DEFAULT_STORE_ID = "";

export default function ErpDashboardScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState(DEFAULT_STORE_ID);
  const [from] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to] = useState(() => new Date().toISOString().slice(0, 10));

  const { data } = useQuery(DASHBOARD_SALES, {
    variables: { storeId, from, to },
    skip: !storeId,
  });
  const { data: costeoData } = useQuery(INVENTORY_BY_COSTEO, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });

  const dashboard = data?.dashboardSales;
  const inventoryByCosteo = costeoData?.inventoryByCosteo;
  const chartData = dashboard
    ? {
        labels: [t("Ventas Zas (Online)") ?? "Ventas Zas (Online)", t("Gastos") ?? "Gastos", t("Cuentas pagadas") ?? "Cuentas pagadas", t("Neto") ?? "Neto"],
        datasets: [
          {
            data: [dashboard.totalOnline, dashboard.expenses, dashboard.accountsPaid, dashboard.net],
            backgroundColor: ["#22c55e", "#ef4444", "#f97316", "#3b82f6"],
            hoverBackgroundColor: ["#16a34a", "#dc2626", "#ea580c", "#2563eb"],
          },
        ],
      }
    : null;

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.Dashboard") ?? "Dashboard Finanzas (ERP)"}</h1>
      <div className="flex gap-2 items-center">
        <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
        <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
      </div>
      <p className="text-sm text-gray-500">
        {t("ERP.StoreIdHint") ?? "Ventas Online = Zas!, Gastos y Cuentas pagadas discriminados. Inventario por tipo de costeo: BCV vs Tasa Calle (protegida)."}
      </p>
      {inventoryByCosteo && (
        <Card title="Inventario por tipo de costeo (BI)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Productos BCV (costo legal)</p>
              <p className="text-xl font-bold text-blue-600">{inventoryByCosteo.bcvCount}</p>
              <p className="text-sm">Valor $ {inventoryByCosteo.bcvValue?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos Tasa Calle (protegidos)</p>
              <p className="text-xl font-bold text-amber-600">{inventoryByCosteo.parallelCount}</p>
              <p className="text-sm">Valor $ {inventoryByCosteo.parallelValue?.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}
      <div className="flex gap-4 flex-wrap">
        <Card className="flex-1 min-w-[200px]" title={t("Ventas Zas (Online)") ?? "Ventas Zas! (Online)"}>
          <p className="text-2xl font-bold text-green-600">${dashboard?.totalOnline?.toFixed(2) ?? "0.00"}</p>
        </Card>
        <Card className="flex-1 min-w-[200px]" title={t("Gastos operativos") ?? "Gastos operativos"}>
          <p className="text-2xl font-bold text-red-600">${dashboard?.expenses?.toFixed(2) ?? "0.00"}</p>
        </Card>
        <Card className="flex-1 min-w-[200px]" title={t("Cuentas pagadas") ?? "Cuentas pagadas"}>
          <p className="text-2xl font-bold text-orange-600">${dashboard?.accountsPaid?.toFixed(2) ?? "0.00"}</p>
        </Card>
        <Card className="flex-1 min-w-[200px]" title={t("Neto") ?? "Neto (cierre)"}>
          <p className="text-2xl font-bold text-blue-600">${dashboard?.net?.toFixed(2) ?? "0.00"}</p>
        </Card>
      </div>
      {chartData && (
        <Card title={t("ERP.Comparative") ?? "Comparativa (Ventas / Gastos / Neto)"}>
          <Chart type="doughnut" data={chartData} options={{ responsive: true, maintainAspectRatio: true }} style={{ maxHeight: "320px" }} />
        </Card>
      )}
      {!storeId && <p className="text-amber-600">{t("ERP.SelectStore") ?? "Selecciona una tienda (storeId) para cargar el dashboard."}</p>}
    </div>
  );
}
