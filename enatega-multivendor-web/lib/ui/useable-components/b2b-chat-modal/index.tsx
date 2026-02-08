"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { B2B_CHAT_MESSAGES } from "@/lib/api/graphql/queries/b2b";
import { SEND_B2B_MESSAGE, APPROVE_BUSINESS_PARTNER } from "@/lib/api/graphql/mutations/b2b";

interface B2BChatModalProps {
  buyerStoreId: string;
  partnerStoreId: string;
  partnerName: string;
  onClose: () => void;
  /** When true, show alliance panel (discount, credit, confirm). Pass requestId from businessPartnerRequests. */
  isDistributorView?: boolean;
  requestId?: string | null;
  onAllianceConfirmed?: () => void;
}

export default function B2BChatModal({
  buyerStoreId,
  partnerStoreId,
  partnerName,
  onClose,
  isDistributorView = false,
  requestId,
  onAllianceConfirmed,
}: B2BChatModalProps) {
  const [message, setMessage] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [creditDays, setCreditDays] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(0);

  const { data, refetch } = useQuery(B2B_CHAT_MESSAGES, {
    variables: { storeId: buyerStoreId, partnerStoreId, limit: 100 },
  });
  const messages = (data?.b2bChatMessages ?? []) as { _id: string; fromStore: string; toStore: string; body: string; isSystem: boolean; createdAt?: string }[];

  const [sendMessage, { loading: sending }] = useMutation(SEND_B2B_MESSAGE, {
    onCompleted: () => {
      setMessage("");
      refetch();
    },
  });

  const [approveAlliance, { loading: approving }] = useMutation(APPROVE_BUSINESS_PARTNER, {
    onCompleted: () => {
      onAllianceConfirmed?.();
      onClose();
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage({
      variables: { storeId: buyerStoreId, partnerStoreId, body: message.trim() },
    });
  };

  const isFromBuyer = (fromStore: string) => fromStore === buyerStoreId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat con {partnerName}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
          {messages.length === 0 && <p className="text-sm text-gray-500">Envía un mensaje para iniciar. Se incluirá tu tarjeta de presentación (RIF, ubicación, volumen).</p>}
          {messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${m.isSystem ? "justify-center" : isFromBuyer(m.fromStore) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.isSystem
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200"
                    : isFromBuyer(m.fromStore)
                      ? "bg-primary-color/20 text-gray-900 dark:text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                {m.body}
                {m.createdAt && <div className="text-xs opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</div>}
              </div>
            </div>
          ))}
        </div>
        {!isDistributorView && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button type="button" onClick={handleSend} disabled={sending || !message.trim()} className="px-4 py-2 bg-primary-color text-white rounded-lg hover:opacity-90 disabled:opacity-50">
              Enviar
            </button>
          </div>
        )}
        {isDistributorView && requestId && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Acciones de alianza</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500">% Descuento</label>
                <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Días crédito</label>
                <input type="number" min={0} value={creditDays} onChange={(e) => setCreditDays(Number(e.target.value) || 0)} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Límite crédito ($)</label>
                <input type="number" min={0} value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value) || 0)} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Al confirmar se crea el aliado y el comercio podrá ver precios especiales.</p>
            <button
              type="button"
              onClick={() => requestId && approveAlliance({ variables: { id: requestId, discountPercent, creditDays, creditLimit } })}
              disabled={approving}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {approving ? "Guardando…" : "Confirmar alianza"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
