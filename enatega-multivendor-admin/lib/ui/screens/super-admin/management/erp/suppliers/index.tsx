"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { SUPPLIERS_BY_STORE } from "@/lib/api/graphql/queries/erp";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useTranslations } from "next-intl";

export default function ErpSuppliersScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState("");

  const { data, loading } = useQuery(SUPPLIERS_BY_STORE, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });

  const suppliers = data?.suppliersByStore ?? [];

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.Suppliers") ?? "Proveedores"}</h1>
      <div className="flex gap-2 items-center">
        <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
        <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
      </div>
      <Card>
        <DataTable value={suppliers} loading={loading} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} emptyMessage={t("No data") ?? "Sin datos"}>
          <Column field="_id" header="ID" body={(r) => r._id?.slice(-8)} style={{ maxWidth: "100px" }} />
          <Column field="companyName" header={t("ERP.CompanyName") ?? "Empresa"} />
          <Column field="rif" header="RIF" />
          <Column field="contactName" header={t("ERP.Contact") ?? "Contacto"} />
          <Column field="contactPhone" header={t("Phone") ?? "Teléfono"} />
          <Column field="contactEmail" header="Email" />
          <Column field="address" header={t("Address") ?? "Dirección"} />
        </DataTable>
      </Card>
    </div>
  );
}
