import { useEffect, useState } from "react";
import { getToken, setToken, getBaseUrl, setBaseUrl, API_BASE_DEFAULT, health } from "@/lib/recai";

export function useRecaiAuth() {
  const [token, _setToken] = useState<string>(getToken());
  const [baseUrl, _setBase] = useState<string>(getBaseUrl());
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    // try health when token/base change
    (async () => {
      try {
        const h = await health();
        setHealthy(!!h);
      } catch (e) {
        setHealthy(false);
      }
    })();
  }, [token, baseUrl]);

  return {
    token,
    baseUrl,
    healthy,
    setToken: (t: string) => {
      setToken(t);
      _setToken(t);
    },
    setBaseUrl: (u: string) => {
      setBaseUrl(u || API_BASE_DEFAULT);
      _setBase(u || API_BASE_DEFAULT);
    },
  };
}
