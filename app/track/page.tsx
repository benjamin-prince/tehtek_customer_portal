"use client";
import { useState } from "react";
import { tracking as trackApi } from "@/lib/api";
import { Search, ArrowLeft, MapPin, CheckCircle2, Clock, Truck, AlertCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const EVENT_LABEL: Record<string, string> = {
  picked_up_from_sender:  "Collecté chez l'expéditeur",
  received_at_warehouse:  "Reçu en entrepôt",
  processed_and_packaged: "Traité et emballé",
  departed_origin:        "Parti de l'origine",
  in_transit:             "En transit",
  arrived_at_destination: "Arrivé à destination",
  customs_clearance:      "Dédouanement",
  out_for_delivery:       "En cours de livraison",
  delivered:              "Livré ✓",
  customs_hold:           "Retenu en douane",
  delay:                  "Retard signalé",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-CM", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function TrackPage() {
  const [input,   setInput]   = useState("");
  const [result,  setResult]  = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    const data = await trackApi.get(input.trim().toUpperCase());
    setLoading(false);
    if (!data) setError("Numéro de suivi introuvable");
    else setResult(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-[#1a1a2e] px-4 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <a href="/login" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Connexion
          </a>
          <div className="text-2xl font-black text-white mb-1">TEH<span className="text-orange-500">TEK</span></div>
          <p className="text-slate-300 text-sm">Suivi de colis</p>

          <form onSubmit={handleSearch} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="TRK-2026-000001"
                className="w-full h-12 pl-9 pr-4 text-sm font-mono bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white/20" />
            </div>
            <button type="submit" disabled={loading || !input.trim()}
              className="h-12 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm transition-colors flex-shrink-0">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Suivre"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-mono text-sm font-bold text-slate-900">{result.tracking_number}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {result.receiver_name}{result.receiver_country ? ` · ${result.receiver_country}` : ""}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                  {result.status?.replace(/_/g, " ")}
                </span>
              </div>
              {result.sender_name && (
                <p className="text-xs text-slate-400">De : {result.sender_name}</p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Historique</h2>
              {result.events?.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Aucun événement pour le moment</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {[...(result.events || [])].reverse().map((ev: any, i: number, arr: any[]) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          i === 0 ? "bg-orange-500" : "bg-slate-100"
                        }`}>
                          {i === 0
                            ? <Truck className="w-4 h-4 text-white" />
                            : <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                        </div>
                        {i < arr.length - 1 && <div className="w-0.5 h-6 bg-slate-100 my-1" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className={`text-sm font-semibold ${i === 0 ? "text-slate-900" : "text-slate-600"}`}>
                          {EVENT_LABEL[ev.event_type] || ev.event_type?.replace(/_/g, " ")}
                        </p>
                        {ev.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {ev.location}
                          </p>
                        )}
                        {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                        <p className="text-[11px] text-slate-400 mt-1">{fmtDateTime(ev.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
