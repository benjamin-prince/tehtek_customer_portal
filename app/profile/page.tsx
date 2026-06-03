"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, tokens, type Customer } from "@/lib/api";
import { ArrowLeft, User, Phone, Mail, MapPin, LogOut, Save } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [whatsapp,  setWhatsapp]  = useState("");

  useEffect(() => {
    if (!tokens.get()) { router.replace("/login"); return; }
    auth.me()
      .then(c => {
        setCustomer(c);
        setFirstName(c.first_name || "");
        setLastName(c.last_name || "");
        setPhone(c.phone || "");
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      const updated = await (auth as any).patchMe({ first_name: firstName, last_name: lastName, phone, whatsapp });
      setCustomer(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour");
    } finally { setSaving(false); }
  };

  const handleLogout = async () => {
    const r = tokens.getR();
    if (r) { try { await auth.logout(r); } catch { /* ignore */ } }
    tokens.clear();
    router.replace("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-[#1a1a2e] px-4 pt-8 pb-8">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </button>
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-2xl">
                {(firstName[0] || "?").toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">{firstName} {lastName}</h1>
              {customer?.email && <p className="text-slate-400 text-sm">{customer.email}</p>}
              {customer?.phone && <p className="text-slate-400 text-sm">{customer.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" /> Informations personnelles
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Prénom</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Nom</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} required
                className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Téléphone
            </label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237…"
              className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-green-500" /> WhatsApp
            </label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+237…"
              className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={saving}
            className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
            } disabled:opacity-50`}>
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : saved
                ? <><Save className="w-4 h-4" /> Enregistré ✓</>
                : <><Save className="w-4 h-4" /> Enregistrer</>}
          </button>
        </form>

        {/* Contact TEHTEK */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <h2 className="text-sm font-bold text-slate-700">Contacter TEHTEK</h2>
          <a href="https://wa.me/237693581133" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 py-2.5 px-3 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors">
            <span className="text-lg">💬</span> WhatsApp : +237 693 58 11 33
          </a>
          <a href="mailto:info@tehtek.com"
            className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <Mail className="w-4 h-4 text-slate-500" /> info@tehtek.com
          </a>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" /> Se déconnecter
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
