import { useEffect, useState } from "react";
import { API_BASE_DEFAULT, health, clearRecaiConfigCache } from "@/lib/recai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useRecaiAuth() {
  const { user } = useAuth();
  const [token, setTokenState] = useState<string>("");
  const [baseUrl, setBaseState] = useState<string>(API_BASE_DEFAULT);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  // Load from Supabase profile
  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("recai_api_token, recai_base_url")
        .eq("user_id", user.id)
        .maybeSingle();
      setTokenState(data?.recai_api_token || "");
      setBaseState(data?.recai_base_url || API_BASE_DEFAULT);
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        if (!token) { setHealthy(null); return; }
        clearRecaiConfigCache();
        const h = await health();
        setHealthy(!!h);
      } catch (e) {
        setHealthy(false);
      }
    })();
  }, [token, baseUrl]);

  const saveConfig = async (t: string, b?: string) => {
    if (!user) throw new Error("Not authenticated");
    const updates: any = { recai_api_token: t.trim() };
    if (b) updates.recai_base_url = b.trim() || API_BASE_DEFAULT;
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    if (error || (data as any)?.length === 0) {
      await supabase.from("profiles").insert({ user_id: user.id, ...updates });
    }
    setTokenState(t.trim());
    if (b) setBaseState(b.trim() || API_BASE_DEFAULT);
    clearRecaiConfigCache();
  };

  return {
    token,
    baseUrl,
    healthy,
    setToken: (t: string) => saveConfig(t),
    setBaseUrl: (u: string) => saveConfig(token, u),
  };
}
