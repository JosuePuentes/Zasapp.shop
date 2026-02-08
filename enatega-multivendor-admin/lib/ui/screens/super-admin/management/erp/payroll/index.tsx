"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { EMPLOYEES_BY_STORE } from "@/lib/api/graphql/queries/erp";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useTranslations } from "next-intl";

export default function ErpPayrollScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState("");

  const { data, loading } = useQuery(EMPLOYEES_BY_STORE, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });

  const employees = data?.employeesByStore ?? [];

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.Payroll") ?? "Nómina"}</h1>
      <p className="text-sm text-gray-500">
        Ficha de empleados y comisiones. Quien tenga comisión se calcula en el reporte de cierre.
      </p>
      <div className="flex gap-2 items-center">
        <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
        <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
      </div>
      <Card>
        <DataTable value={employees} loading={loading} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} emptyMessage={t("No data") ?? "Sin datos"}>
          <Column field="_id" header="ID" body={(r) => r._id?.slice(-8)} style={{ maxWidth: "100px" }} />
          <Column field="name" header={t("ERP.Employee") ?? "Empleado"} />
          <Column field="position" header={t("ERP.Position") ?? "Puesto"} />
          <Column field="hasCommission" header="Comisión" body={(r) => (r.hasCommission ? "Sí" : "No")} />
          <Column field="commissionPercent" header="% Comisión" body={(r) => (r.hasCommission ? `${r.commissionPercent ?? 0}%` : "-")} />
          <Column field="isActive" header="Activo" body={(r) => (r.isActive !== false ? "Sí" : "No")} />
        </DataTable>
      </Card>
    </div>
  );
}
