import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useRecaiAuth } from "./useRecaiAuth";
import { listInstances, createInstance, initializeCategories, clearRecaiConfigCache } from "@/lib/recai";

/**
 * Ensures each authenticated user has:
 * - a unique RecAI token (defaults to the user's auth.id if missing)
 * - a default RecAI instance created and stored in profiles.default_instance_id
 */
export function useEnsureRecaiWorkspace() {
  const { user } = useAuth();
  const { token, setToken } = useRecaiAuth();
  const running = useRef(false);

  useEffect(() => {
    (async () => {
      if (!user || running.current) return;
      running.current = true;
      try {
        // Read current profile values
        const { data: profile } = await supabase
          .from("profiles")
          .select("recai_api_token, default_instance_id, display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        // 1) Ensure per-user token (if empty)
        let effectiveToken = (profile?.recai_api_token || "").trim();
        if (!effectiveToken) {
          const newToken = user.id; // per-user isolation using auth uid
          await supabase
            .from("profiles")
            .upsert({ user_id: user.id, recai_api_token: newToken })
            .eq("user_id", user.id);
          // Update in-memory client cache
          await setToken(newToken);
          effectiveToken = newToken;
        }

        // Clear cached config to ensure subsequent API calls use latest token
        clearRecaiConfigCache();

        // 2) Ensure default instance exists and is saved
        if (!profile?.default_instance_id) {
          const listed = await listInstances();
          let instanceId: string | undefined = listed?.instances?.[0]?.id;

          if (!instanceId) {
            const name = profile?.display_name
              ? `${profile.display_name}'s Workspace`
              : "Personal expenses";
            const created: any = await createInstance({ name });
            instanceId = created?.instance_id;
            if (instanceId) {
              try {
                await initializeCategories(
                  instanceId,
                  "Food, Transportation, Entertainment, Shopping, Utilities, Healthcare, Travel, Business"
                );
              } catch {
                // non-blocking
              }
            }
          }

          if (instanceId) {
            await supabase
              .from("profiles")
              .update({ default_instance_id: instanceId })
              .eq("user_id", user.id);
          }
        }
      } catch (e) {
        // Swallow; we don't block the UI
        console.warn("useEnsureRecaiWorkspace warning:", e);
      } finally {
        running.current = false;
      }
    })();
  }, [user, setToken, token]);
}
