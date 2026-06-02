"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { shipments, tokens, type ShipmentDetail } from "@/lib/api";
import { ArrowLeft, MapPin, Package, CheckCircle2, Clock, Truck, Weight, Shield, AlertCircle } from "lucide-react";

const EVENT_LABEL: Record<string, string> = {
  picked_up_from_sender:  "Collecté chez l'expéditeur",
  received_at_warehouse:  "Reçu en entrepôt",
  processed_and_packaged: "Traité et emballé",
  departed_origin:        "Parti de l'origine",
  in_transit:             "En transit",
  arrived_at_destination: "Arrivé à destination",
  customs_clearance:      "Dédouanement",
  out_for_delivery:       "En cours de livraison",
  delivered:              "Livré",
  customs_hold:           "Retenu en douane",
  delay:                  "Retard signalé",
  exception:              "Incident",
};

const STATUS_COLOR: Record<string, string> = {
  draft:         "bg-slate-100 text-slate-600",
  confirmed:     "bg-blue-100 text-blue-700",
  warehoused:    "bg-indigo-100 text-indigo-700",
  in_transit:    "bg-amber-100 text-amber-700",
  arrived:       "bg-teal-100 text-teal-700",
  customs_clearance: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-lime-100 text-lime-700",
  delivered:     "bg-green-100 text-green-700",
  cancelled:     "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  draft:         "Brouillon",
  confirmed:     "Confirmé",
  warehoused:    "En entrepôt",
  processed:     "Traité",
  departed:      "Parti",
  in_transit:    "En transit",
  arrived:       "Arrivé",
  customs_clearance: "Dédouanement",
  out_for_delivery: "En livraison",
  delivered:     "Livré ✓",
  cancelled:     "Annulé",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CM", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-CM", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function ShipmentDetailPage() {
  const router   = useRouter();
  const { tracking } = useParams<{ tracking: string }>();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!tokens.get()) { router.replace("/login"); return; }
    shipments.get(tracking)
      .then(setShipment)
      .catch(e => setError(e instanceof Error ? e.message : "Expédition introuvable"))
      .finally(() => setLoading(false));
  }, [tracking, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !shipment) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
      <p className="text-slate-600">{error || "Expédition introuvable"}</p>
      <button onClick={() => router.back()} className="mt-4 text-orange-500 font-semibold text-sm">← Retour</button>
    </div>
  );

  const isDelivered = shipment.status === "delivered";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] px-4 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Mes expéditions
          </button>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Numéro de suivi</p>
              <p className="text-white font-mono font-bold text-lg">{shipment.tracking_number}</p>
              <p className="text-slate-400 text-xs mt-1">{fmtDate(shipment.created_at)}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLOR[shipment.status] || "bg-slate-100 text-slate-600"}`}>
              {STATUS_LABEL[shipment.status] || shipment.status}
            </span>
          </div>

          {/* Progress bar */}
          {(() => {
            const steps = ["confirmed","warehoused","in_transit","arrived","out_for_delivery","delivered"];
            const idx = steps.indexOf(shipment.status);
            const pct = idx < 0 ? 0 : Math.round((idx + 1) / steps.length * 100);
            return (
              <div className="mt-4">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isDelivered ? "bg-green-400" : "bg-orange-400"}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <p className="text-slate-400 text-[11px] mt-1">{pct}% — {STATUS_LABEL[shipment.status] || shipment.status}</p>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Sender / Receiver */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Détails</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">Expéditeur</p>
              <p className="text-sm font-semibold text-slate-800">{shipment.sender_name || "—"}</p>
              {shipment.sender_phone && <p className="text-xs text-slate-500">{shipment.sender_phone}</p>}
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">Destinataire</p>
              <p className="text-sm font-semibold text-slate-800">{shipment.receiver_name || "—"}</p>
              {shipment.receiver_phone && <p className="text-xs text-slate-500">{shipment.receiver_phone}</p>}
              {shipment.receiver_country && <p className="text-xs text-slate-400">{shipment.receiver_country}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            {shipment.weight_kg && (
              <div className="flex items-center gap-1 text-slate-500">
                <Weight className="w-3 h-3" /> {shipment.weight_kg} kg
              </div>
            )}
            {shipment.declared_value && (
              <div className="flex items-center gap-1 text-slate-500">
                <Package className="w-3 h-3" />
                {Number(shipment.declared_value).toLocaleString("fr-CM")} {shipment.declared_value_currency}
              </div>
            )}
            {shipment.insurance_status && shipment.insurance_status !== "not_requested" && (
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <Shield className="w-3 h-3" /> Assuré
              </div>
            )}
          </div>
          {shipment.content_description && (
            <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">
              Contenu : {shipment.content_description}
            </p>
          )}
        </div>

        {/* Items */}
        {shipment.items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Colis ({shipment.items.length})
            </h2>
            <div className="space-y-2">
              {shipment.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-500">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{it.description}</p>
                    <p className="text-xs text-slate-400">{it.quantity} × {it.unit}{it.weight_kg ? ` · ${it.weight_kg} kg` : ""}</p>
                  </div>
                  {it.tracking_number && (
                    <p className="text-[10px] font-mono text-slate-400 flex-shrink-0">{it.tracking_number}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracking timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Historique</h2>
          {shipment.events.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun événement public pour l&apos;instant</p>
            </div>
          ) : (
            <div className="space-y-0">
              {[...shipment.events].reverse().map((ev, i, arr) => {
                const isFirst = i === 0;
                const isLast  = i === arr.length - 1;
                const isDone  = !isFirst;
                return (
                  <div key={i} className="flex gap-3">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isFirst ? "bg-orange-500" : "bg-slate-100"
                      }`}>
                        {isFirst
                          ? <Truck className="w-4 h-4 text-white" />
                          : <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                      </div>
                      {!isLast && <div className="w-0.5 h-6 bg-slate-100 my-1" />}
                    </div>
                    {/* Content */}
                    <div className={`pb-4 flex-1 min-w-0 ${isLast ? "" : ""}`}>
                      <p className={`text-sm font-semibold ${isFirst ? "text-slate-900" : "text-slate-600"}`}>
                        {EVENT_LABEL[ev.event_type] || ev.event_type.replace(/_/g, " ")}
                      </p>
                      {ev.location && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {ev.location}
                        </p>
                      )}
                      {ev.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">{fmtDateTime(ev.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isDelivered && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">Expédition livrée ✓</p>
              <p className="text-xs text-green-600">Merci d&apos;avoir choisi TEHTEK Cargo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
