"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { BULK_IMPORT_PRODUCTS } from "@/lib/api/graphql/mutations/erp";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { useTranslations } from "next-intl";

interface BulkRow {
  code?: string;
  description: string;
  brand?: string;
  cost: number;
  marginPercent: number;
  category?: string;
}

function parseCSV(text: string): BulkRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s/g, ""));
  const rows: BulkRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    const description = row["descripcion"] ?? row["description"] ?? row["nombre"] ?? "";
    const cost = parseFloat(row["costo"] ?? row["cost"] ?? "0") || 0;
    const marginPercent = parseFloat(row["utilidad"] ?? row["marginpercent"] ?? row["margin"] ?? "0") || 0;
    if (description) rows.push({ code: row["codigo"] ?? row["code"], description, brand: row["marca"] ?? row["brand"], cost, marginPercent, category: row["categoria"] ?? row["category"] });
  }
  return rows;
}

export default function ErpProductsImportScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [bulkImport, { loading }] = useMutation(BULK_IMPORT_PRODUCTS, {
    onCompleted: (data) => {
      setResult(data?.bulkImportProducts ?? 0);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      setResult(null);
    },
  });

  const handleFile = (e: { files: File[] }) => {
    const file = e.files?.[0];
    if (!file || !storeId) {
      setError("Indica ID de tienda y sube un archivo CSV (Código, Descripción, Marca, Costo, % Utilidad).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const products = parseCSV(text);
      if (!products.length) {
        setError("No se encontraron filas válidas en el CSV. Cabecera: codigo, descripcion, marca, costo, utilidad.");
        return;
      }
      bulkImport({
        variables: {
          storeId,
          products: products.map((p) => ({
            code: p.code,
            description: p.description,
            brand: p.brand,
            cost: p.cost,
            marginPercent: p.marginPercent,
            category: p.category,
          })),
        },
      });
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.BulkImport") ?? "Carga masiva de productos (Excel/CSV)"}</h1>
      <Card>
        <p className="mb-4 text-sm text-gray-600">
          CSV con columnas: <strong>codigo, descripcion, marca, costo, utilidad</strong> (opcional: categoria). Precio venta = Costo + Utilidad (%).
        </p>
        <div className="flex gap-2 items-center mb-4">
          <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
          <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
        </div>
        <FileUpload mode="basic" accept=".csv,.xlsx" maxFileSize={1000000} onSelect={handleFile} chooseLabel={t("Upload") ?? "Subir CSV"} />
      </Card>
      {loading && <p>{t("Loading") ?? "Importando…"}</p>}
      {result != null && <p className="text-green-600 font-medium">{result} productos importados.</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
