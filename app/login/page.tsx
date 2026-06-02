"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, tokens } from "@/lib/api";
import { Eye, EyeOff, Package } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab,        setTab]        = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await auth.login(identifier.trim(), password);
      tokens.set(res.access_token, res.refresh_token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { setError("Prénom et nom requis"); return; }
    setLoading(true); setError(null);
    const isEmail = identifier.includes("@");
    try {
      const res = await auth.register({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        [isEmail ? "email" : "phone"]: identifier.trim(),
        password,
      });
      tokens.set(res.access_token, res.refresh_token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-4xl font-black tracking-tight text-white">
          TEH<span className="text-orange-500">TEK</span>
        </div>
        <p className="text-slate-400 text-sm mt-1">Portail client · Suivi & Livraisons</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex">
          {(["login", "register"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === t ? "bg-[#1a1a2e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>
              {t === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          ))}
        </div>

        <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="p-6 space-y-4">
          {tab === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Prénom</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                  className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Nom</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} required
                  className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              Email ou téléphone
            </label>
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
              placeholder="email@exemple.com ou +237…" required autoComplete="username"
              className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Mot de passe</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} required autoComplete={tab === "login" ? "current-password" : "new-password"}
                className="w-full h-11 px-3 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : tab === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        {/* Public tracking */}
        <div className="px-6 pb-5">
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-400 mb-2">Pas de compte ? Suivez un colis directement</p>
            <a href="/track" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600">
              <Package className="w-4 h-4" /> Suivi sans connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
