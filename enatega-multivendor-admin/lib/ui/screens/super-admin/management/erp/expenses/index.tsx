"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { EXPENSES_BY_STORE } from "@/lib/api/graphql/queries/erp";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useTranslations } from "next-intl";

export default function ErpExpensesScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState("");

  const { data, loading } = useQuery(EXPENSES_BY_STORE, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });

  const expenses = data?.expensesByStore ?? [];

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.Expenses") ?? "Gastos"}</h1>
      <div className="flex gap-2 items-center">
        <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
        <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
      </div>
      <Card>
        <DataTable value={expenses} loading={loading} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} emptyMessage={t("No data") ?? "Sin datos"}>
          <Column field="_id" header="ID" body={(r) => r._id?.slice(-8)} style={{ maxWidth: "100px" }} />
          <Column field="description" header={t("ERP.Description") ?? "Descripción"} />
          <Column field="amount" header={t("Amount") ?? "Monto"} body={(r) => `$${Number(r.amount).toFixed(2)}`} />
          <Column field="category" header={t("ERP.Category") ?? "Categoría"} />
          <Column field="expenseDate" header={t("Date") ?? "Fecha"} body={(r) => r.expenseDate ? new Date(r.expenseDate).toLocaleDateString() : "-"} />
        </DataTable>
      </Card>
      <p className="text-sm text-gray-500">
        Para crear gastos use la mutación <code>createExpense</code> desde la API o un formulario de alta.
      </p>
    </div>
  );
}
