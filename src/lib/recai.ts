/* RecAI API client */
export const API_BASE_DEFAULT = "https://recai.applytocollege.pk";

const TOKEN_KEY = "recai_token";
const BASE_KEY = "recai_base_url";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getBaseUrl() {
  return localStorage.getItem(BASE_KEY) || API_BASE_DEFAULT;
}
export function setBaseUrl(url: string) {
  localStorage.setItem(BASE_KEY, url);
}

async function recaiFetch<T>(path: string, init: RequestInit = {}, asBlob = false): Promise<T> {
  const token = getToken();
  const base = getBaseUrl();
  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  // @ts-expect-error generic cast
  return asBlob ? (await res.blob()) : await res.json();
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
export const initializeCategories = (id: string, categories: Array<{ name: string; type: "income" | "expense" }>) =>
  recaiFetch(`/v1/instances/${id}/initialize`, { method: "POST", body: JSON.stringify({ categories }) });
export const addCategory = (id: string, body: { name: string; type: "income" | "expense"; color?: string }) =>
  recaiFetch(`/v1/instances/${id}/categories`, { method: "POST", body: JSON.stringify(body) });
export const renameCategory = (catId: string, name: string) =>
  recaiFetch(`/v1/categories/${catId}`, { method: "PUT", body: JSON.stringify({ name }) });
export const removeCategory = (catId: string) => recaiFetch(`/v1/categories/${catId}`, { method: "DELETE" });

// Receipts
export const uploadReceipt = (file: File, instanceId: string) => {
  const fd = new FormData();
  fd.append("receipt", file);
  fd.append("instance_id", instanceId);
  return recaiFetch(`/v1/receipts`, { method: "POST", body: fd });
};
export const getReceipt = (receiptId: string) => recaiFetch(`/v1/receipts/${receiptId}`);
export const patchReceipt = (receiptId: string, body: any) =>
  recaiFetch(`/v1/receipts/${receiptId}`, { method: "PATCH", body: JSON.stringify(body) });

// Transactions & Budgets
export const listTransactions = (id: string, qs: Record<string, string | number | undefined> = {}) => {
  const query = new URLSearchParams(Object.entries(qs).filter(([, v]) => v !== undefined) as any).toString();
  return recaiFetch(`/v1/instances/${id}/transactions${query ? `?${query}` : ""}`);
};
export const upsertBudget = (id: string, body: { category_id: string; amount: number; period: string; start_date?: string }) =>
  recaiFetch(`/v1/instances/${id}/budgets`, { method: "POST", body: JSON.stringify(body) });
export const getBudgets = (id: string, qs: Record<string, string> = {}) => {
  const query = new URLSearchParams(qs).toString();
  return recaiFetch(`/v1/instances/${id}/budgets${query ? `?${query}` : ""}`);
};

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
