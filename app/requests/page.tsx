"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pickupRequests, tokens, type PickupRequestSummary } from "@/lib/api";
import { ArrowLeft, ClipboardList, MapPin, Clock, CheckCircle2, XCircle, Package } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const STATUS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:      { label: "En attente",   color: "bg-amber-100 text-amber-700",  icon: Clock },
  acknowledged: { label: "Confirmée",    color: "bg-blue-100 text-blue-700",    icon: CheckCircle2 },
  converted:    { label: "Expédiée",     color: "bg-green-100 text-green-700",  icon: Package },
  cancelled:    { label: "Annulée",      color: "bg-red-100 text-red-700",      icon: XCircle },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CM", { day: "2-digit", month: "short", year: "numeric" });
}

export default function RequestsPage() {
  const router = useRouter();
  const [list,    setList]    = useState<PickupRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokens.get()) { router.replace("/login"); return; }
    pickupRequests.list()
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-[#1a1a2e] px-4 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </button>
          <h1 className="text-white text-lg font-bold">Mes demandes de collecte</h1>
          <p className="text-slate-400 text-sm mt-0.5">{list.length} demande{list.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Aucune demande de collecte</p>
            <button onClick={() => router.push("/request")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold">
              Faire une demande
            </button>
          </div>
        ) : (
          list.map(r => {
            const s = STATUS[r.status] || STATUS.pending;
            const Icon = s.icon;
            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-slate-900">{r.pickup_number}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmt(r.created_at)}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.color}`}>
                    <Icon className="w-3 h-3" /> {s.label}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-sm text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{r.address}{r.city ? `, ${r.city}` : ""}</span>
                </div>
                {r.notes && (
                  <p className="text-xs text-slate-400 mt-1.5 truncate">{r.notes}</p>
                )}
                {r.shipment_id && (
                  <p className="text-xs text-green-600 font-semibold mt-2">✓ Expédition créée — voir dans Mes colis</p>
                )}
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
}
