"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { LATEST_RATES, EXCHANGE_RATES_BY_STORE } from "@/lib/api/graphql/queries/erp";
import { UPDATE_EXCHANGE_RATES } from "@/lib/api/graphql/mutations/erp";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { useTranslations } from "next-intl";

export default function ErpCurrencyScreen() {
  const t = useTranslations();
  const [storeId, setStoreId] = useState("");
  const [rateBcv, setRateBcv] = useState<number | null>(null);
  const [rateCalle, setRateCalle] = useState<number | null>(null);

  const { data: latestData, refetch: refetchLatest } = useQuery(LATEST_RATES, {
    variables: { storeId: storeId || "none" },
    skip: !storeId,
  });
  const { data: historyData } = useQuery(EXCHANGE_RATES_BY_STORE, {
    variables: { storeId: storeId || "none", limit: 10 },
    skip: !storeId,
  });

  const [updateRates, { loading }] = useMutation(UPDATE_EXCHANGE_RATES, {
    onCompleted: () => {
      refetchLatest();
      setRateBcv(null);
      setRateCalle(null);
    },
  });

  const latest = latestData?.latestRates;
  const history = historyData?.exchangeRatesByStore ?? [];

  const handleSave = () => {
    if (!storeId || rateBcv == null || rateCalle == null) return;
    updateRates({
      variables: {
        storeId,
        rateBcv: Number(rateBcv),
        rateCalle: Number(rateCalle),
      },
    });
  };

  return (
    <div className="screen-container space-y-4">
      <h1 className="text-2xl font-bold">{t("ERP.CurrencyConfig") ?? "Configuración de Moneda"}</h1>
      <p className="text-sm text-gray-500">
        Ingresa diariamente la Tasa BCV y la Tasa Calle. El sistema calcula el diferencial (inflación/brecha) y al actualizar Tasa Calle se recalculan los precios de productos comprados en Calle.
      </p>
      <div className="flex gap-2 items-center flex-wrap">
        <label className="font-medium">{t("ERP.StoreId") ?? "ID Tienda"}</label>
        <InputText value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="ID de la tienda" className="w-64" />
      </div>
      {latest && (
        <Card title="Tasas actuales (última configuración)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-gray-600">Tasa BCV:</span>
              <span className="ml-2 font-bold">{latest.rateBcv}</span>
            </div>
            <div>
              <span className="text-gray-600">Tasa Calle:</span>
              <span className="ml-2 font-bold">{latest.rateCalle}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Diferencial (Inflación/Brecha):</span>
              <span className="ml-2 font-bold text-amber-600">{latest.differentialPercent}%</span>
            </div>
          </div>
        </Card>
      )}
      <Card title="Actualizar tasas del día">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Tasa BCV</label>
            <InputNumber value={rateBcv ?? undefined} onValueChange={(e) => setRateBcv(e.value ?? null)} minFractionDigits={2} placeholder="Ej. 36.50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tasa Calle</label>
            <InputNumber value={rateCalle ?? undefined} onValueChange={(e) => setRateCalle(e.value ?? null)} minFractionDigits={2} placeholder="Ej. 38.00" />
          </div>
          <Button label="Guardar tasas" onClick={handleSave} disabled={!storeId || rateBcv == null || rateCalle == null || loading} />
        </div>
      </Card>
      {history.length > 0 && (
        <Card title="Historial reciente">
          <ul className="space-y-1 text-sm">
            {history.map((r: { _id: string; rateBcv: number; rateCalle: number; effectiveDate?: string }) => (
              <li key={r._id}>
                BCV: {r.rateBcv} | Calle: {r.rateCalle} {r.effectiveDate ? `(${new Date(r.effectiveDate).toLocaleDateString()})` : ""}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
