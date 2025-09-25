// lib/util/network-info.ts
import { getPublicIP } from "./getPublicIP";

export interface NetworkInformation {
  effectiveType: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

export class NetworkInfo {
  // Browser's network info (may be null if unsupported)
  static getNetworkInfo(): NetworkInformation | null {
    try {
      const nav = navigator as Navigator & {
        connection?: NetworkInformation;
        mozConnection?: NetworkInformation;
        webkitConnection?: NetworkInformation;
      };
      const connection =
        nav.connection || nav.mozConnection || nav.webkitConnection;

      if (connection) {
        return {
          effectiveType: connection.effectiveType || "unknown",
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          type: connection.type || "unknown",
        };
      }
    } catch (error) {
      console.debug("Network info not available:", error);
    }

    return null;
  }

  // Local IPs via WebRTC
  static async getLocalIPs(): Promise<string[]> {
    return new Promise((resolve) => {
      if (typeof RTCPeerConnection === "undefined") {
        resolve([]);
        return;
      }

      const ips: Set<string> = new Set();
      const pc = new RTCPeerConnection({ iceServers: [] });

      const timeout = setTimeout(() => {
        pc.close();
        resolve(Array.from(ips));
      }, 2000);

      pc.createDataChannel("");

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          clearTimeout(timeout);
          pc.close();
          resolve(Array.from(ips));
          return;
        }

        const candidate = event.candidate.candidate;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9:]+)/gi;
        const matches = candidate.match(ipRegex);

        if (matches) {
          matches.forEach((ip) => {
            if (!ip.includes("local") && !ip.endsWith(".local")) {
              ips.add(ip);
            }
          });
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

  // Unified function
  static async getAllNetworkInfo() {
    const [localIPs, publicIP] = await Promise.all([
      this.getLocalIPs(),
      getPublicIP(), // <-- use your robust multi-endpoint IP fetcher
    ]);

    return {
      localIPs,
      networkInfo: this.getNetworkInfo(),
      publicIP: publicIP.ip,
      ipProvider: publicIP.provider,
    };
  }
}
