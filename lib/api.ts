const API = process.env.NEXT_PUBLIC_API_URL || "https://api2.tehtek.com/api/v1";

export const tokens = {
  get:    ()           => typeof window !== "undefined" ? localStorage.getItem("cp_access")  : null,
  getR:   ()           => typeof window !== "undefined" ? localStorage.getItem("cp_refresh") : null,
  set:    (a: string, r: string) => { localStorage.setItem("cp_access", a); localStorage.setItem("cp_refresh", r); },
  clear:  ()           => { localStorage.removeItem("cp_access"); localStorage.removeItem("cp_refresh"); },
};

async function tryRefresh(): Promise<boolean> {
  const r = tokens.getR();
  if (!r) return false;
  try {
    const res = await fetch(`${API}/shop/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: r }),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const d = await res.json();
    tokens.set(d.access_token, d.refresh_token);
    return true;
  } catch { return false; }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const access = tokens.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${API}${path}`, { ...options, headers, cache: "no-store" });

  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) return apiFetch<T>(path, options, false);
    tokens.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  login: (identifier: string, password: string) =>
    apiFetch<{ access_token: string; refresh_token: string; customer: Customer }>(
      "/shop/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) }
    ),
  register: (data: { first_name: string; last_name: string; email?: string; phone?: string; password: string }) =>
    apiFetch<{ access_token: string; refresh_token: string; customer: Customer }>(
      "/shop/auth/register", { method: "POST", body: JSON.stringify(data) }
    ),
  me: () => apiFetch<Customer>("/shop/auth/me"),
  patchMe: (data: Partial<{ first_name: string; last_name: string; phone: string; whatsapp: string }>) =>
    apiFetch<Customer>("/shop/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  logout: (refresh_token: string) =>
    apiFetch<void>("/shop/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token }) }),
};

// ── Shipments ─────────────────────────────────────────────────────────────────

export const shipments = {
  list:       ()                => apiFetch<ShipmentSummary[]>("/shop/auth/shipments"),
  get:        (tracking: string) => apiFetch<ShipmentDetail>(`/shop/auth/shipments/${tracking}`),
  getInvoice: (tracking: string) => apiFetch<ShipmentInvoice>(`/shop/auth/shipments/${tracking}/invoice`),
};

export const pickupRequests = {
  list:   ()                      => apiFetch<PickupRequestSummary[]>("/shop/auth/pickup-requests"),
  create: (data: PickupRequestIn) => apiFetch<PickupRequestSummary>("/shop/auth/pickup-requests", {
    method: "POST", body: JSON.stringify(data),
  }),
};

// ── Public tracking (no auth) ─────────────────────────────────────────────────

export const tracking = {
  get: (tracking_number: string) =>
    fetch(`${API}/tracking/${tracking_number}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
};

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email?: string;
  phone?: string;
  customer_code?: string;
}

export interface ShipmentSummary {
  id: number;
  tracking_number: string;
  status: string;
  shipment_type: string;
  route?: string;
  sender_name?: string;
  receiver_name?: string;
  receiver_country?: string;
  weight_kg?: number;
  declared_value?: number;
  declared_value_currency?: string;
  created_at: string;
  last_event?: string;
  last_event_at?: string;
  last_location?: string;
}

export interface ShipmentInvoice {
  id: number;
  invoice_number: string;
  status: string;
  total: number;
  paid_amount: number;
  balance_due: number;
  currency: string;
  created_at: string;
  payments: { amount: number; currency: string; payment_method: string; confirmed_at?: string }[];
}

export interface PickupRequestSummary {
  id: number;
  pickup_number: string;
  status: string;
  address: string;
  city?: string;
  notes?: string;
  created_at: string;
  shipment_id?: number;
}

export interface PickupRequestIn {
  address: string;
  city?: string;
  content_description?: string;
  estimated_weight_kg?: number;
  destination_country?: string;
  receiver_name?: string;
  receiver_phone?: string;
  preferred_date?: string;
  notes?: string;
}

export interface ShipmentDetail extends ShipmentSummary {
  sender_phone?: string;
  receiver_phone?: string;
  receiver_address?: string;
  content_description?: string;
  delivery_type?: string;
  insurance_status?: string;
  priority?: string;
  items: { description: string; quantity: number; unit: string; weight_kg?: number; tracking_number?: string }[];
  events: { event_type: string; description?: string; location?: string; timestamp: string; photos: string[] }[];
}
