"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { pickupRequests, tokens } from "@/lib/api";
import { ArrowLeft, MapPin, Package, Calendar, User, CheckCircle2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function RequestPickupPage() {
  const router = useRouter();
  const [address,     setAddress]     = useState("");
  const [city,        setCity]        = useState("");
  const [description, setDescription] = useState("");
  const [weight,      setWeight]      = useState("");
  const [destination, setDestination] = useState("");
  const [recvName,    setRecvName]    = useState("");
  const [recvPhone,   setRecvPhone]   = useState("");
  const [date,        setDate]        = useState("");
  const [notes,       setNotes]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [done,        setDone]        = useState<string | null>(null);

  if (!tokens.get()) { router.replace("/login"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { setError("L'adresse de collecte est requise"); return; }
    setLoading(true); setError(null);
    try {
      const res = await pickupRequests.create({
        address:             address.trim(),
        city:                city.trim() || undefined,
        content_description: description.trim() || undefined,
        estimated_weight_kg: weight ? Number(weight) : undefined,
        destination_country: destination.trim() || undefined,
        receiver_name:       recvName.trim() || undefined,
        receiver_phone:      recvPhone.trim() || undefined,
        preferred_date:      date || undefined,
        notes:               notes.trim() || undefined,
      });
      setDone(res.pickup_number);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la demande");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 pb-24">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Demande envoyée !</h2>
        <p className="text-slate-500 text-sm">Référence : <span className="font-mono font-bold text-slate-900">{done}</span></p>
        <p className="text-slate-400 text-sm">Notre équipe vous contactera pour confirmer le rendez-vous.</p>
        <div className="flex gap-3 pt-2">
          <button onClick={() => { setDone(null); setAddress(""); setDescription(""); setWeight(""); setDestination(""); setRecvName(""); setRecvPhone(""); setDate(""); setNotes(""); setCity(""); }}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">
            Nouvelle demande
          </button>
          <button onClick={() => router.push("/requests")}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold">
            Mes demandes
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-[#1a1a2e] px-4 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-white text-lg font-bold">Demande de collecte</h1>
          <p className="text-slate-400 text-sm mt-0.5">Notre équipe vient récupérer votre colis</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Pickup location */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Adresse de collecte
            </h2>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Adresse *</label>
              <input value={address} onChange={e => setAddress(e.target.value)} required
                placeholder="Rue, quartier, numéro…"
                className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Ville</label>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="Douala"
                  className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date souhaitée
                </label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
          </div>

          {/* Package info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" /> Contenu du colis
            </h2>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Description du contenu</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="Ex: Vêtements, électronique, documents…"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Poids estimé (kg)</label>
              <input type="number" min="0" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="0"
                className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          {/* Destination */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" /> Destinataire
            </h2>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Pays de destination</label>
              <input value={destination} onChange={e => setDestination(e.target.value)}
                placeholder="France, USA, Canada…"
                className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Nom destinataire</label>
                <input value={recvName} onChange={e => setRecvName(e.target.value)} placeholder="Jean Dupont"
                  className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Téléphone</label>
                <input value={recvPhone} onChange={e => setRecvPhone(e.target.value)} placeholder="+33…"
                  className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <label className="text-xs text-slate-500 font-medium block mb-2">Notes supplémentaires</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Informations complémentaires pour notre équipe…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={loading || !address.trim()}
            className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30">
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : "Envoyer la demande"}
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
