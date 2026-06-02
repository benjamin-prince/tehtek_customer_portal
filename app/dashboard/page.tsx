"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, shipments, tokens, type Customer, type ShipmentSummary } from "@/lib/api";
import { Package, ChevronRight, LogOut, Search, Clock, CheckCircle2, AlertCircle, Truck, MapPin } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  draft:         "bg-slate-100 text-slate-600",
  confirmed:     "bg-blue-100 text-blue-700",
  warehoused:    "bg-indigo-100 text-indigo-700",
  processed:     "bg-purple-100 text-purple-700",
  departed:      "bg-amber-100 text-amber-700",
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
  delivered:     "Livré",
  cancelled:     "Annulé",
};

function fmt(dt: string) {
  return new Date(dt).toLocaleDateString("fr-CM", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const [customer,  setCustomer]  = useState<Customer | null>(null);
  const [list,      setList]      = useState<ShipmentSummary[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    if (!tokens.get()) { router.replace("/login"); return; }
    Promise.all([auth.me(), shipments.list()])
      .then(([c, s]) => { setCustomer(c); setList(s); })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    const r = tokens.getR();
    if (r) { try { await auth.logout(r); } catch { /* ignore */ } }
    tokens.clear();
    router.replace("/login");
  };

  const filtered = list.filter(s =>
    !search || s.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    (s.receiver_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const active    = list.filter(s => !["delivered","cancelled"].includes(s.status)).length;
  const delivered = list.filter(s => s.status === "delivered").length;

  if (loading) return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] px-4 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-black text-white">TEH<span className="text-orange-500">TEK</span></div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors p-1">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-300 text-sm">Bonjour,</p>
          <h1 className="text-white text-xl font-bold">{customer?.first_name} {customer?.last_name}</h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-white font-black text-2xl">{list.length}</p>
              <p className="text-slate-300 text-[11px] mt-0.5">Total</p>
            </div>
            <div className="bg-orange-500/20 rounded-2xl p-3 text-center">
              <p className="text-orange-300 font-black text-2xl">{active}</p>
              <p className="text-orange-200 text-[11px] mt-0.5">En cours</p>
            </div>
            <div className="bg-green-500/20 rounded-2xl p-3 text-center">
              <p className="text-green-300 font-black text-2xl">{delivered}</p>
              <p className="text-green-200 text-[11px] mt-0.5">Livrés</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un colis…"
            className="w-full h-11 pl-9 pr-4 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
        </div>

        {/* Track without login shortcut */}
        <a href="/track"
          className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-colors">
          <MapPin className="w-4 h-4 text-orange-500" />
          Suivre un colis par numéro de tracking
          <ChevronRight className="w-4 h-4 ml-auto" />
        </a>

        {/* Shipment list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {list.length === 0 ? "Aucune expédition pour le moment" : "Aucun résultat"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <button key={s.id} onClick={() => router.push(`/shipments/${s.tracking_number}`)}
                className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:border-orange-200 hover:shadow-md transition-all active:scale-98">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[s.status] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABEL[s.status] || s.status}
                      </span>
                    </div>
                    <p className="font-mono text-sm font-bold text-slate-900">{s.tracking_number}</p>
                    {s.receiver_name && (
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Pour : {s.receiver_name}
                        {s.receiver_country ? ` · ${s.receiver_country}` : ""}
                      </p>
                    )}
                    {s.last_location && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {s.last_location}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <p className="text-[11px] text-slate-400">{fmt(s.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
