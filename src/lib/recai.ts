/* RecAI API client */
import { supabase } from "@/integrations/supabase/client";
export const API_BASE_DEFAULT = "https://recai.applytocollege.pk";

// Backward-compat exports (no-ops or fallbacks) to avoid runtime import errors
export const getBaseUrl = () => API_BASE_DEFAULT;
export const getToken = () => "";
export const setBaseUrl = (_: string) => {};
export const setToken = (_: string) => {};

let cachedConfig: { token: string; base: string } | null = null;

export function clearRecaiConfigCache() {
  cachedConfig = null;
}

async function getRecaiConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    let token = "";
    let base = API_BASE_DEFAULT;
    if (uid) {
      const { data } = await supabase
        .from("profiles")
        .select("recai_api_token, recai_base_url")
        .eq("user_id", uid)
        .maybeSingle();
      token = (data?.recai_api_token || "").trim();
      base = (data?.recai_base_url || API_BASE_DEFAULT).trim();
    }
    // Fallback demo token to avoid hard crashes during onboarding
    if (!token) token = "any";
    cachedConfig = { token, base };
    return cachedConfig;
  } catch {
    // As a last resort, use defaults to keep UI functional
    cachedConfig = { token: "any", base: API_BASE_DEFAULT };
    return cachedConfig;
  }
}

async function recaiFetch<T>(path: string, init: RequestInit = {}, asBlob = false): Promise<T> {
  const { token, base } = await getRecaiConfig();
  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  // @ts-expect-error generic cast
  return asBlob ? (await res.blob()) : await res.json();
}

export function recaiRequest<T>(method: string, path: string, body?: any, options?: { asBlob?: boolean }) {
  const asBlob = options?.asBlob ?? false;
  const init: RequestInit = { method };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return recaiFetch<T>(path, init, asBlob);
}

// Health
export const health = () => recaiFetch<{ status: string }>(`/v1/health`);

// Instances (Books)
export const listInstances = () => recaiFetch<{ instances: any[] }>(`/v1/instances`);
export const createInstance = (body: { name: string; description?: string }) =>
  recaiFetch(`/v1/instances`, { method: "POST", body: JSON.stringify(body) });
export const getInstance = (id: string) => recaiFetch(`/v1/instances/${id}`);
export const updateInstance = (id: string, body: { name?: string; description?: string }) =>
  recaiFetch(`/v1/instances/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteInstance = (id: string) => recaiFetch(`/v1/instances/${id}`, { method: "DELETE" });

// Categories
export const initializeCategories = (id: string, categories: string) =>
  recaiFetch(`/v1/instances/${id}/initialize`, { method: "POST", body: JSON.stringify({ categories }) });
export const addCategory = (id: string, body: any) =>
  recaiFetch(`/v1/instances/${id}/categories`, { method: "POST", body: JSON.stringify(body) });
export const renameCategory = (catId: string, name: string) =>
  recaiFetch(`/v1/categories/${catId}`, { method: "PUT", body: JSON.stringify({ name }) });
export const removeCategory = (catId: string) => recaiFetch(`/v1/categories/${catId}`, { method: "DELETE" });

// Receipts
export const uploadReceipt = (file: File, instanceId: string) => {
  const fd = new FormData();
  fd.append("reciept", file);  // Note: backend expects "reciept" (misspelled)
  fd.append("instance_id", instanceId);
  return recaiFetch(`/v1/reciepts`, { method: "POST", body: fd });  // Note: "reciepts" (misspelled)
};
export const getReceipt = (receiptId: string) => recaiFetch(`/v1/reciepts/${receiptId}`);
export const patchReceipt = (receiptId: string, body: any) =>
  recaiFetch(`/v1/reciepts/${receiptId}`, { method: "PATCH", body: JSON.stringify(body) });

// Transactions & Budgets
export const listTransactions = (id: string, qs: Record<string, string | number | undefined> = {}) => {
  const query = new URLSearchParams(Object.entries(qs).filter(([, v]) => v !== undefined) as any).toString();
  return recaiFetch(`/v1/instances/${id}/transactions${query ? `?${query}` : ""}`);
};
export const upsertBudget = (id: string, body: any) => {
  const payload = "limit" in (body || {})
    ? body
    : ("amount" in (body || {}) ? { ...body, limit: body.amount } : body);
  if (payload && "amount" in payload) delete payload.amount;
  return recaiFetch(`/v1/instances/${id}/budgets`, { method: "POST", body: JSON.stringify(payload) });
};
export const getBudgets = (id: string, qs: Record<string, string> = {}) => {
  const query = new URLSearchParams(qs).toString();
  return recaiFetch(`/v1/instances/${id}/budgets${query ? `?${query}` : ""}`);
};

// Manual Transaction Management
export const getTransactionsDetailed = (id: string, params: { limit?: number; offset?: number } = {}) => {
  const query = new URLSearchParams(
    Object.entries({ limit: params.limit ?? 50, offset: params.offset ?? 0 }) as any
  ).toString();
  return recaiFetch(`/v1/instances/${id}/transactions/detailed?${query}`);
};

export const addManualTransaction = (
  id: string,
  body: { text: string; amount: number; category_id: number; date?: string; receipt_id?: string }
) => recaiRequest("POST", `/v1/instances/${id}/transactions`, body);

export const deleteTransactionByIndex = (id: string, index: number) =>
  recaiRequest("DELETE", `/v1/instances/${id}/transactions/${index}`);

export const deleteReceiptTransactions = (id: string, receiptId: string) =>
  recaiRequest("DELETE", `/v1/instances/${id}/receipts/${receiptId}/transactions`);

// Reports / Graphs / Export
export const getReports = (id: string, qs: Record<string, string> = {}) => {
  const query = new URLSearchParams(qs).toString();
  return recaiFetch(`/v1/instances/${id}/reports${query ? `?${query}` : ""}`);
};
export const getGraphs = (id: string, qs: Record<string, string> = {}) => {
  const query = new URLSearchParams(qs).toString();
  return recaiFetch(`/v1/instances/${id}/graphs${query ? `?${query}` : ""}`);
};
export const exportCSV = async (id: string, qs: Record<string, string> = {}) => {
  const query = new URLSearchParams({ format: "csv", ...qs }).toString();
  return recaiFetch<Blob>(`/v1/instances/${id}/export?${query}`, {}, true);
};

// Insights & Advice / Chat
export const postAdvice = (id: string, body: any) =>
  recaiFetch(`/v1/instances/${id}/advice`, { method: "POST", body: JSON.stringify(body) });
export const postChat = (id: string, body: { message: string; context?: string }) =>
  recaiFetch(`/v1/instances/${id}/chat`, { method: "POST", body: JSON.stringify(body) });
export const getInsights = (id: string, qs: Record<string, string> = {}) => {
  const query = new URLSearchParams(qs).toString();
  return recaiFetch(`/v1/instances/${id}/insights${query ? `?${query}` : ""}`);
};
