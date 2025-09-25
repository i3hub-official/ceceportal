// lib/utils/getPublicIP.ts

export interface PublicIPResult {
  ip: string | null;
  provider: string | null;
  isp?: string | null;
  asn?: string | null;
  country?: string | null;
}

export async function getPublicIP(): Promise<PublicIPResult> {
  type Parser =
    | ((input: Record<string, unknown>) => {
        ip: string | null;
        isp?: string;
        asn?: string;
        country?: string;
      })
    | ((res: Response) => Promise<{
        ip: string | null;
        isp?: string;
        asn?: string;
        country?: string;
      }>);

  const endpoints: {
    url: string;
    provider: string;
    parser: Parser;
  }[] = [
    {
      url: "https://api.ipify.org?format=json",
      provider: "ipify",
      parser: (input: Record<string, unknown> | Response) => {
        if (input instanceof Response)
          throw new Error("Expected JSON object, got Response");
        return { ip: input.ip as string };
      },
    },
    {
      url: "https://api64.ipify.org?format=json",
      provider: "ipify64",
      parser: (input: Record<string, unknown> | Response) => {
        if (input instanceof Response)
          throw new Error("Expected JSON object, got Response");
        return { ip: input.ip as string };
      },
    },
    {
      url: "https://ipapi.co/json/",
      provider: "ipapi",
      parser: (input: Record<string, unknown> | Response) => {
        if (input instanceof Response)
          throw new Error("Expected JSON object, got Response");
        return {
          ip: input.ip as string,
          isp: (input.org as string) || undefined,
          asn: (input.asn as string) || undefined,
          country: (input.country_name as string) || undefined,
        };
      },
    },
    {
      url: "https://jsonip.com",
      provider: "jsonip",
      parser: (input: Record<string, unknown> | Response) => {
        if (input instanceof Response)
          throw new Error("Expected JSON object, got Response");
        return {
          ip: typeof input.ip === "string" ? input.ip : null,
          country:
            typeof input.country === "string" ? input.country : undefined,
        };
      },
    },
    {
      url: "https://ipecho.net/plain",
      provider: "ipecho",
      parser: async (res: Response) => ({ ip: (await res.text()).trim() }),
    },
    {
      url: "https://icanhazip.com",
      provider: "icanhazip",
      parser: async (res: Response) => ({ ip: (await res.text()).trim() }),
    },
    {
      url: "https://ident.me",
      provider: "identme",
      parser: async (res: Response) => ({ ip: (await res.text()).trim() }),
    },
  ];

  for (const { url, provider, parser } of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json, text/plain, */*" },
      });

      clearTimeout(timeoutId);
      if (!res.ok) continue;

      let parsed: {
        ip: string | null;
        isp?: string;
        asn?: string;
        country?: string;
      };
      if (
        url.includes("plain") ||
        url.includes("icanhazip") ||
        url.includes("ident.me")
      ) {
        // text-based responses
        parsed = await (
          parser as (res: Response) => Promise<{
            ip: string | null;
            isp?: string;
            asn?: string;
            country?: string;
          }>
        )(res);
      } else {
        // JSON responses
        const data = await res.json();
        parsed = (
          parser as (data: Record<string, unknown>) => {
            ip: string | null;
            isp?: string;
            asn?: string;
            country?: string;
          }
        )(data);
      }

      const ip = parsed.ip;
      if (ip && isValidIP(ip)) {
        return {
          ip,
          provider,
          isp: parsed.isp ?? null,
          asn: parsed.asn ?? null,
          country: parsed.country ?? null,
        };
      }
    } catch (error) {
      console.debug(`Failed to get IP from ${provider}:`, error);
      continue;
    }
  }

  // WebRTC fallback
  try {
    const localIPs = await getLocalIPsFallback();
    if (localIPs.length > 0) {
      return { ip: localIPs[0], provider: "webrtc-local" };
    }
  } catch (error) {
    console.debug("WebRTC fallback failed:", error);
  }

  return { ip: null, provider: "none" };
}

// Helper: validate IP
function isValidIP(ip: string): boolean {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // Accept compressed IPv6 as well (:: shorthand)
  const ipv6Pattern = /^(([0-9a-f]{1,4}:){1,7}[0-9a-f]{0,4}|::)$/i;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

// WebRTC fallback
async function getLocalIPsFallback(): Promise<string[]> {
  return new Promise((resolve) => {
    if (typeof RTCPeerConnection === "undefined") {
      resolve([]);
      return;
    }

    const ips: string[] = [];
    const pc = new RTCPeerConnection({ iceServers: [] });
    const timeout = setTimeout(() => {
      pc.close();
      resolve([...new Set(ips)]);
    }, 2000);

    pc.createDataChannel("");
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const match = event.candidate.candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9:]+)/i
        );
        if (match && isValidIP(match[1])) {
          ips.push(match[1]);
        }
      } else {
        clearTimeout(timeout);
        pc.close();
        resolve([...new Set(ips)]);
      }
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        clearTimeout(timeout);
        resolve([]);
      });
  });
}

// Quick helper
export async function getSimplePublicIP(): Promise<string | null> {
  try {
    const res = await fetch("https://icanhazip.com", {
      signal: AbortSignal.timeout(3000),
    });
    const ip = (await res.text()).trim();
    return isValidIP(ip) ? ip : null;
  } catch {
    return null;
  }
}
